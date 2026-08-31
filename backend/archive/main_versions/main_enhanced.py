#!/usr/bin/env python3
"""
SecureNet IDS - Enhanced Real-time Intrusion Detection System
Production-ready FastAPI backend with comprehensive threat intelligence integration.
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import json
import time
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Load environment variables
load_dotenv()

# Import enhanced components
from .config import settings
from .database_enhanced import enhanced_db_manager
from .schemas import Alert, LogEntry, Stats, MonitoringStatus, WebSocketMessage
from .capture import AsyncPacketCapture
from .feature_engineering import cicids_feature_extractor
from .predictor import MLPredictor
from .threat_intel import threat_intel_manager

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('secretnet_ids.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Global variables for monitoring
packet_capture: Optional[AsyncPacketCapture] = None
ml_predictor: Optional[MLPredictor] = None
monitoring_active: bool = False
monitoring_start_time: Optional[datetime] = None
websocket_connections: List[WebSocket] = []

# Enhanced monitoring statistics
monitoring_stats = {
    "packets_processed": 0,
    "alerts_generated": 0,
    "attacks_detected": 0,
    "threat_intel_checks": 0,
    "database_stores": 0,
    "start_time": None,
    "last_packet_time": None,
    "last_alert_time": None,
    "last_threat_intel_time": None,
    "performance_metrics": {
        "avg_prediction_time": 0.0,
        "avg_threat_intel_time": 0.0,
        "avg_database_time": 0.0
    }
}

# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="SecureNet IDS API - Enhanced",
    description="Production-ready Real-time Intrusion Detection System with Threat Intelligence",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware with enhanced security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize all components on startup."""
    global packet_capture, ml_predictor
    
    logger.info("🚀 Starting Enhanced SecureNet IDS Backend...")
    
    # Initialize ML predictor
    ml_predictor = MLPredictor()
    if ml_predictor.load_model():
        logger.info("✅ CICIDS2017 ML model loaded successfully")
    else:
        logger.error("❌ Failed to load ML model")
        return
    
    # Initialize packet capture
    packet_capture = AsyncPacketCapture(
        interface=settings.network_interface,
        packet_callback=process_packet_enhanced
    )
    
    # Initialize database
    if enhanced_db_manager.is_connected():
        logger.info("✅ Database connection established")
    else:
        logger.warning("⚠️ Database not available - features will be limited")
    
    # Log system information
    logger.info("📊 System Information:")
    logger.info(f"   - Network Interface: {settings.network_interface}")
    logger.info(f"   - Database Connected: {enhanced_db_manager.is_connected()}")
    logger.info(f"   - Threat Intel APIs: {len(threat_intel_manager.api.api_keys)} available")
    
    logger.info("✅ Enhanced SecureNet IDS Backend initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global monitoring_active, packet_capture
    
    logger.info("🛑 Shutting down Enhanced SecureNet IDS...")
    
    if monitoring_active:
        await stop_monitoring_enhanced()
    
    # Cleanup database connection
    if enhanced_db_manager.is_connected():
        logger.info("📊 Database connection closed")
    
    logger.info("✅ Enhanced SecureNet IDS Backend shutdown complete")

async def process_packet_enhanced(packet_data):
    """Enhanced packet processing with threat intelligence integration."""
    global monitoring_stats
    
    try:
        start_time = time.time()
        
        # Update statistics
        monitoring_stats["packets_processed"] += 1
        monitoring_stats["last_packet_time"] = datetime.now()
        
        # Extract CICIDS features
        features_dict = cicids_feature_extractor.extract_cicids_features(packet_data)
        
        if not features_dict:
            logger.warning("Failed to extract features from packet")
            return
        
        # Make ML prediction
        ml_start = time.time()
        prediction_result = ml_predictor.predict_with_details_cicids(features_dict)
        ml_time = time.time() - ml_start
        
        if not prediction_result:
            logger.error("ML prediction failed")
            return
        
        is_attack = prediction_result.get('prediction', 0) == 1
        ml_confidence = prediction_result.get('confidence', 0.0)
        
        # Prepare basic detection data
        detection_data = {
            "timestamp": datetime.now().isoformat(),
            "source_ip": packet_data.source_ip,
            "destination_ip": packet_data.destination_ip,
            "protocol": packet_data.protocol.value,
            "packet_length": packet_data.packet_length,
            "prediction": is_attack,
            "confidence": ml_confidence,
            "attack_type": prediction_result.get('attack_type', 'normal'),
            "risk_level": 'LOW',
            "features": features_dict,
            "threat_intel": {},
            "ml_confidence": ml_confidence,
            "sources": ["ML"]
        }
        
        # If attack detected, call threat intelligence APIs
        if is_attack:
            monitoring_stats["attacks_detected"] += 1
            
            # Extract IP for threat intelligence check
            ip_address = packet_data.source_ip
            
            # Call threat intelligence APIs
            threat_start = time.time()
            threat_results = await threat_intel_manager.check_ip(ip_address)
            threat_time = time.time() - threat_start
            
            monitoring_stats["threat_intel_checks"] += 1
            monitoring_stats["last_threat_intel_time"] = datetime.now()
            
            # Analyze threat intelligence results
            threat_analysis = threat_intel_manager.analyze_threat_intel(threat_results)
            
            # Update detection data with threat intelligence
            detection_data.update({
                "threat_intel": threat_results,
                "attack_type": threat_analysis.get('attack_type', prediction_result.get('attack_type')),
                "risk_level": threat_analysis.get('risk_level', 'MEDIUM'),
                "sources": detection_data["sources"] + threat_analysis.get('sources', []),
                "confidence": max(ml_confidence, threat_analysis.get('confidence', 0.0))
            })
            
            # Update performance metrics
            monitoring_stats["performance_metrics"]["avg_threat_intel_time"] = (
                (monitoring_stats["performance_metrics"]["avg_threat_intel_time"] + threat_time) / 2
            )
            
            # Create and store security alert
            await create_security_alert(packet_data, prediction_result, threat_analysis, threat_results)
        
        # Store detection log in database
        db_start = time.time()
        log_stored = await enhanced_db_manager.store_detection_log(detection_data)
        db_time = time.time() - db_start
        
        if log_stored:
            monitoring_stats["database_stores"] += 1
        
        # Update performance metrics
        monitoring_stats["performance_metrics"]["avg_prediction_time"] = (
            (monitoring_stats["performance_metrics"]["avg_prediction_time"] + ml_time) / 2
        )
        monitoring_stats["performance_metrics"]["avg_database_time"] = (
            (monitoring_stats["performance_metrics"]["avg_database_time"] + db_time) / 2
        )
        
        # Log the detection
        log_entry = LogEntry(
            timestamp=datetime.now(),
            source_ip=packet_data.source_ip,
            destination_ip=packet_data.destination_ip,
            protocol=packet_data.protocol.value,
            packet_length=packet_data.packet_length,
            prediction=is_attack,
            confidence=ml_confidence,
            attack_type=detection_data.get('attack_type', 'unknown'),
            risk_level=detection_data.get('risk_level', 'low')
        )
        
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
                    "confidence": ml_confidence,
                    "attack_type": detection_data.get('attack_type', 'unknown'),
                    "risk_level": detection_data.get('risk_level', 'low'),
                    "sources": detection_data.get('sources', [])
                },
                "threat_intel": detection_data.get('threat_intel', {}),
                "stats": monitoring_stats
            }
        })
        
        # Log critical alerts
        if is_attack and detection_data.get('risk_level') in ['HIGH', 'CRITICAL']:
            logger.critical(f"🚨 CRITICAL THREAT DETECTED: {packet_data.source_ip} -> {packet_data.destination_ip} "
                           f"({detection_data.get('attack_type')}) - Risk Level: {detection_data.get('risk_level')}")
        
        total_time = time.time() - start_time
        logger.debug(f"Packet processing completed in {total_time:.3f}s")
        
    except Exception as e:
        logger.error(f"Error processing packet: {str(e)}")

