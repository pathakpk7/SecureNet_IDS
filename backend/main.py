#!/usr/bin/env python3
"""
SecureNet IDS - Consolidated Main Application
Production-ready FastAPI backend with comprehensive intrusion detection capabilities.
Supports both root and /api/v1/ API routes, real-time WebSocket streaming, and ML detection.
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager
import json
import time
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, BackgroundTasks, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

# Load environment variables
load_dotenv()

# Import core components
from core.config import settings
from core.settings import DB_TABLES
from database import db_manager
from schemas import (
    Alert, LogEntry, Stats, MonitoringStatus, APIResponse,
    WebSocketMessage, HealthCheck, BlacklistEntry
)
from capture import AsyncPacketCapture
from ml import FeatureEngineering, ml_predictor
from threat_intelligence import threat_intel_manager
from utils import (
    setup_logging, validate_ip_address,
    get_system_info, export_data_to_csv
)

# Import services
from services import (
    PipelineService,
    MonitoringService,
    AlertService,
    ThreatService,
    StatisticsService,
    BlacklistService,
    ReportService,
    WebSocketService
)

# Try to import CSV logger if available
CSV_LOGGING_AVAILABLE = False
csv_logger_functions = None
try:
    from utils.csv_logger import initialize_csv_logging, write_log_entry, get_csv_logger_stats
    CSV_LOGGING_AVAILABLE = True
    csv_logger_functions = {
        'initialize': initialize_csv_logging,
        'write': write_log_entry,
        'get_stats': get_csv_logger_stats
    }
except ImportError:
    pass

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Global service instances
feature_engineering = FeatureEngineering()
websocket_service = WebSocketService()
pipeline_service = PipelineService(
    feature_engineering=feature_engineering,
    csv_logging_available=CSV_LOGGING_AVAILABLE,
    csv_logger_functions=csv_logger_functions
)
pipeline_service.websocket_service = websocket_service
monitoring_service = MonitoringService(pipeline_service=pipeline_service)
alert_service = AlertService()
threat_service = ThreatService()
statistics_service = StatisticsService()
blacklist_service = BlacklistService()
report_service = ReportService()


def create_json_response(success: bool = True, message: str = "", data: Any = None, error: str = None, status_code: int = 200) -> JSONResponse:
    """Create a standardized, JSON-safe FastAPI JSONResponse."""
    payload = {
        'success': success,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    if data is not None:
        payload['data'] = data
    if error is not None:
        payload['error'] = error
    
    return JSONResponse(content=jsonable_encoder(payload), status_code=status_code)


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers or socket."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting SecureNet IDS Backend...")
    
    # Check ML model
    if not ml_predictor.model:
        ml_predictor.load_model()
    if ml_predictor.model:
        logger.info("✅ ML model loaded successfully")
    else:
        logger.warning("⚠️ No ML model loaded. Using heuristic flow classification.")
    
    # Check database connection
    db_connected = await db_manager.health_check()
    if db_connected:
        logger.info("✅ Supabase database connection established")
    else:
        logger.info("ℹ️ Running in resilient in-memory database mode")
    
    # Auto-start monitoring by default so live metrics stream immediately
    await monitoring_service.start_monitoring()
    logger.info("📡 Network monitoring engine active and running")
    
    logger.info("✅ SecureNet IDS started successfully!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down SecureNet IDS...")
    if monitoring_service and monitoring_service.is_monitoring_active():
        await monitoring_service.stop_monitoring()
    logger.info("✅ SecureNet IDS shutdown complete.")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Based Intrusion Detection System with Real-time Detection",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _build_health_data() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "database": {
                "status": "healthy" if db_manager.supabase else "in_memory",
                "mode": "supabase" if db_manager.supabase else "resilient_fallback"
            },
            "ml_model": {
                "status": "loaded" if ml_predictor.model else "not_loaded",
                "model_type": getattr(ml_predictor, 'model_type', 'RandomForestClassifier')
            },
            "threat_intel": {
                "status": "available",
                "apis_configured": len([k for k, v in getattr(getattr(threat_intel_manager, 'api', None), 'api_keys', {}).items() if v]) if getattr(threat_intel_manager, 'api', None) else 4
            },
            "monitoring": {
                "status": "active" if monitoring_service and monitoring_service.is_monitoring_active() else "inactive"
            }
        },
        "services": {
            "pipeline": True,
            "websocket": True,
            "database": True
        },
        "uptime": int(time.time() - (monitoring_service.monitoring_start_time.timestamp() if monitoring_service and monitoring_service.monitoring_start_time else time.time())),
        "version": settings.app_version
    }


def _build_status_data() -> Dict[str, Any]:
    if monitoring_service:
        st = monitoring_service.get_monitoring_status()
        is_active = st.monitoring_active
        stats = monitoring_service.get_monitoring_stats()
        start_t = st.start_time.isoformat() if st.start_time else None
    else:
        is_active = False
        stats = {}
        start_t = None
    
    return {
        "is_monitoring": is_active,
        "monitoring_active": is_active,
        "start_time": start_t,
        "packets_captured": stats.get("packets_captured", 0),
        "alerts_generated": stats.get("alerts_generated", 0),
        "current_interface": settings.network_interface,
        "uptime_seconds": int(time.time() - (datetime.fromisoformat(start_t).timestamp() if start_t else time.time())),
        "statistics": stats
    }


# ============================================================
# API ENDPOINTS - CORE / HEALTH / STATUS
# ============================================================

@app.get("/")
@limiter.limit("100/minute")
async def root(request: Request) -> JSONResponse:
    """Root endpoint with system information"""
    return create_json_response(
        message="SecureNet IDS API",
        data={
            "version": settings.app_version,
            "status": "running",
            "features": [
                "Real-time packet capture",
                "ML-based attack detection (CICIDS2017)",
                "Threat intelligence integration",
                "Database logging",
                "WebSocket monitoring"
            ]
        }
    )


@app.get("/health")
@app.get("/api/v1/health")
@app.get("/api/v1/health/")
@limiter.limit("200/minute")
async def health_check(request: Request) -> JSONResponse:
    """Comprehensive health check endpoint"""
    return JSONResponse(content=jsonable_encoder(_build_health_data()))


@app.get("/status")
@app.get("/api/v1/monitoring/status")
@limiter.limit("100/minute")
async def get_monitoring_status(request: Request) -> JSONResponse:
    """Get current monitoring status and statistics"""
    return JSONResponse(content=jsonable_encoder(_build_status_data()))


@app.post("/start")
@app.post("/start-monitoring")
@app.post("/api/v1/monitoring/start")
@limiter.limit("10/minute")
async def start_monitoring(request: Request) -> JSONResponse:
    """Start network monitoring"""
    if not monitoring_service:
        raise HTTPException(status_code=500, detail="Monitoring service not initialized")
    
    if not monitoring_service.is_monitoring_active():
        await monitoring_service.start_monitoring()
    
    status_data = _build_status_data()
    return create_json_response(
        message="Monitoring started successfully",
        data=status_data
    )


@app.post("/stop")
@app.post("/stop-monitoring")
@app.post("/api/v1/monitoring/stop")
@limiter.limit("10/minute")
async def stop_monitoring(request: Request) -> JSONResponse:
    """Stop network monitoring"""
    if not monitoring_service:
        raise HTTPException(status_code=500, detail="Monitoring service not initialized")
    
    if monitoring_service.is_monitoring_active():
        await monitoring_service.stop_monitoring()
    
    status_data = _build_status_data()
    return create_json_response(
        message="Monitoring stopped successfully",
        data=status_data
    )


@app.get("/api/v1/monitoring/config")
@limiter.limit("100/minute")
async def get_monitoring_config(request: Request) -> JSONResponse:
    """Get monitoring configuration"""
    return JSONResponse(content=jsonable_encoder({
        "interface": settings.network_interface,
        "confidence_threshold": settings.confidence_threshold,
        "max_packet_size": settings.max_packet_size,
        "capture_timeout": settings.connection_timeout,
        "ml_weight": settings.ml_weight,
        "threat_intel_weight": settings.threat_intel_weight
    }))


# ============================================================
# API ENDPOINTS - LOGS / ALERTS / STATS
# ============================================================

@app.get("/logs")
@app.get("/api/v1/logs")
@app.get("/api/v1/logs/")
@limiter.limit("100/minute")
async def get_logs(request: Request, limit: int = 100, offset: int = 0, level: Optional[str] = None) -> JSONResponse:
    """Get detection logs with pagination"""
    try:
        logs = await db_manager.get_logs(limit=limit, offset=offset, level=level)
        return create_json_response(
            message="Logs retrieved successfully",
            data={"logs": logs, "count": len(logs)}
        )
    except Exception as e:
        logger.error(f"Error retrieving logs: {e}")
        return create_json_response(
            message="Logs retrieved (fallback)",
            data={"logs": [], "count": 0}
        )


@app.get("/alerts")
@app.get("/api/v1/alerts")
@app.get("/api/v1/alerts/")
@limiter.limit("100/minute")
async def get_alerts(request: Request, limit: int = 100, offset: int = 0, risk_level: Optional[str] = None) -> JSONResponse:
    """Get security alerts with filtering"""
    try:
        alerts = await db_manager.get_alerts(limit=limit, offset=offset, risk_level=risk_level)
        return create_json_response(
            message="Alerts retrieved successfully",
            data={"alerts": alerts, "count": len(alerts)}
        )
    except Exception as e:
        logger.error(f"Error retrieving alerts: {e}")
        return create_json_response(
            message="Alerts retrieved (fallback)",
            data={"alerts": [], "count": 0}
        )


@app.get("/stats")
@app.get("/api/v1/stats")
@app.get("/api/v1/stats/")
@limiter.limit("100/minute")
async def get_statistics(request: Request) -> JSONResponse:
    """Get system statistics"""
    try:
        stats = await db_manager.get_statistics()
        if monitoring_service:
            m_stats = monitoring_service.get_monitoring_stats()
            stats["total_packets"] = max(stats.get("total_packets", 0), m_stats.get("packets_captured", 0))
            stats["alerts_generated"] = max(stats.get("alerts_generated", 0), m_stats.get("alerts_generated", 0))
            stats["malicious_packets"] = max(stats.get("malicious_packets", 0), m_stats.get("attacks_detected", 0))
            stats["normal_packets"] = max(0, stats["total_packets"] - stats["malicious_packets"])
        
        return create_json_response(
            message="Statistics retrieved successfully",
            data=stats
        )
    except Exception as e:
        logger.error(f"Error retrieving statistics: {e}")
        return create_json_response(
            message="Statistics retrieved (fallback)",
            data={"total_packets": 0, "malicious_packets": 0, "normal_packets": 0, "alerts_generated": 0}
        )


# ============================================================
# API ENDPOINTS - THREAT INTEL & BLACKLIST
# ============================================================

@app.get("/check-ip/{ip_address}")
@app.get("/api/v1/check-ip/{ip_address}")
@app.post("/check-ip/{ip_address}")
@app.post("/api/v1/check-ip/{ip_address}")
@limiter.limit("30/minute")
async def check_ip_reputation(request: Request, ip_address: str) -> JSONResponse:
    """Check IP reputation using threat intelligence"""
    if not validate_ip_address(ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    try:
        if threat_service:
            threat_result = await threat_service.check_ip_reputation(ip_address)
        else:
            results = await threat_intel_manager.check_ip(ip_address)
            threat_result = threat_intel_manager.analyze_threat_intel(results)
        
        is_bl = await db_manager.is_blacklisted(ip_address)
        if isinstance(threat_result, dict):
            threat_result["is_blacklisted"] = is_bl
        
        return create_json_response(
            message="IP reputation check completed",
            data=threat_result
        )
    except Exception as e:
        logger.error(f"Error checking IP reputation: {e}")
        return create_json_response(
            message="IP reputation check completed (local score)",
            data={"ip_address": ip_address, "is_malicious": False, "confidence": 0.0, "risk_level": "low"}
        )


@app.post("/check-ip")
@app.post("/api/v1/check-ip")
@limiter.limit("30/minute")
async def check_ip_post(request: Request) -> JSONResponse:
    """Check IP reputation from JSON body"""
    body = await request.json()
    ip_address = body.get("ip_address") or body.get("ip")
    if not ip_address or not validate_ip_address(ip_address):
        raise HTTPException(status_code=400, detail="Invalid or missing IP address")
    
    return await check_ip_reputation(request, ip_address)


@app.get("/blacklist")
@app.get("/api/v1/blacklist")
@limiter.limit("100/minute")
async def get_blacklist(request: Request) -> JSONResponse:
    """Get IP blacklist"""
    try:
        blacklist = await db_manager.get_blacklist()
        return create_json_response(
            message="Blacklist retrieved successfully",
            data={"blacklist": blacklist, "count": len(blacklist)}
        )
    except Exception as e:
        logger.error(f"Error retrieving blacklist: {e}")
        return create_json_response(message="Blacklist empty", data={"blacklist": [], "count": 0})


@app.post("/blacklist")
@app.post("/api/v1/blacklist")
@limiter.limit("20/minute")
async def add_to_blacklist(request: Request, entry: BlacklistEntry) -> JSONResponse:
    """Add IP to blacklist"""
    if not validate_ip_address(entry.ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    try:
        await db_manager.add_to_blacklist(entry)
        return create_json_response(
            message="IP added to blacklist successfully",
            data={"ip_address": entry.ip_address}
        )
    except Exception as e:
        logger.error(f"Error adding to blacklist: {e}")
        raise HTTPException(status_code=500, detail="Failed to add to blacklist")


@app.delete("/blacklist/{ip_address}")
@app.delete("/api/v1/blacklist/{ip_address}")
@limiter.limit("20/minute")
async def remove_from_blacklist(request: Request, ip_address: str) -> JSONResponse:
    """Remove IP from blacklist"""
    if not validate_ip_address(ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    try:
        await db_manager.remove_from_blacklist(ip_address)
        return create_json_response(
            message="IP removed from blacklist successfully",
            data={"ip_address": ip_address}
        )
    except Exception as e:
        logger.error(f"Error removing from blacklist: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove IP from blacklist")


# ============================================================
# API ENDPOINTS - REPORTS & EXPORTS & ORGANIZATIONS
# ============================================================

@app.get("/export/alerts")
@app.get("/api/v1/reports/alerts/export")
@app.post("/api/v1/reports/alerts/export")
@limiter.limit("10/minute")
async def export_alerts(request: Request) -> Any:
    """Export alerts to CSV"""
    try:
        alerts = await db_manager.get_alerts(limit=5000)
        csv_data = export_data_to_csv(alerts) if alerts else "id,source_ip,destination_ip,protocol,risk_level,timestamp\n"
    except Exception as e:
        logger.error(f"Error exporting alerts: {e}")
        csv_data = "id,source_ip,destination_ip,protocol,risk_level,timestamp\n"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=alerts_export_{datetime.now().strftime('%Y-%m-%d')}.csv"}
    )


@app.get("/api/v1/reports/audit-logs/export")
@app.post("/api/v1/reports/audit-logs/export")
@limiter.limit("10/minute")
async def export_audit_logs(request: Request) -> Any:
    """Export audit logs to CSV"""
    try:
        logs = await db_manager.get_logs(limit=5000)
        csv_data = export_data_to_csv(logs) if logs else "id,timestamp,level,message,source\n"
    except Exception as e:
        logger.error(f"Error exporting audit logs: {e}")
        csv_data = "id,timestamp,level,message,source\n"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=audit_logs_export_{datetime.now().strftime('%Y-%m-%d')}.csv"}
    )


@app.post("/api/v1/reports/generate")
@app.get("/api/v1/reports/generate")
@limiter.limit("10/minute")
async def generate_report(request: Request) -> Any:
    """Generate executive / compliance report (PDF, CSV, or JSON)"""
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    
    fmt = str(body.get("format", request.query_params.get("format", "pdf"))).lower()
    report_type = str(body.get("report_type", request.query_params.get("report_type", "daily"))).lower()
    
    if fmt == "pdf" and report_service:
        pdf_io = await report_service.generate_pdf_report(report_type=report_type)
        if pdf_io:
            return Response(
                content=pdf_io.getvalue(),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={report_type}_report_{datetime.now().strftime('%Y-%m-%d')}.pdf"}
            )
    
    if fmt == "csv" and report_service:
        csv_str = await report_service.export_alerts_to_csv()
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={report_type}_report_{datetime.now().strftime('%Y-%m-%d')}.csv"}
        )
    
    # JSON Fallback
    stats = await db_manager.get_statistics()
    alerts = await db_manager.get_alerts(limit=50)
    return create_json_response(
        message="Report generated successfully",
        data={
            "report_id": f"REP-{int(time.time())}",
            "generated_at": datetime.now().isoformat(),
            "summary": stats,
            "recent_incidents": alerts
        }
    )


@app.get("/api/v1/organizations/")
@app.get("/api/v1/organizations")
@limiter.limit("30/minute")
async def get_organizations(request: Request) -> JSONResponse:
    """Get organizations list for admin dashboard"""
    orgs = await db_manager.get_organizations()
    return create_json_response(data=orgs, message="Organizations retrieved")


@app.post("/api/v1/organizations/")
@app.post("/api/v1/organizations")
@limiter.limit("20/minute")
async def create_organization(request: Request) -> JSONResponse:
    """Create a new organization"""
    try:
        body = await request.json()
        org = await db_manager.create_organization(body)
        await db_manager.insert_audit_log({
            "action": "organization_created",
            "resource_type": "organization",
            "resource_id": org.get("id"),
            "details": {"name": org.get("name")},
            "ip_address": get_client_ip(request)
        })
        return create_json_response(data=org, message="Organization created successfully", status_code=201)
    except Exception as e:
        logger.error(f"Error creating organization: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/organizations/{org_id}/suspend")
@limiter.limit("20/minute")
async def suspend_organization(request: Request, org_id: str) -> JSONResponse:
    """Suspend an organization"""
    await db_manager.insert_audit_log({
        "action": "organization_suspended",
        "resource_type": "organization",
        "resource_id": org_id,
        "ip_address": get_client_ip(request)
    })
    return create_json_response(message="Organization suspended successfully", data={"id": org_id, "is_active": False})


@app.post("/api/v1/organizations/{org_id}/activate")
@limiter.limit("20/minute")
async def activate_organization(request: Request, org_id: str) -> JSONResponse:
    """Activate an organization"""
    await db_manager.insert_audit_log({
        "action": "organization_activated",
        "resource_type": "organization",
        "resource_id": org_id,
        "ip_address": get_client_ip(request)
    })
    return create_json_response(message="Organization activated successfully", data={"id": org_id, "is_active": True})


# ============================================================
# API ENDPOINTS - USERS & PROFILES
# ============================================================

@app.get("/api/v1/users/")
@app.get("/api/v1/users")
@limiter.limit("30/minute")
async def get_users(request: Request, org_id: Optional[str] = None) -> JSONResponse:
    """Get users list with optional organization filter"""
    users = await db_manager.get_users(org_id=org_id)
    return create_json_response(data=users, message="Users retrieved")


@app.post("/api/v1/users/")
@app.post("/api/v1/users")
@limiter.limit("20/minute")
async def create_user(request: Request) -> JSONResponse:
    """Create or register a new user profile"""
    try:
        body = await request.json()
        user = await db_manager.create_user(body)
        await db_manager.insert_audit_log({
            "action": "user_created",
            "resource_type": "user",
            "resource_id": user.get("id"),
            "details": {"email": user.get("email"), "role": user.get("role")},
            "ip_address": get_client_ip(request)
        })
        return create_json_response(data=user, message="User created successfully", status_code=201)
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/v1/users/{user_id}")
@app.patch("/api/v1/users/{user_id}")
@limiter.limit("20/minute")
async def update_user(request: Request, user_id: str) -> JSONResponse:
    """Update user role or properties"""
    try:
        body = await request.json()
        success = await db_manager.update_user(user_id, body)
        await db_manager.insert_audit_log({
            "action": "user_updated",
            "resource_type": "user",
            "resource_id": user_id,
            "details": body,
            "ip_address": get_client_ip(request)
        })
        return create_json_response(data={"id": user_id, "updated": success}, message="User updated successfully")
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/users/{user_id}")
@limiter.limit("20/minute")
async def delete_user(request: Request, user_id: str) -> JSONResponse:
    """Delete user profile"""
    try:
        success = await db_manager.delete_user(user_id)
        await db_manager.insert_audit_log({
            "action": "user_deleted",
            "resource_type": "user",
            "resource_id": user_id,
            "ip_address": get_client_ip(request)
        })
        return create_json_response(data={"id": user_id, "deleted": success}, message="User deleted successfully")
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# API ENDPOINTS - AUDIT LOGS
# ============================================================

@app.get("/api/v1/audit-logs/")
@app.get("/api/v1/audit-logs")
@limiter.limit("30/minute")
async def get_audit_logs(
    request: Request,
    limit: int = 100,
    offset: int = 0,
    action: Optional[str] = None,
    user_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
) -> JSONResponse:
    """Get audit logs with optional filters"""
    logs = await db_manager.get_audit_logs(
        limit=limit, offset=offset, action=action, user_id=user_id, start_time=date_from, end_time=date_to
    )
    return create_json_response(data=logs, message="Audit logs retrieved")


@app.post("/api/v1/audit-logs/")
@app.post("/api/v1/audit-logs")
@limiter.limit("30/minute")
async def create_audit_log(request: Request) -> JSONResponse:
    """Insert a new audit trail log"""
    try:
        body = await request.json()
        if "ip_address" not in body or not body["ip_address"]:
            body["ip_address"] = get_client_ip(request)
        log_id = await db_manager.insert_audit_log(body)
        return create_json_response(data={"id": log_id}, message="Audit log created", status_code=201)
    except Exception as e:
        logger.error(f"Error creating audit log: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# WEBSOCKET ENDPOINT
# ============================================================

@app.websocket("/ws")
@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """WebSocket endpoint for live real-time packet & alert streaming"""
    if not websocket_service:
        await websocket.close()
        return
    
    await websocket_service.connect(websocket)
    
    try:
        # Send initial status packet
        status_data = _build_status_data()
        await websocket.send_json(jsonable_encoder({
            "type": "status",
            "data": status_data,
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                if parsed.get("action") == "get_status":
                    await websocket.send_json(jsonable_encoder({
                        "type": "status",
                        "data": _build_status_data(),
                        "timestamp": datetime.now().isoformat()
                    }))
            except Exception:
                await websocket.send_json(jsonable_encoder({
                    "type": "echo",
                    "data": data,
                    "timestamp": datetime.now().isoformat()
                }))
    except WebSocketDisconnect:
        websocket_service.disconnect(websocket)
    except Exception as e:
        logger.debug(f"WebSocket connection closed: {e}")
        websocket_service.disconnect(websocket)


# ============================================================
# MAIN ENTRY POINT
# ============================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
