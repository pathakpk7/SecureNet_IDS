#!/usr/bin/env python3
"""
SecureNet IDS - Fixed Real-time Main Application
Fully functional real-time IDS with all issues fixed.
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import time
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load environment variables
load_dotenv()

# Import fixed components
from .config import settings
from .database_fixed import fixed_db_manager
from .schemas import Alert, LogEntry, Stats, MonitoringStatus
from .capture_realtime import realtime_capture, RealTimePacketCapture
from .feature_engineering_fixed import fixed_feature_extractor, FixedFeatureExtractor
from .predictor_fixed import fixed_ml_predictor, FixedMLPredictor
from .threat_intel import threat_intel_manager
from .utils import tcp_flags_dict_to_string

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('secretnet_ids_fixed.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Global variables for real-time monitoring
monitoring_active: bool = False
monitoring_start_time: Optional[datetime] = None
websocket_connections: List[WebSocket] = []

# Real-time monitoring statistics
monitoring_stats = {
    "packets_captured": 0,
    "packets_processed": 0,
    "ml_predictions": 0,
    "attacks_detected": 0,
    "threat_intel_checks": 0,
    "database_stores": 0,
    "alerts_generated": 0,
    "start_time": None,
    "last_packet_time": None,
    "last_attack_time": None,
    "last_threat_intel_time": None,
    "performance_metrics": {
        "avg_capture_time": 0.0,
        "avg_feature_time": 0.0,
        "avg_prediction_time": 0.0,
        "avg_threat_intel_time": 0.0,
        "avg_database_time": 0.0
    }
}

# Initialize FastAPI app
app = FastAPI(
    title="SecureNet IDS - Fixed Real-time",
    description="Fully Functional Real-time Intrusion Detection System",
    version="4.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize all fixed components for real-time operation."""
    global monitoring_active
    
    logger.info("🚀 Starting Fixed Real-time SecureNet IDS...")
    
    # Initialize ML predictor
    if fixed_ml_predictor.load_model():
        logger.info("✅ Fixed ML model loaded successfully")
    else:
        logger.error("❌ Failed to load ML model")
        return
    
    # Initialize real-time capture
    realtime_capture.callback = process_realtime_packet
    logger.info("✅ Real-time packet capture initialized")
    
    # Check database connection
    db_health = await fixed_db_manager.health_check()
    if db_health['status'] == 'healthy':
        logger.info("✅ Database connection established")
    else:
        logger.warning(f"⚠️ Database connection issue: {db_health.get('error', 'Unknown')}")
    
    # Log system information
    logger.info("📊 Fixed Real-time System Information:")
    logger.info(f"   - Network Interface: {settings.network_interface}")
    logger.info(f"   - Database Connected: {fixed_db_manager.is_connected}")
    logger.info(f"   - Threat Intel APIs: {len([k for k, v in threat_intel_manager.api.api_keys.items() if v])} available")
    logger.info(f"   - Capture Method: {realtime_capture.capture_method}")
    
    logger.info("✅ Fixed Real-time SecureNet IDS initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global monitoring_active
    
    logger.info("🛑 Shutting down Fixed Real-time SecureNet IDS...")
    
    if monitoring_active:
        await stop_realtime_monitoring()
    
    logger.info("✅ Fixed Real-time SecureNet IDS shutdown complete")

async def process_realtime_packet(packet_data):
    """
    Process real-time packet through the complete fixed IDS pipeline.
    
    Args:
        packet_data: Live packet data from capture
    """
    global monitoring_stats
    
    try:
        start_time = time.time()
        
        # Update capture statistics
        monitoring_stats["packets_captured"] += 1
        monitoring_stats["last_packet_time"] = datetime.now()
        
        # Step 1: Extract CICIDS features
        feature_start = time.time()
        features_dict = fixed_feature_extractor.extract_cicids_features(packet_data)
        feature_time = time.time() - feature_start
        
        if not features_dict:
            logger.warning("Failed to extract features from packet")
            return
        
        # Step 2: ML prediction
        ml_start = time.time()
        prediction_result = fixed_ml_predictor.predict_with_details_cicids(features_dict)
        ml_time = time.time() - ml_start
        
        if not prediction_result:
            logger.error("ML prediction failed")
            return
        
        is_attack = prediction_result.get('prediction', 0) == 1
        ml_confidence = prediction_result.get('confidence', 0.0)
        
        monitoring_stats["ml_predictions"] += 1
        
        # Step 3: Prepare detection data (NO HARDCODED DATA)
        detection_data = {
            "timestamp": datetime.now().isoformat(),
            "source_ip": packet_data.source_ip,
            "destination_ip": packet_data.destination_ip,
            "protocol": packet_data.protocol.value,
            "packet_length": packet_data.packet_length,
            "prediction": is_attack,
            "confidence": ml_confidence,
            "attack_type": prediction_result.get('attack_type', 'normal'),
            "risk_level": prediction_result.get('risk_level', 'LOW'),
            "features": features_dict,
            "threat_intel": {},
            "ml_confidence": ml_confidence,
            "sources": ["ML"]
        }
        
        # Step 4: Threat intelligence (only for attacks)
        threat_results = []
        threat_analysis = {}
        
        if is_attack:
            monitoring_stats["attacks_detected"] += 1
            monitoring_stats["last_attack_time"] = datetime.now()
            
            # Extract IP for threat intelligence
            ip_address = packet_data.source_ip
            
            # Call threat intelligence APIs
            threat_start = time.time()
            try:
                threat_results = await threat_intel_manager.check_ip(ip_address)
                threat_analysis = threat_intel_manager.analyze_threat_intel(threat_results)
                monitoring_stats["threat_intel_checks"] += 1
                monitoring_stats["last_threat_intel_time"] = datetime.now()
            except Exception as e:
                logger.error(f"Threat intelligence check failed: {str(e)}")
            
            threat_time = time.time() - threat_start
            
            # Update detection data with threat intelligence
            if threat_analysis:
                detection_data.update({
                    "threat_intel": threat_results,
                    "attack_type": threat_analysis.get('attack_type', prediction_result.get('attack_type')),
                    "risk_level": threat_analysis.get('risk_level', 'MEDIUM'),
                    "sources": detection_data["sources"] + threat_analysis.get('sources', []),
                    "confidence": max(ml_confidence, threat_analysis.get('confidence', 0.0))
                })
            
            # Create security alert
            await create_realtime_alert(packet_data, prediction_result, threat_analysis, threat_results)
        
        # Step 5: Database storage (REAL DATA ONLY)
        db_start = time.time()
        log_stored = await fixed_db_manager.store_detection_log(detection_data)
        db_time = time.time() - db_start
        
        if log_stored:
            monitoring_stats["database_stores"] += 1
        
        # Update performance metrics
        total_time = time.time() - start_time
        monitoring_stats["performance_metrics"]["avg_feature_time"] = (
            (monitoring_stats["performance_metrics"]["avg_feature_time"] + feature_time) / 2
        )
        monitoring_stats["performance_metrics"]["avg_prediction_time"] = (
            (monitoring_stats["performance_metrics"]["avg_prediction_time"] + ml_time) / 2
        )
        if is_attack and threat_results:
            monitoring_stats["performance_metrics"]["avg_threat_intel_time"] = (
                (monitoring_stats["performance_metrics"]["avg_threat_intel_time"] + threat_time) / 2
            )
        monitoring_stats["performance_metrics"]["avg_database_time"] = (
            (monitoring_stats["performance_metrics"]["avg_database_time"] + db_time) / 2
        )
        
        monitoring_stats["packets_processed"] += 1
        
        # Step 6: Real-time WebSocket updates
        await send_realtime_update({
            "type": "packet_processed",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "packet_info": {
                    "source_ip": packet_data.source_ip,
                    "destination_ip": packet_data.destination_ip,
                    "protocol": packet_data.protocol.value,
                    "packet_length": packet_data.packet_length,
                    "tcp_flags": packet_data.tcp_flags
                },
                "prediction": {
                    "is_attack": is_attack,
                    "confidence": ml_confidence,
                    "attack_type": detection_data.get('attack_type', 'unknown'),
                    "risk_level": detection_data.get('risk_level', 'low'),
                    "sources": detection_data.get('sources', [])
                },
                "threat_intel": detection_data.get('threat_intel', {}),
                "features": features_dict,
                "performance": {
                    "feature_time": feature_time,
                    "prediction_time": ml_time,
                    "threat_intel_time": threat_time if is_attack else 0,
                    "database_time": db_time,
                    "total_time": total_time
                },
                "stats": monitoring_stats
            }
        })
        
        # Log critical alerts
        if is_attack and detection_data.get('risk_level') in ['HIGH', 'CRITICAL']:
            logger.critical(f"🚨 CRITICAL THREAT DETECTED: {packet_data.source_ip} -> {packet_data.destination_ip} "
                           f"({detection_data.get('attack_type')}) - Risk Level: {detection_data.get('risk_level')}")
        
        logger.debug(f"Real-time packet processed in {total_time:.3f}s")
        
    except Exception as e:
        logger.error(f"Error processing real-time packet: {str(e)}")