async def create_security_alert(packet_data, prediction_result, threat_analysis, threat_results):
    """Create and store security alert."""
    global monitoring_stats
    
    try:
        monitoring_stats["alerts_generated"] += 1
        monitoring_stats["last_alert_time"] = datetime.now()
        
        # Generate unique alert ID
        alert_id = f"alert_{int(time.time())}_{packet_data.source_ip.replace('.', '_')}"
        
        # Create alert data
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
                    "packet_length": packet_data.packet_length
                }
            },
            "threat_intel_results": threat_results,
            "ml_prediction": prediction_result,
            "sources": ["ML"] + threat_analysis.get('sources', []),
            "alert_flag": threat_analysis.get('risk_level') == 'CRITICAL'
        }
        
        # Store alert in database
        alert_stored = await enhanced_db_manager.store_security_alert(alert_data)
        
        if alert_stored:
            # Send alert to WebSocket clients
            await send_websocket_update({
                "type": "security_alert",
                "data": alert_data
            })
            
            logger.warning(f"🚨 Security Alert Generated: {packet_data.source_ip} -> {packet_data.destination_ip} "
                         f"({alert_data.get('attack_type')}) - Risk: {alert_data.get('risk_level')}")
        
    except Exception as e:
        logger.error(f"Error creating security alert: {str(e)}")

