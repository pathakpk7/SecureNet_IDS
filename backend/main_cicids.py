#!/usr/bin/env python3
"""
SecureNet IDS - Real-time Intrusion Detection System
FastAPI backend with CICIDS2017 model integration.
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import time

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from .config import settings
from .database import db_manager
from .schemas import Alert, LogEntry, Stats, MonitoringStatus, WebSocketMessage
from .capture import AsyncPacketCapture
from .feature_engineering import cicids_feature_extractor
from .predictor import MLPredictor
from .threat_intel import threat_intel_manager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global variables for monitoring
packet_capture: Optional[AsyncPacketCapture] = None
ml_predictor: Optional[MLPredictor] = None
monitoring_active: bool = False
monitoring_start_time: Optional[datetime] = None
websocket_connections: List[WebSocket] = []
monitoring_stats = {
    "packets_processed": 0,
    "alerts_generated": 0,
    "attacks_detected": 0,
    "start_time": None,
    "last_packet_time": None,
    "last_alert_time": None
}

# Initialize FastAPI app
app = FastAPI(
    title="SecureNet IDS API",
    description="Real-time Intrusion Detection System",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup."""
    global packet_capture, ml_predictor
    
    logger.info("🚀 Starting SecureNet IDS Backend...")
    
    # Initialize ML predictor
    ml_predictor = MLPredictor()
    if ml_predictor.load_model():
        logger.info("✅ CICIDS2017 model loaded successfully")
    else:
        logger.error("❌ Failed to load ML model")
        return
    
    # Initialize packet capture
    packet_capture = AsyncPacketCapture(
        interface=settings.network_interface,
        packet_callback=process_packet
    )
    
    logger.info("✅ SecureNet IDS Backend initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global monitoring_active, packet_capture
    
    logger.info("🛑 Shutting down SecureNet IDS...")
    
    if monitoring_active:
        await stop_monitoring()
    
    logger.info("✅ SecureNet IDS Backend shutdown complete")

async def process_packet(packet_data):
    """Process captured packet for intrusion detection."""
    global monitoring_stats
    
    try:
        # Update statistics
        monitoring_stats["packets_processed"] += 1
        monitoring_stats["last_packet_time"] = datetime.now()
        
        # Extract CICIDS features
        features_dict = cicids_feature_extractor.extract_cicids_features(packet_data)
        
        if not features_dict:
            logger.warning("Failed to extract features from packet")
            return
        
        # Make ML prediction
        prediction_result = ml_predictor.predict_with_details_cicids(features_dict)
        
        if not prediction_result:
            logger.error("ML prediction failed")
            return
        
        is_attack = prediction_result.get('prediction', 0) == 1
        confidence = prediction_result.get('confidence', 0.0)
        
        # Log the detection
        log_entry = LogEntry(
            timestamp=datetime.now(),
            source_ip=packet_data.source_ip,
            destination_ip=packet_data.destination_ip,
            protocol=packet_data.protocol.value,
            packet_length=packet_data.packet_length,
            prediction=is_attack,
            confidence=confidence,
            attack_type=prediction_result.get('attack_type', 'unknown'),
            risk_level='high' if is_attack and confidence > 0.8 else 'medium' if is_attack else 'low'
        )
        
        # Store in database
        await db_manager.store_log_entry(log_entry)
        
        # If attack detected, call threat intelligence APIs
        if is_attack:
            monitoring_stats["attacks_detected"] += 1
            await handle_attack_detection(packet_data, prediction_result, log_entry)
        
        # Send to WebSocket clients
        await send_websocket_update({
            "type": "packet_processed",
            "data": {
                "packet_info": {
                    "source_ip": packet_data.source_ip,
                    "destination_ip": packet_data.destination_ip,
                    "protocol": packet_data.protocol.value,
                    "packet_length": packet_data.packet_length
                },
                "prediction": {
                    "is_attack": is_attack,
                    "confidence": confidence,
                    "attack_type": prediction_result.get('attack_type', 'unknown')
                },
                "stats": monitoring_stats
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing packet: {str(e)}")

async def handle_attack_detection(packet_data, prediction_result, log_entry):
    """Handle attack detection with threat intelligence."""
    global monitoring_stats
    
    try:
        monitoring_stats["alerts_generated"] += 1
        monitoring_stats["last_alert_time"] = datetime.now()
        
        # Get threat intelligence for source IP
        threat_results = []
        try:
            threat_results = await threat_intel_manager.check_ip(packet_data.source_ip)
        except Exception as e:
            logger.error(f"Threat intelligence check failed: {str(e)}")
        
        # Create alert
        alert = Alert(
            id=f"alert_{int(time.time())}",
            timestamp=datetime.now(),
            source_ip=packet_data.source_ip,
            destination_ip=packet_data.destination_ip,
            attack_type=prediction_result.get('attack_type', 'unknown'),
            risk_level='critical' if prediction_result.get('confidence', 0) > 0.9 else 'high',
            confidence=prediction_result.get('confidence', 0.0),
            details={
                "ml_prediction": prediction_result,
                "threat_intelligence": [
                    {
                        "source": result.source,
                        "is_malicious": result.is_malicious,
                        "confidence": result.confidence_score
                    } for result in threat_results
                ]
            },
            status="active"
        )
        
        # Store alert in database
        await db_manager.store_alert(alert)
        
        # Send alert to WebSocket clients
        await send_websocket_update({
            "type": "alert",
            "data": alert.dict()
        })
        
        logger.warning(f"🚨 Attack detected: {packet_data.source_ip} -> {packet_data.destination_ip} "
                    f"({prediction_result.get('attack_type', 'unknown')})")
        
    except Exception as e:
        logger.error(f"Error handling attack detection: {str(e)}")

async def send_websocket_update(message: dict):
    """Send message to all connected WebSocket clients."""
    if not websocket_connections:
        return
    
    message_str = json.dumps(message, default=str)
    
    # Send to all connected clients
    for websocket in websocket_connections[:]:  # Copy list to avoid modification during iteration
        try:
            await websocket.send_text(message_str)
        except Exception as e:
            logger.error(f"Error sending WebSocket message: {str(e)}")
            # Remove disconnected client
            if websocket in websocket_connections:
                websocket_connections.remove(websocket)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "SecureNet IDS API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/status")
async def get_status():
    """Get system status."""
    global monitoring_active, monitoring_stats
    
    # Get ML model info
    model_info = {}
    if ml_predictor:
        model_info = ml_predictor.get_model_info()
    
    # Get feature extractor stats
    feature_stats = cicids_feature_extractor.get_flow_stats()
    
    # Get capture stats
    capture_stats = {}
    if packet_capture:
        capture_stats = packet_capture.get_stats()
    
    status = MonitoringStatus(
        monitoring_active=monitoring_active,
        start_time=monitoring_start_time,
        uptime_seconds=(datetime.now() - monitoring_start_time).total_seconds() if monitoring_start_time else 0,
        packets_processed=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        attacks_detected=monitoring_stats["attacks_detected"],
        last_packet_time=monitoring_stats["last_packet_time"],
        last_alert_time=monitoring_stats["last_alert_time"],
        model_info=model_info,
        capture_stats=capture_stats,
        feature_stats=feature_stats
    )
    
    return status.dict()

@app.post("/start")
async def start_monitoring():
    """Start packet monitoring and intrusion detection."""
    global monitoring_active, monitoring_start_time
    
    if monitoring_active:
        raise HTTPException(status_code=400, detail="Monitoring is already active")
    
    if not ml_predictor or not ml_predictor.is_model_loaded():
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        # Start packet capture
        await packet_capture.start_capture()
        
        monitoring_active = True
        monitoring_start_time = datetime.now()
        monitoring_stats["start_time"] = monitoring_start_time
        
        logger.info("🔍 Started real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_websocket_update({
            "type": "monitoring_started",
            "data": {
                "start_time": monitoring_start_time.isoformat(),
                "message": "Real-time intrusion detection started"
            }
        })
        
        return {"message": "Monitoring started successfully", "start_time": monitoring_start_time.isoformat()}
        
    except Exception as e:
        logger.error(f"Error starting monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {str(e)}")

@app.post("/stop")
async def stop_monitoring():
    """Stop packet monitoring and intrusion detection."""
    global monitoring_active
    
    if not monitoring_active:
        raise HTTPException(status_code=400, detail="Monitoring is not active")
    
    try:
        # Stop packet capture
        await packet_capture.stop_capture()
        
        monitoring_active = False
        
        logger.info("⏹ Stopped real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_websocket_update({
            "type": "monitoring_stopped",
            "data": {
                "stop_time": datetime.now().isoformat(),
                "message": "Real-time intrusion detection stopped"
            }
        })
        
        return {"message": "Monitoring stopped successfully", "stop_time": datetime.now().isoformat()}
        
    except Exception as e:
        logger.error(f"Error stopping monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {str(e)}")

@app.get("/logs")
async def get_logs(limit: int = 100, offset: int = 0):
    """Get recent detection logs."""
    try:
        logs = await db_manager.get_recent_logs(limit=limit, offset=offset)
        return {"logs": logs, "total": len(logs)}
    except Exception as e:
        logger.error(f"Error getting logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@app.get("/alerts")
async def get_alerts(limit: int = 50, offset: int = 0):
    """Get recent alerts."""
    try:
        alerts = await db_manager.get_recent_alerts(limit=limit, offset=offset)
        return {"alerts": alerts, "total": len(alerts)}
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get system statistics."""
    global monitoring_stats
    
    # Calculate additional stats
    uptime = 0
    if monitoring_start_time:
        uptime = (datetime.now() - monitoring_start_time).total_seconds()
    
    packets_per_second = monitoring_stats["packets_processed"] / uptime if uptime > 0 else 0
    
    stats = Stats(
        uptime_seconds=uptime,
        packets_processed=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        attacks_detected=monitoring_stats["attacks_detected"],
        packets_per_second=packets_per_second,
        last_packet_time=monitoring_stats["last_packet_time"],
        last_alert_time=monitoring_stats["last_alert_time"]
    )
    
    return stats.dict()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await websocket.accept()
    
    # Add to connections list
    websocket_connections.append(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(websocket_connections)}")
    
    try:
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "message": "Connected to SecureNet IDS",
                "timestamp": datetime.now().isoformat()
            }
        }))
        
        # Keep connection alive
        while True:
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {str(e)}")
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        # Remove from connections list
        if websocket in websocket_connections:
            websocket_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(websocket_connections)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "components": {
            "ml_model": ml_predictor.is_model_loaded() if ml_predictor else False,
            "packet_capture": packet_capture.capture.is_capturing if packet_capture else False,
            "database": await db_manager.health_check(),
            "threat_intel": len(threat_intel_manager.get_available_sources()) > 0
        }
    }
    
    return health_status

if __name__ == "__main__":
    # Run the FastAPI app
    uvicorn.run(
        "main_cicids:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info"
    )