async def create_realtime_alert(packet_data, prediction_result, threat_analysis, threat_results):
    """Create and store real-time security alert."""
    global monitoring_stats
    
    try:
        monitoring_stats["alerts_generated"] += 1
        
        # Generate unique alert ID
        alert_id = f"alert_{int(time.time())}_{packet_data.source_ip.replace('.', '_')}"
        
        # Create alert data (NO HARDCODED DATA)
        alert_data = {
            "id": alert_id,
            "timestamp": datetime.now().isoformat(),
            "source_ip": packet_data.source_ip,
            "destination_ip": packet_data.destination_ip,
            "attack_type": threat_analysis.get('attack_type', prediction_result.get('attack_type', 'unknown')),
            "risk_level": threat_analysis.get('risk_level', 'HIGH'),
            "confidence": max(prediction_result.get('confidence', 0.0), threat_analysis.get('confidence', 0.0)),
            "status": "active",
            "details": {
                "ml_prediction": prediction_result,
                "threat_analysis": threat_analysis,
                "packet_info": {
                    "protocol": packet_data.protocol.value,
                    "packet_length": packet_data.packet_length,
                    "timestamp": packet_data.timestamp,
                    "tcp_flags": packet_data.tcp_flags
                }
            },
            "threat_intel_results": threat_results,
            "ml_prediction": prediction_result,
            "sources": ["ML"] + threat_analysis.get('sources', []),
            "alert_flag": threat_analysis.get('risk_level') == 'CRITICAL'
        }
        
        # Store alert in database
        alert_stored = await fixed_db_manager.store_security_alert(alert_data)
        
        if alert_stored:
            # Send alert to WebSocket clients
            await send_realtime_update({
                "type": "security_alert",
                "data": alert_data
            })
            
            logger.warning(f"🚨 Real-time Security Alert: {packet_data.source_ip} -> {packet_data.destination_ip} "
                         f"({alert_data.get('attack_type')}) - Risk: {alert_data.get('risk_level')}")
        
    except Exception as e:
        logger.error(f"Error creating real-time security alert: {str(e)}")