async def send_websocket_update(message: dict):
    """Send message to all connected WebSocket clients."""
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

# Enhanced API Endpoints
@app.get("/")
async def root():
    """Root endpoint with system information."""
    return {
        "message": "SecureNet IDS API - Enhanced",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "CICIDS2017 ML Model",
            "Real-time Packet Capture",
            "Threat Intelligence Integration",
            "Supabase Database Storage",
            "WebSocket Real-time Updates",
            "Production-ready Monitoring"
        ]
    }

@app.get("/status")
async def get_status():
    """Get comprehensive system status."""
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
    
    # Get database stats
    db_stats = await enhanced_db_manager.get_statistics()
    
    # Get database health
    db_health = await enhanced_db_manager.health_check()
    
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
        feature_stats=feature_stats,
        database_stats=db_stats,
        database_health=db_health,
        performance_metrics=monitoring_stats["performance_metrics"],
        threat_intel_stats={
            "checks_performed": monitoring_stats["threat_intel_checks"],
            "last_check": monitoring_stats["last_threat_intel_time"],
            "available_apis": len([k for k, v in threat_intel_manager.api.api_keys.items() if v])
        }
    )
    
    return status.dict()

@app.post("/start")
async def start_monitoring():
    """Start enhanced packet monitoring and intrusion detection."""
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
        
        logger.info("🔍 Started enhanced real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_websocket_update({
            "type": "monitoring_started",
            "data": {
                "start_time": monitoring_start_time.isoformat(),
                "message": "Enhanced real-time intrusion detection started",
                "features": [
                    "ML-based detection",
                    "Threat intelligence integration",
                    "Database logging",
                    "Real-time alerts"
                ]
            }
        })
        
        return {
            "message": "Enhanced monitoring started successfully",
            "start_time": monitoring_start_time.isoformat(),
            "features_enabled": [
                "ML Detection",
                "Threat Intelligence",
                "Database Storage",
                "Real-time Alerts"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error starting enhanced monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {str(e)}")

@app.post("/stop")
async def stop_monitoring_enhanced():
    """Stop enhanced packet monitoring and intrusion detection."""
    global monitoring_active
    
    if not monitoring_active:
        raise HTTPException(status_code=400, detail="Monitoring is not active")
    
    try:
        # Stop packet capture
        await packet_capture.stop_capture()
        
        monitoring_active = False
        
        logger.info("⏹ Stopped enhanced real-time intrusion detection monitoring")
        
        # Send WebSocket update
        await send_websocket_update({
            "type": "monitoring_stopped",
            "data": {
                "stop_time": datetime.now().isoformat(),
                "message": "Enhanced real-time intrusion detection stopped",
                "final_stats": monitoring_stats
            }
        })
        
        return {
            "message": "Enhanced monitoring stopped successfully",
            "stop_time": datetime.now().isoformat(),
            "final_statistics": monitoring_stats
        }
        
    except Exception as e:
        logger.error(f"Error stopping enhanced monitoring: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {str(e)}")

@app.get("/logs")
async def get_logs(limit: int = 100, offset: int = 0):
    """Get recent detection logs with enhanced filtering."""
    try:
        logs = await enhanced_db_manager.get_recent_logs(limit=limit, offset=offset)
        return {
            "logs": logs,
            "total": len(logs),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@app.get("/alerts")
async def get_alerts(limit: int = 50, offset: int = 0):
    """Get recent security alerts."""
    try:
        alerts = await enhanced_db_manager.get_recent_alerts(limit=limit, offset=offset)
        return {
            "alerts": alerts,
            "total": len(alerts),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get comprehensive system statistics."""
    global monitoring_stats
    
    # Calculate additional stats
    uptime = 0
    if monitoring_start_time:
        uptime = (datetime.now() - monitoring_start_time).total_seconds()
    
    packets_per_second = monitoring_stats["packets_processed"] / uptime if uptime > 0 else 0
    
    # Get database statistics
    db_stats = await enhanced_db_manager.get_statistics()
    
    stats = Stats(
        uptime_seconds=uptime,
        packets_processed=monitoring_stats["packets_processed"],
        alerts_generated=monitoring_stats["alerts_generated"],
        attacks_detected=monitoring_stats["attacks_detected"],
        packets_per_second=packets_per_second,
        last_packet_time=monitoring_stats["last_packet_time"],
        last_alert_time=monitoring_stats["last_alert_time"],
        threat_intel_checks=monitoring_stats["threat_intel_checks"],
        database_stores=monitoring_stats["database_stores"],
        performance_metrics=monitoring_stats["performance_metrics"],
        database_stats=db_stats
    )
    
    return stats.dict()

@app.get("/ip/{ip_address}/logs")
async def get_ip_logs(ip_address: str, limit: int = 50):
    """Get logs for specific IP address."""
    try:
        logs = await enhanced_db_manager.get_logs_by_ip(ip_address, limit=limit)
        return {
            "ip_address": ip_address,
            "logs": logs,
            "total": len(logs)
        }
    except Exception as e:
        logger.error(f"Error getting IP logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve IP logs: {str(e)}")

@app.get("/alerts/risk/{risk_level}")
async def get_alerts_by_risk(risk_level: str, limit: int = 50):
    """Get alerts by risk level."""
    try:
        if risk_level not in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            raise HTTPException(status_code=400, detail="Invalid risk level")
        
        alerts = await enhanced_db_manager.get_alerts_by_risk_level(risk_level, limit=limit)
        return {
            "risk_level": risk_level,
            "alerts": alerts,
            "total": len(alerts)
        }
    except Exception as e:
        logger.error(f"Error getting risk level alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.post("/cleanup")
async def cleanup_database(days: int = 30):
    """Clean up old database records."""
    try:
        success = await enhanced_db_manager.cleanup_old_records(days=days)
        return {
            "message": f"Database cleanup completed",
            "days_kept": days,
            "success": success
        }
    except Exception as e:
        logger.error(f"Error during database cleanup: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database cleanup failed: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Enhanced WebSocket endpoint for real-time updates."""
    await websocket.accept()
    
    # Add to connections list
    websocket_connections.append(websocket)
    logger.info(f"WebSocket client connected. Total clients: {len(websocket_connections)}")
    
    try:
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {
                "message": "Connected to Enhanced SecureNet IDS",
                "timestamp": datetime.now().isoformat(),
                "features": [
                    "Real-time ML predictions",
                    "Threat intelligence integration",
                    "Live alerts",
                    "Performance metrics"
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
        logger.info(f"WebSocket client disconnected. Total clients: {len(websocket_connections)}")

@app.get("/health")
async def health_check():
    """Comprehensive health check endpoint."""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "components": {
            "ml_model": ml_predictor.is_model_loaded() if ml_predictor else False,
            "packet_capture": packet_capture.capture.is_capturing if packet_capture else False,
            "database": await enhanced_db_manager.health_check(),
            "threat_intel": len([k for k, v in threat_intel_manager.api.api_keys.items() if v]) > 0,
            "feature_extractor": True,
            "websocket_clients": len(websocket_connections)
        },
        "monitoring": {
            "active": monitoring_active,
            "uptime": (datetime.now() - monitoring_start_time).total_seconds() if monitoring_start_time else 0,
            "packets_processed": monitoring_stats["packets_processed"],
            "alerts_generated": monitoring_stats["alerts_generated"]
        },
        "performance": monitoring_stats["performance_metrics"]
    }
    
    return health_status

if __name__ == "__main__":
    # Run the enhanced FastAPI app
    uvicorn.run(
        "main_enhanced:app",
        host=settings.host,
        port=settings.port,
        reload=False,
        log_level="info"
    )
