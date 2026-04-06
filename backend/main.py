import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

from .config import settings
from .database import db_manager
from .schemas import (
    Alert, LogEntry, Stats, MonitoringStatus, APIResponse,
    WebSocketMessage, HealthCheck, BlacklistEntry
)
from .capture import AsyncPacketCapture
from .feature_engineering import FeatureEngineering
from .predictor import ml_predictor
from .threat_intel import threat_intel_manager
from .utils import (
    setup_logging, create_response, validate_ip_address,
    get_system_info, export_data_to_csv
)

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Global variables for monitoring
packet_capture: Optional[AsyncPacketCapture] = None
feature_engineering: Optional[FeatureEngineering] = None
monitoring_active: bool = False
monitoring_start_time: Optional[datetime] = None
websocket_connections: List[WebSocket] = []
monitoring_stats = {
    "packets_processed": 0,
    "alerts_generated": 0,
    "start_time": None,
    "last_packet_time": None
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting SecureNet IDS...")
    
    # Initialize components
    global feature_engineering
    feature_engineering = FeatureEngineering()
    
    # Check database connection
    if not await db_manager.health_check():
        logger.error("Database connection failed!")
        raise Exception("Database connection failed")
    
    # Check ML model
    if not ml_predictor.model:
        logger.warning("No ML model loaded. Please train a model first.")
    
    logger.info("SecureNet IDS started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down SecureNet IDS...")
    if monitoring_active:
        await stop_monitoring_internal()
    logger.info("SecureNet IDS shutdown complete.")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Based Intrusion Detection System",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                # Remove dead connections
                self.active_connections.remove(connection)


manager = ConnectionManager()


# Background monitoring task
async def monitoring_loop():
    """Main monitoring loop for packet processing"""
    global monitoring_stats
    
    while monitoring_active:
        try:
            # Get packet from capture
            packet = await packet_capture.get_packet(timeout=1.0)
            
            if packet:
                monitoring_stats["packets_processed"] += 1
                monitoring_stats["last_packet_time"] = packet.timestamp
                
                # Extract features
                features = feature_engineering.extract_features(packet)
                
                # Make prediction
                prediction_result = ml_predictor.create_prediction_result(features)
                
                # If attack detected, perform threat intelligence check
                if prediction_result.is_attack:
                    try:
                        # Check threat intelligence for source IP
                        threat_results = await threat_intel_manager.check_ip(packet.source_ip)
                        prediction_result.threat_intel_results = threat_results
                        
                        # Recalculate risk level with threat intel
                        if threat_results:
                            from .predictor import MLPredictor
                            temp_predictor = MLPredictor()
                            prediction_result = temp_predictor.create_prediction_result(
                                features, threat_results
                            )
                    
                    except Exception as e:
                        logger.error(f"Threat intelligence check failed: {e}")
                
                # Create alert if attack detected
                if prediction_result.is_attack:
                    await create_and_store_alert(packet, prediction_result)
                    monitoring_stats["alerts_generated"] += 1
                
                # Send real-time updates via WebSocket
                await send_realtime_update(packet, prediction_result)
                
        except asyncio.TimeoutError:
            continue  # No packet received, continue loop
        except Exception as e:
            logger.error(f"Error in monitoring loop: {e}")
            await asyncio.sleep(1)


async def create_and_store_alert(packet, prediction_result):
    """Create and store alert in database"""
    try:
        from .schemas import Alert, PacketData, RiskLevel, AttackType
        
        alert = Alert(
            source_ip=packet.source_ip,
            destination_ip=packet.destination_ip,
            protocol=packet.protocol,
            timestamp=packet.timestamp,
            attack_type=prediction_result.attack_type,
            risk_level=prediction_result.risk_level,
            confidence=prediction_result.confidence,
            description=f"{prediction_result.attack_type.value.upper()} attack detected from {packet.source_ip} to {packet.destination_ip}",
            threat_intel_data=[r.dict() for r in prediction_result.threat_intel_results],
            packet_data=packet,
            prediction_result=prediction_result
        )
        
        # Store in database
        alert_id = await db_manager.insert_alert(alert)
        logger.info(f"Alert stored: {alert_id}")
        
        # Broadcast alert via WebSocket
        await manager.broadcast({
            "type": "alert",
            "data": alert.dict(),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error creating alert: {e}")


async def send_realtime_update(packet, prediction_result):
    """Send real-time updates via WebSocket"""
    try:
        update_data = {
            "type": "packet",
            "data": {
                "packet": packet.dict(),
                "prediction": prediction_result.dict(),
                "stats": monitoring_stats
            },
            "timestamp": datetime.now().isoformat()
        }
        
        await manager.broadcast(update_data)
        
    except Exception as e:
        logger.error(f"Error sending real-time update: {e}")


async def start_monitoring_internal():
    """Internal function to start monitoring"""
    global monitoring_active, monitoring_start_time, packet_capture
    
    if monitoring_active:
        return False
    
    try:
        # Initialize packet capture
        packet_capture = AsyncPacketCapture()
        await packet_capture.start_capture()
        
        monitoring_active = True
        monitoring_start_time = datetime.now()
        monitoring_stats["start_time"] = monitoring_start_time
        
        # Start monitoring loop
        asyncio.create_task(monitoring_loop())
        
        logger.info("Monitoring started successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to start monitoring: {e}")
        return False


async def stop_monitoring_internal():
    """Internal function to stop monitoring"""
    global monitoring_active, packet_capture
    
    if not monitoring_active:
        return False
    
    try:
        monitoring_active = False
        
        if packet_capture:
            await packet_capture.stop_capture()
            packet_capture = None
        
        logger.info("Monitoring stopped successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to stop monitoring: {e}")
        return False


# API Routes
@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint"""
    return create_response(
        success=True,
        message=f"Welcome to {settings.app_name} v{settings.app_version}",
        data={"status": "running", "timestamp": datetime.now().isoformat()}
    )


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    services = {
        "database": await db_manager.health_check(),
        "ml_model": ml_predictor.model is not None,
        "packet_capture": packet_capture is not None,
        "threat_intel": len(threat_intel_manager.get_available_sources()) > 0
    }
    
    system_info = get_system_info()
    
    return HealthCheck(
        status="healthy" if all(services.values()) else "degraded",
        timestamp=datetime.now(),
        services=services,
        uptime=int((datetime.now() - monitoring_start_time).total_seconds()) if monitoring_start_time else 0,
        version=settings.app_version
    )


@app.post("/start-monitoring", response_model=APIResponse)
@limiter.limit("5/minute")
async def start_monitoring(background_tasks: BackgroundTasks):
    """Start network monitoring"""
    try:
        if monitoring_active:
            return create_response(
                success=False,
                message="Monitoring is already active"
            )
        
        success = await start_monitoring_internal()
        
        if success:
            return create_response(
                success=True,
                message="Monitoring started successfully",
                data={"status": "monitoring", "start_time": monitoring_start_time.isoformat()}
            )
        else:
            return create_response(
                success=False,
                message="Failed to start monitoring"
            )
            
    except Exception as e:
        logger.error(f"Error starting monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stop-monitoring", response_model=APIResponse)
@limiter.limit("5/minute")
async def stop_monitoring():
    """Stop network monitoring"""
    try:
        if not monitoring_active:
            return create_response(
                success=False,
                message="Monitoring is not active"
            )
        
        success = await stop_monitoring_internal()
        
        if success:
            return create_response(
                success=True,
                message="Monitoring stopped successfully",
                data={"status": "stopped", "stop_time": datetime.now().isoformat()}
            )
        else:
            return create_response(
                success=False,
                message="Failed to stop monitoring"
            )
            
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status", response_model=MonitoringStatus)
async def get_monitoring_status():
    """Get current monitoring status"""
    capture_stats = packet_capture.get_stats() if packet_capture else {}
    
    return MonitoringStatus(
        is_monitoring=monitoring_active,
        start_time=monitoring_start_time,
        packets_captured=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        current_interface=settings.network_interface,
        uptime_seconds=int((datetime.now() - monitoring_start_time).total_seconds()) if monitoring_start_time else 0
    )


@app.get("/alerts", response_model=APIResponse)
@limiter.limit("30/minute")
async def get_alerts(
    limit: int = 100,
    offset: int = 0,
    risk_level: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
):
    """Get alerts with filtering options"""
    try:
        # Parse time filters
        start_dt = None
        end_dt = None
        
        if start_time:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        alerts = await db_manager.get_alerts(
            limit=limit,
            offset=offset,
            risk_level=risk_level,
            start_time=start_dt,
            end_time=end_dt
        )
        
        return create_response(
            success=True,
            message=f"Retrieved {len(alerts)} alerts",
            data={"alerts": alerts, "total": len(alerts)}
        )
        
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs", response_model=APIResponse)
@limiter.limit("30/minute")
async def get_logs(
    limit: int = 100,
    offset: int = 0,
    level: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
):
    """Get log entries with filtering options"""
    try:
        # Parse time filters
        start_dt = None
        end_dt = None
        
        if start_time:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        logs = await db_manager.get_logs(
            limit=limit,
            offset=offset,
            level=level,
            start_time=start_dt,
            end_time=end_dt
        )
        
        return create_response(
            success=True,
            message=f"Retrieved {len(logs)} log entries",
            data={"logs": logs, "total": len(logs)}
        )
        
    except Exception as e:
        logger.error(f"Error getting logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats", response_model=APIResponse)
@limiter.limit("20/minute")
async def get_stats(hours: int = 24):
    """Get system statistics"""
    try:
        # Get database stats
        db_stats = await db_manager.get_latest_stats(hours=hours)
        
        # Get monitoring stats
        stats_data = {
            "monitoring": monitoring_stats,
            "database": db_stats,
            "system": get_system_info(),
            "threat_intel": {
                "available_sources": threat_intel_manager.get_available_sources(),
                "source_status": threat_intel_manager.get_source_status()
            },
            "model": ml_predictor.get_model_info()
        }
        
        return create_response(
            success=True,
            message="Statistics retrieved successfully",
            data=stats_data
        )
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/blacklist", response_model=APIResponse)
@limiter.limit("20/minute")
async def get_blacklist():
    """Get IP blacklist"""
    try:
        blacklist = await db_manager.get_blacklist()
        
        return create_response(
            success=True,
            message=f"Retrieved {len(blacklist)} blacklist entries",
            data={"blacklist": blacklist}
        )
        
    except Exception as e:
        logger.error(f"Error getting blacklist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/blacklist", response_model=APIResponse)
@limiter.limit("10/minute")
async def add_to_blacklist(entry: BlacklistEntry):
    """Add IP to blacklist"""
    try:
        if not validate_ip_address(entry.ip_address):
            raise HTTPException(status_code=400, detail="Invalid IP address")
        
        alert_id = await db_manager.add_to_blacklist(entry)
        
        return create_response(
            success=True,
            message="IP added to blacklist successfully",
            data={"alert_id": alert_id}
        )
        
    except Exception as e:
        logger.error(f"Error adding to blacklist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/blacklist/{ip_address}", response_model=APIResponse)
@limiter.limit("10/minute")
async def remove_from_blacklist(ip_address: str):
    """Remove IP from blacklist"""
    try:
        if not validate_ip_address(ip_address):
            raise HTTPException(status_code=400, detail="Invalid IP address")
        
        success = await db_manager.remove_from_blacklist(ip_address)
        
        if success:
            return create_response(
                success=True,
                message="IP removed from blacklist successfully"
            )
        else:
            return create_response(
                success=False,
                message="IP not found in blacklist"
            )
        
    except Exception as e:
        logger.error(f"Error removing from blacklist: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/check-ip/{ip_address}", response_model=APIResponse)
@limiter.limit("15/minute")
async def check_ip_reputation(ip_address: str):
    """Check IP reputation using threat intelligence"""
    try:
        if not validate_ip_address(ip_address):
            raise HTTPException(status_code=400, detail="Invalid IP address")
        
        results = await threat_intel_manager.check_ip(ip_address)
        
        return create_response(
            success=True,
            message=f"IP reputation check completed for {ip_address}",
            data={"ip_address": ip_address, "results": [r.dict() for r in results]}
        )
        
    except Exception as e:
        logger.error(f"Error checking IP reputation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/export/alerts", response_model=APIResponse)
@limiter.limit("5/minute")
async def export_alerts_csv(
    limit: int = 1000,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
):
    """Export alerts to CSV"""
    try:
        # Parse time filters
        start_dt = None
        end_dt = None
        
        if start_time:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        if end_time:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        
        alerts = await db_manager.get_alerts(
            limit=limit,
            offset=0,
            start_time=start_dt,
            end_time=end_dt
        )
        
        # Export to CSV
        filename = f"alerts_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        export_data_to_csv(alerts, filename)
        
        return create_response(
            success=True,
            message=f"Exported {len(alerts)} alerts to {filename}.csv",
            data={"filename": f"{filename}.csv", "count": len(alerts)}
        )
        
    except Exception as e:
        logger.error(f"Error exporting alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            
            # Echo back or handle client messages
            await manager.send_personal_message(f"Received: {data}", websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=create_response(
            success=False,
            message="Internal server error",
            error=str(exc)
        )
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