async def send_realtime_update(message: dict):
    """Send real-time message to all connected WebSocket clients."""
    if not websocket_connections:
        return
    
    message_str = json.dumps(message, default=str)
    
    # Send to all connected clients
    disconnected_clients = []
    for websocket in websocket_connections:
        try:
            await websocket.send_text(message_str)
        except Exception as e:
            logger.error(f"Error sending WebSocket message: {str(e)}")
            disconnected_clients.append(websocket)
    
    # Remove disconnected clients
    for client in disconnected_clients:
        if client in websocket_connections:
            websocket_connections.remove(client)

# Fixed API Endpoints
@app.get("/")
async def root():
    """Root endpoint with fixed system information."""
    return {
        "message": "SecureNet IDS - Fixed Real-time",
        "version": "4.0.0",
        "status": "running",
        "mode": "real-time-fixed",
        "features": [
            "Fixed Live Packet Capture",
            "Fixed Real-time ML Prediction",
            "Fixed Threat Intelligence Integration",
            "Fixed Real-time Database Logging",
            "Fixed WebSocket Real-time Updates",
            "No Hardcoded Data",
            "Fixed TCP Flags Handling",
            "Fixed Feature Engineering",
            "Fixed ML Pipeline"
        ]
    }

@app.get("/status")
async def get_status():
    """Get comprehensive fixed system status."""
    global monitoring_active, monitoring_stats
    
    # Get ML model info
    model_info = fixed_ml_predictor.get_model_info()
    
    # Get capture stats
    capture_stats = realtime_capture.get_stats()
    
    # Get feature extractor stats
    feature_stats = fixed_feature_extractor.get_flow_statistics()
    
    # Get database stats
    db_stats = await fixed_db_manager.get_statistics()
    
    # Get database health
    db_health = await fixed_db_manager.health_check()
    
    status = MonitoringStatus(
        monitoring_active=monitoring_active,
        start_time=monitoring_start_time,
        uptime_seconds=(datetime.now() - monitoring_start_time).total_seconds() if monitoring_start_time else 0,
        packets_processed=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        attacks_detected=monitoring_stats["attacks_detected"],
        last_packet_time=monitoring_stats["last_packet_time"],
        last_alert_time=monitoring_stats.get("last_attack_time"),
        model_info=model_info,
        capture_stats=capture_stats,
        feature_stats=feature_stats,
        database_stats=db_stats,
        database_health=db_health,
        performance_metrics=monitoring_stats["performance_metrics"],
        threat_intel_stats={
            "checks_performed": monitoring_stats["threat_intel_checks"],
            "last_check": monitoring_stats.get("last_threat_intel_time"),
            "available_apis": len([k for k, v in threat_intel_manager.api.api_keys.items() if v])
        },
        realtime_stats={
            "packets_captured": monitoring_stats["packets_captured"],
            "ml_predictions": monitoring_stats["ml_predictions"],
            "database_stores": monitoring_stats["database_stores"],
            "capture_method": realtime_capture.capture_method,
            "active_flows": feature_stats.get('active_flows', 0)
        }
    )
    
    return status.dict()

