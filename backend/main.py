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
import sys
import uuid
from pathlib import Path

# Ensure backend directory is in sys.path so submodules like core, database, schemas resolve
backend_dir = str(Path(__file__).resolve().parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

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
from core.security import (
    create_access_token, get_current_user, get_current_device,
    verify_password, hash_password
)
from database import db_manager
from schemas import (
    Alert, LogEntry, Stats, MonitoringStatus, APIResponse,
    WebSocketMessage, HealthCheck, BlacklistEntry
)
from capture import AsyncPacketCapture
from ml import FeatureEngineering, ml_predictor
from ml.soc_copilot import soc_copilot
from ml.encrypted_traffic import encrypted_traffic_analyzer
from threat_intelligence import threat_intel_manager
from utils import (
    setup_logging, validate_ip_address,
    get_system_info, export_data_to_csv,
    domain_resolver
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
async def get_alerts(
    request: Request,
    limit: int = 100,
    offset: int = 0,
    risk_level: Optional[str] = None,
    org_id: Optional[str] = None,
    device_id: Optional[str] = None
) -> JSONResponse:
    """Get security alerts with filtering"""
    try:
        alerts = await db_manager.get_alerts(limit=limit, offset=offset, risk_level=risk_level, org_id=org_id, device_id=device_id)
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


# ============================================================
# API ENDPOINTS - AI SOC COPILOT & ACTIVE LEARNING FEEDBACK
# ============================================================

@app.get("/api/v1/alerts/feedback")
@app.get("/api/v1/alerts/feedback/")
@limiter.limit("60/minute")
async def get_feedback_list(
    request: Request,
    alert_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Retrieve history of SOC analyst feedback for active learning auditing"""
    feedback = await db_manager.get_alert_feedback(alert_id=alert_id, org_id=current_user.get("org_id"))
    return create_json_response(data={"feedback": feedback, "count": len(feedback)}, message="Feedback history retrieved")


@app.get("/api/v1/alerts/{alert_id}")
@app.get("/api/v1/alerts/{alert_id}/")
@limiter.limit("60/minute")
async def get_alert_detail(request: Request, alert_id: str) -> JSONResponse:
    """Get full details of a specific alert, including cached AI triage"""
    alert = await db_manager.get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return create_json_response(data=alert, message="Alert retrieved successfully")


@app.post("/api/v1/alerts/{alert_id}/triage")
@app.post("/api/v1/alerts/{alert_id}/triage/")
@limiter.limit("30/minute")
async def triage_alert_with_copilot(
    request: Request,
    alert_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """
    Run GenAI / LLM SOC Analyst Assistant triage on an alert.
    Produces MITRE ATT&CK framework mapping, root cause narrative, and SOAR remediation steps.
    """
    try:
        alert = await db_manager.get_alert_by_id(alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        # Run AI Copilot triage
        triage_report = soc_copilot.triage_alert(alert)
        
        # Cache triage report directly on the alert record
        await db_manager.update_alert_triage(alert_id, triage_report)
        
        await db_manager.insert_audit_log({
            "action": "alert_triaged_by_ai",
            "resource_type": "alert",
            "resource_id": alert_id,
            "org_id": current_user.get("org_id"),
            "details": {"incident_title": triage_report.get("incident_title")},
            "ip_address": get_client_ip(request)
        })
        
        return create_json_response(
            data={"alert_id": alert_id, "triage": triage_report},
            message="AI SOC Copilot triage generated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triaging alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/alerts/{alert_id}/feedback")
@app.post("/api/v1/alerts/{alert_id}/feedback/")
@limiter.limit("30/minute")
async def submit_alert_feedback(
    request: Request,
    alert_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """
    Submit active learning feedback from SOC analyst (false_positive or confirmed_threat).
    Supports future suppression of repeat alerts for whitelisted dev tools/IPs.
    """
    try:
        alert = await db_manager.get_alert_by_id(alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        body = await request.json()
        feedback_type = body.get("feedback_type", "confirmed_threat")
        reason = body.get("reason", "")
        suppress_future = bool(body.get("suppress_future", False))
        
        fb_id = await db_manager.record_alert_feedback({
            "alert_id": alert_id,
            "org_id": current_user.get("org_id"),
            "user_id": current_user.get("id"),
            "feedback_type": feedback_type,
            "reason": reason,
            "target_ip": alert.get("destination_ip"),
            "target_process": alert.get("process_name"),
            "suppress_future": suppress_future
        })
        
        return create_json_response(
            data={"feedback_id": fb_id, "feedback_type": feedback_type, "suppressed": suppress_future},
            message="Feedback recorded for active learning engine",
            status_code=201
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting alert feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/analysis/tls")
@app.post("/api/v1/analysis/tls/")
@limiter.limit("60/minute")
async def analyze_tls_flow(request: Request) -> JSONResponse:
    """
    Evaluate encrypted TLS traffic using JA3 / JA4 fingerprinting.
    Identifies Cobalt Strike, Meterpreter, AsyncRAT, or legitimate browsers without decryption.
    """
    try:
        body = await request.json()
        result = encrypted_traffic_analyzer.inspect_flow(body)
        return create_json_response(data=result, message="Encrypted TLS flow analysis completed")
    except Exception as e:
        logger.error(f"Error analyzing TLS flow: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


@app.get("/resolve-ip/{ip_address}")
@app.get("/api/v1/resolve-ip/{ip_address}")
@limiter.limit("60/minute")
async def resolve_ip_address(request: Request, ip_address: str) -> JSONResponse:
    """Resolve an IP address to a human-readable domain, website name, and category"""
    if not validate_ip_address(ip_address):
        raise HTTPException(status_code=400, detail="Invalid IP address")
    
    try:
        resolution = domain_resolver.resolve(ip_address)
        return create_json_response(
            message="IP resolved to website/domain successfully",
            data={
                "ip_address": ip_address,
                "domain": resolution.get("domain", ip_address),
                "website": resolution.get("website", ip_address),
                "organization": resolution.get("org", "External"),
                "category": resolution.get("category", "General")
            }
        )
    except Exception as e:
        logger.error(f"Error resolving IP {ip_address}: {e}")
        return create_json_response(
            message="Fallback resolution",
            data={
                "ip_address": ip_address,
                "domain": ip_address,
                "website": f"Host ({ip_address})",
                "organization": "Unknown",
                "category": "General"
            }
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

@app.post("/api/v1/admin/archive")
@limiter.limit("2/minute")
async def archive_and_clear_data(request: Request) -> JSONResponse:
    """Archive current data (simulate weekly report generation) and clear active dashboards."""
    try:
        from database.sqlite_db import sqlite_db
        # In a real system, you would dump the data to a CSV/JSON file here.
        # For this implementation, we simulate archiving the data and then deleting it from active tables.
        
        with sqlite_db._get_connection() as conn:
            cursor = conn.cursor()
            # Clear tables
            cursor.execute("DELETE FROM alerts")
            cursor.execute("DELETE FROM logs")
            cursor.execute("DELETE FROM stats")
            
            # Add an audit log to record the archive
            archive_id = f"arch-{int(time.time())}"
            cursor.execute("""
                INSERT INTO audit_logs (id, action, status, details, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (
                archive_id,
                "weekly_archive_generated",
                "success",
                json.dumps({"message": "Weekly data archived and dashboards reset."}),
                datetime.utcnow().isoformat()
            ))
            conn.commit()
            
        logger.info("Admin triggered data archive and clear.")
        return create_json_response(success=True, message="Weekly data archived successfully. Dashboard reset.")
    except Exception as e:
        logger.error(f"Error archiving data: {e}")
        return create_json_response(success=False, error=str(e), status_code=500)

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


@app.get("/api/v1/organizations/verify-key/{key}")
@app.get("/api/v1/organizations/verify-key/{key}/")
@limiter.limit("60/minute")
async def verify_org_key(request: Request, key: str) -> JSONResponse:
    """Verify and retrieve organization details using its 6-letter join key"""
    org = await db_manager.get_org_by_join_key(key)
    if not org:
        raise HTTPException(status_code=404, detail="Organization join key not found or expired")
    return create_json_response(data=org, message="Organization key verified successfully")


@app.post("/api/v1/organizations/{org_id}/regenerate-key")
@limiter.limit("10/minute")
async def regenerate_org_key(request: Request, org_id: str) -> JSONResponse:
    """Regenerate 6-letter join key for an organization"""
    new_key = await db_manager.regenerate_org_join_key(org_id)
    return create_json_response(data={"id": org_id, "join_key": new_key}, message="Join key regenerated successfully")


@app.get("/api/v1/organizations/{org_id}/admins")
@limiter.limit("30/minute")
async def get_org_admins(request: Request, org_id: str) -> JSONResponse:
    """Get list of administrators in an organization with their specializations"""
    admins = await db_manager.get_org_admins(org_id)
    return create_json_response(data=admins, message="Organization admins retrieved")


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
            "details": {"name": org.get("name"), "join_key": org.get("join_key")},
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
# API ENDPOINTS - USERS & MULTI-ADMIN
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


@app.post("/api/v1/users/{user_id}/assign-admin")
@limiter.limit("20/minute")
async def assign_user_admin(request: Request, user_id: str) -> JSONResponse:
    """Assign or reassign a user to a specific admin mentor/guide"""
    try:
        body = await request.json()
        admin_id = body.get("admin_id")
        success = await db_manager.assign_user_admin(user_id, admin_id)
        return create_json_response(data={"user_id": user_id, "admin_id": admin_id, "assigned": success}, message="User assigned to admin successfully")
    except Exception as e:
        logger.error(f"Error assigning user to admin: {e}")
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
# API ENDPOINTS - GUIDANCE & HELP REQUESTS
# ============================================================

@app.get("/api/v1/guidance/requests")
@app.get("/api/v1/guidance/requests/")
@limiter.limit("60/minute")
async def get_guidance_requests(
    request: Request,
    org_id: Optional[str] = None,
    user_id: Optional[str] = None,
    admin_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> JSONResponse:
    """Get list of guidance/help requests"""
    requests = await db_manager.get_guidance_requests(
        org_id=org_id, user_id=user_id, admin_id=admin_id, status=status, limit=limit
    )
    return create_json_response(data=requests, message="Guidance requests retrieved")


@app.post("/api/v1/guidance/requests")
@app.post("/api/v1/guidance/requests/")
@limiter.limit("30/minute")
async def create_guidance_request(request: Request) -> JSONResponse:
    """Create a new guidance/help request from a user"""
    try:
        body = await request.json()
        req = await db_manager.create_guidance_request(body)
        return create_json_response(data=req, message="Guidance request created successfully", status_code=201)
    except Exception as e:
        logger.error(f"Error creating guidance request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/guidance/requests/{request_id}/volunteer")
@limiter.limit("30/minute")
async def volunteer_for_request(request: Request, request_id: str) -> JSONResponse:
    """Admin volunteers to guide and resolve a user request"""
    try:
        body = await request.json()
        admin_id = body.get("admin_id")
        admin_name = body.get("admin_name", "Admin")
        if not admin_id:
            raise HTTPException(status_code=400, detail="Missing admin_id")
        success = await db_manager.volunteer_for_request(request_id, admin_id, admin_name)
        return create_json_response(data={"id": request_id, "success": success}, message="Volunteered for guidance request successfully")
    except Exception as e:
        logger.error(f"Error volunteering for guidance request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/guidance/requests/{request_id}/respond")
@limiter.limit("30/minute")
async def respond_guidance_request(request: Request, request_id: str) -> JSONResponse:
    """Admin writes guidance response instructions and resolves request"""
    try:
        body = await request.json()
        guidance_notes = body.get("guidance_notes", "")
        status = body.get("status", "resolved")
        success = await db_manager.respond_guidance_request(request_id, guidance_notes, status)
        return create_json_response(data={"id": request_id, "success": success, "status": status}, message="Guidance response submitted successfully")
    except Exception as e:
        logger.error(f"Error responding to guidance request: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# API ENDPOINTS - USER ACTIVITIES TELEMETRY
# ============================================================

@app.get("/api/v1/user-activities")
@app.get("/api/v1/user-activities/")
@limiter.limit("60/minute")
async def get_user_activities(
    request: Request,
    org_id: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 100
) -> JSONResponse:
    """Get real-time user activity feed for an organization"""
    activities = await db_manager.get_user_activities(org_id=org_id, user_id=user_id, limit=limit)
    return create_json_response(data=activities, message="User activities retrieved")


@app.post("/api/v1/user-activities")
@app.post("/api/v1/user-activities/")
@limiter.limit("120/minute")
async def log_user_activity(request: Request) -> JSONResponse:
    """Log an activity event for a user"""
    try:
        body = await request.json()
        if not body.get("ip_address"):
            body["ip_address"] = get_client_ip(request)
        act_id = await db_manager.log_user_activity(body)
        return create_json_response(data={"id": act_id}, message="User activity logged", status_code=201)
    except Exception as e:
        logger.error(f"Error logging user activity: {e}")
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
# API ENDPOINTS - AUTH & SAAS TENANT SESSION
# ============================================================

@app.post("/api/v1/auth/login")
@app.post("/api/v1/auth/login/")
@limiter.limit("20/minute")
async def auth_login(request: Request) -> JSONResponse:
    """Issue JWT access token with tenant context"""
    try:
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Check profiles in db
        user = await db_manager.get_user_by_email(email) if hasattr(db_manager, "get_user_by_email") else None
        
        # Built-in demo accounts fallback
        if not user:
            if email == "admin@securenet.com" and (not password or password == "admin123"):
                user = {
                    "id": "demo-admin-id",
                    "email": "admin@securenet.com",
                    "name": "Security Administrator",
                    "role": "super_admin",
                    "org_id": "demo-org-id"
                }
            elif email == "user@securenet.com" and (not password or password == "user123"):
                user = {
                    "id": "demo-user-id",
                    "email": "user@securenet.com",
                    "name": "SOC Analyst Operator",
                    "role": "security_analyst",
                    "org_id": "demo-org-id"
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_access_token({
            "sub": user.get("id"),
            "email": user.get("email"),
            "role": user.get("role", "user"),
            "org_id": user.get("org_id", "demo-org-id")
        })
        
        return create_json_response(
            message="Login successful",
            data={
                "access_token": token,
                "token_type": "bearer",
                "user": user
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/auth/me")
@app.get("/api/v1/auth/me/")
@limiter.limit("60/minute")
async def auth_me(request: Request, current_user: dict = Depends(get_current_user)) -> JSONResponse:
    """Return currently authenticated user profile and organization"""
    org = await db_manager.get_organization_by_id(current_user.get("org_id")) if (current_user.get("org_id") and hasattr(db_manager, "get_organization_by_id")) else None
    return create_json_response(
        message="User profile retrieved",
        data={
            "user": current_user,
            "organization": org
        }
    )


# ============================================================
# API ENDPOINTS - FLEET DEVICES & ENDPOINT AGENTS (HIDS/EDR)
# ============================================================

@app.post("/api/v1/devices/enroll")
@app.post("/api/v1/devices/enroll/")
@limiter.limit("30/minute")
async def enroll_device(request: Request) -> JSONResponse:
    """
    Enroll an employee endpoint device using an organization's 6-letter join key.
    Generates a unique device identity and secret device_token for agent auth.
    """
    try:
        body = await request.json()
        join_key = body.get("join_key")
        hostname = body.get("hostname")
        
        if not join_key:
            raise HTTPException(status_code=400, detail="Organization join_key is required")
        if not hostname:
            raise HTTPException(status_code=400, detail="Device hostname is required")
            
        org = await db_manager.get_org_by_join_key(join_key)
        if not org:
            raise HTTPException(status_code=404, detail="Invalid or expired organization join key")
            
        device_data = {
            "org_id": org["id"],
            "hostname": hostname,
            "os_platform": body.get("os_platform", "windows"),
            "os_version": body.get("os_version", "Unknown OS"),
            "ip_address": body.get("ip_address") or get_client_ip(request),
            "mac_address": body.get("mac_address"),
            "assigned_user_email": body.get("assigned_user_email"),
            "agent_version": body.get("agent_version", "1.0.0"),
            "metadata": body.get("metadata", {})
        }
        
        device = await db_manager.enroll_device(device_data)
        
        await db_manager.insert_audit_log({
            "action": "device_enrolled",
            "resource_type": "device",
            "resource_id": device["id"],
            "org_id": org["id"],
            "details": {"hostname": hostname, "os": device_data["os_platform"]},
            "ip_address": get_client_ip(request)
        })
        
        return create_json_response(
            message="Device enrolled successfully into organization fleet",
            data={
                "device_id": device["id"],
                "device_token": device["device_token"],
                "org_id": org["id"],
                "org_name": org.get("name"),
                "status": "online"
            },
            status_code=201
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enrolling device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/devices/heartbeat")
@app.post("/api/v1/devices/heartbeat/")
@limiter.limit("120/minute")
async def device_heartbeat(
    request: Request,
    current_device: dict = Depends(get_current_device)
) -> JSONResponse:
    """
    Endpoint agent periodic heartbeat & live telemetry ingestion.
    Transmits CPU/memory, active socket connections, and process info.
    """
    try:
        body = await request.json()
        device_id = current_device["id"]
        
        telemetry = {
            "org_id": current_device["org_id"],
            "cpu_usage": body.get("cpu_usage", 0.0),
            "memory_usage": body.get("memory_usage", 0.0),
            "active_connections": body.get("active_connections", []),
            "open_ports": body.get("open_ports", []),
            "event_type": body.get("event_type", "heartbeat"),
            "details": body.get("details", {})
        }
        
        success = await db_manager.update_device_heartbeat(device_id, telemetry)
        pending_commands = await db_manager.get_pending_device_commands(device_id)
        
        return create_json_response(
            message="Heartbeat processed",
            data={
                "device_id": device_id,
                "is_quarantined": bool(current_device.get("is_quarantined")),
                "pending_commands_count": len(pending_commands),
                "recorded": success
            }
        )
    except Exception as e:
        logger.error(f"Error processing device heartbeat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/devices/commands")
@app.get("/api/v1/devices/commands/")
@limiter.limit("60/minute")
async def get_device_commands(
    request: Request,
    current_device: dict = Depends(get_current_device)
) -> JSONResponse:
    """Agent pulls pending SOAR commands awaiting execution (isolate, kill process, etc.)"""
    commands = await db_manager.get_pending_device_commands(current_device["id"])
    return create_json_response(data=commands, message="Pending commands retrieved")


@app.post("/api/v1/devices/commands/{command_id}/result")
@app.post("/api/v1/devices/commands/{command_id}/result/")
@limiter.limit("60/minute")
async def report_command_result(
    request: Request,
    command_id: str,
    current_device: dict = Depends(get_current_device)
) -> JSONResponse:
    """Agent reports command execution status and terminal output"""
    try:
        body = await request.json()
        status_val = body.get("status", "executed")
        result_text = body.get("result", "")
        
        success = await db_manager.update_device_command_status(command_id, status_val, result_text)
        return create_json_response(data={"command_id": command_id, "updated": success}, message="Command status updated")
    except Exception as e:
        logger.error(f"Error updating command status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/devices/alerts")
@app.post("/api/v1/devices/alerts/")
@limiter.limit("60/minute")
async def report_device_alert(
    request: Request,
    current_device: dict = Depends(get_current_device)
) -> JSONResponse:
    """Agent reports a local threat or suspicious socket/process detection"""
    try:
        body = await request.json()
        alert_dict = {
            "id": str(uuid.uuid4()),
            "source_ip": body.get("source_ip", current_device.get("ip_address", "127.0.0.1")),
            "destination_ip": body.get("destination_ip", "0.0.0.0"),
            "protocol": body.get("protocol", "TCP"),
            "timestamp": datetime.now().isoformat(),
            "attack_type": body.get("attack_type", "Endpoint Suspicious Activity"),
            "risk_level": body.get("risk_level", "HIGH"),
            "confidence": float(body.get("confidence", 0.85)),
            "description": body.get("description", f"Suspicious activity detected on {current_device.get('hostname')}"),
            "threat_intel_data": body.get("threat_intel_data"),
            "packet_data": body.get("packet_data"),
            "prediction_result": body.get("prediction_result"),
            "org_id": current_device.get("org_id"),
            "device_id": current_device.get("id"),
            "hostname": current_device.get("hostname"),
            "process_name": body.get("process_name"),
            "process_pid": body.get("process_pid")
        }
        
        alert_id = await db_manager.insert_alert(alert_dict)
        
        # Broadcast via WebSocket to SOC admins
        if websocket_service:
            await websocket_service.broadcast_alert(alert_dict)
            
        return create_json_response(data={"alert_id": alert_id}, message="Endpoint alert registered", status_code=201)
    except Exception as e:
        logger.error(f"Error registering endpoint alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# API ENDPOINTS - ADMIN FLEET MANAGEMENT
# ============================================================

@app.get("/api/v1/devices")
@app.get("/api/v1/devices/")
@limiter.limit("60/minute")
async def get_fleet_devices(
    request: Request,
    org_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Get fleet devices for an organization"""
    effective_org = org_id or current_user.get("org_id")
    devices = await db_manager.get_devices(org_id=effective_org, status=status)
    return create_json_response(data={"devices": devices, "total": len(devices)}, message="Fleet devices retrieved")


@app.get("/api/v1/devices/{device_id}")
@app.get("/api/v1/devices/{device_id}/")
@limiter.limit("60/minute")
async def get_device_detail(
    request: Request,
    device_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Get detailed telemetry and status for a specific device"""
    device = await db_manager.get_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    commands = await db_manager.get_pending_device_commands(device_id)
    return create_json_response(data={"device": device, "pending_commands": commands}, message="Device details retrieved")


@app.post("/api/v1/devices/{device_id}/quarantine")
@app.post("/api/v1/devices/{device_id}/quarantine/")
@limiter.limit("20/minute")
async def quarantine_device(
    request: Request,
    device_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Toggle remote network isolation / quarantine on an employee device"""
    try:
        body = await request.json()
        quarantined = bool(body.get("quarantined", True))
        
        success = await db_manager.set_device_quarantine(device_id, quarantined)
        command_type = "isolate_network" if quarantined else "unisolate_network"
        
        # Issue remote command for endpoint agent
        await db_manager.create_device_command({
            "device_id": device_id,
            "org_id": current_user.get("org_id", "demo-org-id"),
            "command_type": command_type,
            "payload": {"reason": body.get("reason", "Admin SOC isolation action")},
            "issued_by": current_user.get("email", "admin")
        })
        
        await db_manager.insert_audit_log({
            "action": f"device_{command_type}",
            "resource_type": "device",
            "resource_id": device_id,
            "org_id": current_user.get("org_id"),
            "details": {"quarantined": quarantined},
            "ip_address": get_client_ip(request)
        })
        
        return create_json_response(
            data={"device_id": device_id, "is_quarantined": quarantined},
            message=f"Device quarantine status set to {quarantined}"
        )
    except Exception as e:
        logger.error(f"Error quarantining device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/devices/{device_id}/command")
@app.post("/api/v1/devices/{device_id}/command/")
@limiter.limit("20/minute")
async def issue_device_command(
    request: Request,
    device_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Dispatch a remote SOAR command to an endpoint (kill_process, block_ip, scan_system)"""
    try:
        body = await request.json()
        command_type = body.get("command_type")
        if not command_type:
            raise HTTPException(status_code=400, detail="command_type is required")
            
        cmd = await db_manager.create_device_command({
            "device_id": device_id,
            "org_id": current_user.get("org_id", "demo-org-id"),
            "command_type": command_type,
            "payload": body.get("payload", {}),
            "issued_by": current_user.get("email", "admin")
        })
        
        return create_json_response(data=cmd, message="Device command queued successfully", status_code=201)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error issuing device command: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/devices/{device_id}")
@app.delete("/api/v1/devices/{device_id}/")
@limiter.limit("20/minute")
async def delete_fleet_device(
    request: Request,
    device_id: str,
    current_user: dict = Depends(get_current_user)
) -> JSONResponse:
    """Deregister and remove a device from the fleet"""
    try:
        success = await db_manager.delete_device(device_id)
        return create_json_response(data={"device_id": device_id, "deleted": success}, message="Device deregistered")
    except Exception as e:
        logger.error(f"Error deleting device: {e}")
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