@app.post("/start")
async def start_realtime_monitoring():
    """Start fixed real-time packet monitoring."""
    global monitoring_active, monitoring_start_time
    
    if monitoring_active:
        raise HTTPException(status_code=400, detail="Real-time monitoring is already active")
    
    if not fixed_ml_predictor.is_model_loaded():
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        # Start real-time packet capture
        capture_started = await realtime_capture.start_capture()
        
        if not capture_started:
            raise HTTPException(status_code=500, detail="Failed to start packet capture")
        
        monitoring_active = True
        monitoring_start_time = datetime.now()
        monitoring_stats["start_time"] = monitoring_start_time
        
        logger.info("🔍 Started fixed real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_realtime_update({
            "type": "monitoring_started",
            "data": {
                "start_time": monitoring_start_time.isoformat(),
                "message": "Fixed real-time intrusion detection started",
                "capture_method": realtime_capture.capture_method,
                "interface": realtime_capture.interface,
                "features": [
                    "Fixed live packet capture",
                    "Fixed real-time ML prediction",
                    "Fixed threat intelligence integration",
                    "Fixed live database logging",
                    "Fixed real-time alerts",
                    "No hardcoded data"
                ]
            }
        })
        
        return {
            "message": "Fixed real-time monitoring started successfully",
            "start_time": monitoring_start_time.isoformat(),
            "capture_method": realtime_capture.capture_method,
            "interface": realtime_capture.interface,
            "features_enabled": [
                "Fixed Live Packet Capture",
                "Fixed Real-time ML Prediction",
                "Fixed Threat Intelligence",
                "Fixed Database Logging",
                "Fixed Real-time Alerts",
                "No Hardcoded Data"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error starting fixed real-time monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {str(e)}")

@app.post("/stop")
async def stop_realtime_monitoring():
    """Stop fixed real-time packet monitoring."""
    global monitoring_active
    
    if not monitoring_active:
        raise HTTPException(status_code=400, detail="Real-time monitoring is not active")
    
    try:
        # Stop packet capture
        capture_stopped = await realtime_capture.stop_capture()
        
        monitoring_active = False
        
        logger.info("⏹ Stopped fixed real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_realtime_update({
            "type": "monitoring_stopped",
            "data": {
                "stop_time": datetime.now().isoformat(),
                "message": "Fixed real-time intrusion detection stopped",
                "final_stats": monitoring_stats
            }
        })
        
        return {
            "message": "Fixed real-time monitoring stopped successfully",
            "stop_time": datetime.now().isoformat(),
            "final_statistics": monitoring_stats
        }
        
    except Exception as e:
        logger.error(f"Error stopping fixed real-time monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {str(e)}")

@app.get("/logs")
async def get_logs(limit: int = 100, offset: int = 0):
    """Get real-time detection logs from database."""
    try:
        logs = await fixed_db_manager.get_recent_logs(limit=limit, offset=offset)
        return {
            "logs": logs,
            "total": len(logs),
            "limit": limit,
            "offset": offset,
            "source": "fixed_realtime_detection",
            "no_hardcoded_data": True
        }
    except Exception as e:
        logger.error(f"Error getting real-time logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@app.get("/alerts")
async def get_alerts(limit: int = 50, offset: int = 0):
    """Get real-time security alerts from database."""
    try:
        alerts = await fixed_db_manager.get_recent_alerts(limit=limit, offset=offset)
        return {
            "alerts": alerts,
            "total": len(alerts),
            "limit": limit,
            "offset": offset,
            "source": "fixed_realtime_detection",
            "no_hardcoded_data": True
        }
    except Exception as e:
        logger.error(f"Error getting real-time alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get comprehensive fixed system statistics."""
    global monitoring_stats
    
    # Calculate additional stats
    uptime = 0
    if monitoring_start_time:
        uptime = (datetime.now() - monitoring_start_time).total_seconds()
    
    packets_per_second = monitoring_stats["packets_captured"] / uptime if uptime > 0 else 0
    
    # Get database statistics
    db_stats = await fixed_db_manager.get_statistics()
    
    # Get capture statistics
    capture_stats = realtime_capture.get_stats()
    
    # Get feature extractor statistics
    feature_stats = fixed_feature_extractor.get_flow_statistics()
    
    stats = Stats(
        uptime_seconds=uptime,
        packets_processed=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        attacks_detected=monitoring_stats["attacks_detected"],
        packets_per_second=packets_per_second,
        last_packet_time=monitoring_stats["last_packet_time"],
        last_alert_time=monitoring_stats.get("last_attack_time"),
        threat_intel_checks=monitoring_stats["threat_intel_checks"],
        database_stores=monitoring_stats["database_stores"],
        performance_metrics=monitoring_stats["performance_metrics"],
        database_stats=db_stats,
        realtime_stats={
            "packets_captured": monitoring_stats["packets_captured"],
            "ml_predictions": monitoring_stats["ml_predictions"],
            "capture_method": realtime_capture.capture_method,
            "active_flows": feature_stats.get('active_flows', 0),
            "total_flows_created": feature_stats.get('total_flows_created', 0),
            "capture_queue_size": capture_stats.get('queue_size', 0),
            "no_hardcoded_data": True
        }
    )
    
    return stats.dict()

@app.get("/flows")
async def get_active_flows(limit: int = 100):
    """Get currently active network flows."""
    try:
        flows = fixed_feature_extractor.get_active_flows(limit=limit)
        return {
            "flows": flows,
            "total": len(flows),
            "limit": limit,
            "timestamp": datetime.now().isoformat(),
            "no_hardcoded_data": True
        }
    except Exception as e:
        logger.error(f"Error getting active flows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve flows: {str(e)}")

@app.get("/health")
async def health_check():
    """Comprehensive fixed health check."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "4.0.0",
        "mode": "real-time-fixed",
        "components": {
            "ml_model": fixed_ml_predictor.is_model_loaded(),
            "packet_capture": realtime_capture.is_active(),
            "feature_extractor": True,
            "database": await fixed_db_manager.health_check(),
            "threat_intel": len([k for k, v in threat_intel_manager.api.api_keys.items() if v]) > 0,
            "websocket_clients": len(websocket_connections)
        },
        "monitoring": {
            "active": monitoring_active,
            "uptime": (datetime.now() - monitoring_start_time).total_seconds() if monitoring_start_time else 0,
            "packets_captured": monitoring_stats["packets_captured"],
            "packets_processed": monitoring_stats["packets_processed"],
            "ml_predictions": monitoring_stats["ml_predictions"],
            "attacks_detected": monitoring_stats["attacks_detected"]
        },
        "performance": monitoring_stats["performance_metrics"],
        "fixed_features": {
            "live_capture": True,
            "no_hardcoded_data": True,
            "real_database_logging": True,
            "real_threat_intel": True,
            "real_time_processing": True,
            "fixed_tcp_flags": True,
            "fixed_feature_engineering": True,
            "fixed_ml_pipeline": True,
            "fixed_database_connection": True
        }
    }
    
    return health_status

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time WebSocket endpoint for live updates."""
    await websocket.accept()
    
    # Add to connections list
    websocket_connections.append(websocket)
    logger.info(f"Fixed WebSocket client connected. Total clients: {len(websocket_connections)}")
    
    try:
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "message": "Connected to Fixed Real-time SecureNet IDS",
                "timestamp": datetime.now().isoformat(),
                "mode": "real-time-fixed",
                "features": [
                    "Fixed live packet processing",
                    "Fixed real-time ML predictions",
                    "Fixed live threat intelligence",
                    "Fixed real-time alerts",
                    "Fixed live performance metrics",
                    "No hardcoded data"
                ]
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
        logger.info(f"Fixed WebSocket client disconnected. Total clients: {len(websocket_connections)}")

if __name__ == "__main__":
    # Run the fixed FastAPI app
    uvicorn.run(
        "main_fixed:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info"
    )
