"""
SecureNet IDS - Monitoring Control API Routes

This module provides REST API endpoints for controlling network
monitoring including start/stop, status, and configuration.
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import asyncio

from ..rbac.permissions import Role, Permission, PermissionChecker
from ..database.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/monitoring", tags=["monitoring"])

# Global monitoring state
monitoring_state = {
    "is_monitoring": False,
    "start_time": None,
    "packets_captured": 0,
    "alerts_generated": 0,
    "current_interface": None,
    "uptime_seconds": 0
}

# WebSocket connections
active_websockets: set[WebSocket] = set()


# Pydantic models
class MonitoringStartRequest(BaseModel):
    """Model for starting monitoring."""
    interface: str = Field(..., description="Network interface to monitor")
    org_id: Optional[str] = Field(None, description="Organization ID for data isolation")


class MonitoringStatusResponse(BaseModel):
    """Model for monitoring status response."""
    is_monitoring: bool
    start_time: Optional[datetime]
    packets_captured: int
    alerts_generated: int
    current_interface: Optional[str]
    uptime_seconds: int


class MonitoringConfigResponse(BaseModel):
    """Model for monitoring configuration."""
    interface: str
    confidence_threshold: float
    max_packet_size: int
    capture_timeout: int
    ml_weight: float
    threat_intel_weight: float


# Dependency injection
def get_audit_repository(supabase_client):
    """Get audit repository instance."""
    return AuditRepository(supabase_client)


# API Endpoints
@router.post("/start", status_code=status.HTTP_200_OK)
async def start_monitoring(
    request: MonitoringStartRequest,
    user_id: str,
    user_role: Role,
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Start network packet monitoring.
    
    Requires: MONITORING_START permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.MONITORING_START, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to start monitoring"
        )
    
    try:
        if monitoring_state["is_monitoring"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring is already active"
            )
        
        # Update monitoring state
        monitoring_state["is_monitoring"] = True
        monitoring_state["start_time"] = datetime.utcnow()
        monitoring_state["current_interface"] = request.interface
        monitoring_state["org_id"] = request.org_id
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=request.org_id,
            action="monitoring_started",
            resource_type="monitoring",
            details={
                "interface": request.interface,
                "org_id": request.org_id
            }
        )
        
        # Broadcast to WebSocket clients
        await broadcast_monitoring_update({
            "type": "monitoring_started",
            "interface": request.interface,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Monitoring started on interface {request.interface} by user {user_id}")
        
        return {
            "success": True,
            "message": "Monitoring started successfully",
            "interface": request.interface,
            "start_time": monitoring_state["start_time"].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting monitoring: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/stop", status_code=status.HTTP_200_OK)
async def stop_monitoring(
    user_id: str,
    user_role: Role,
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Stop network packet monitoring.
    
    Requires: MONITORING_STOP permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.MONITORING_STOP, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to stop monitoring"
        )
    
    try:
        if not monitoring_state["is_monitoring"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monitoring is not active"
            )
        
        # Calculate uptime
        if monitoring_state["start_time"]:
            uptime = (datetime.utcnow() - monitoring_state["start_time"]).total_seconds()
            monitoring_state["uptime_seconds"] = int(uptime)
        
        # Update monitoring state
        monitoring_state["is_monitoring"] = False
        monitoring_state["start_time"] = None
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=monitoring_state.get("org_id"),
            action="monitoring_stopped",
            resource_type="monitoring",
            details={
                "packets_captured": monitoring_state["packets_captured"],
                "alerts_generated": monitoring_state["alerts_generated"],
                "uptime_seconds": monitoring_state["uptime_seconds"]
            }
        )
        
        # Broadcast to WebSocket clients
        await broadcast_monitoring_update({
            "type": "monitoring_stopped",
            "timestamp": datetime.utcnow().isoformat(),
            "packets_captured": monitoring_state["packets_captured"],
            "alerts_generated": monitoring_state["alerts_generated"]
        })
        
        logger.info(f"Monitoring stopped by user {user_id}")
        
        return {
            "success": True,
            "message": "Monitoring stopped successfully",
            "packets_captured": monitoring_state["packets_captured"],
            "alerts_generated": monitoring_state["alerts_generated"],
            "uptime_seconds": monitoring_state["uptime_seconds"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping monitoring: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/status", response_model=MonitoringStatusResponse)
async def get_monitoring_status(
    user_id: str,
    user_role: Role,
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get current monitoring status.
    
    Requires: MONITORING_VIEW permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.MONITORING_VIEW, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view monitoring status"
            )
    
    try:
        # Update uptime if monitoring is active
        if monitoring_state["is_monitoring"] and monitoring_state["start_time"]:
            uptime = (datetime.utcnow() - monitoring_state["start_time"]).total_seconds()
            monitoring_state["uptime_seconds"] = int(uptime)
        
        return MonitoringStatusResponse(
            is_monitoring=monitoring_state["is_monitoring"],
            start_time=monitoring_state["start_time"],
            packets_captured=monitoring_state["packets_captured"],
            alerts_generated=monitoring_state["alerts_generated"],
            current_interface=monitoring_state["current_interface"],
            uptime_seconds=monitoring_state["uptime_seconds"]
        )
        
    except Exception as e:
        logger.error(f"Error getting monitoring status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/config", response_model=MonitoringConfigResponse)
async def get_monitoring_config(
    user_id: str,
    user_role: Role,
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get monitoring configuration.
    
    Requires: MONITORING_VIEW permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.MONITORING_VIEW, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view monitoring configuration"
            )
    
    try:
        from ..config_enhanced import enhanced_settings
        
        return MonitoringConfigResponse(
            interface=enhanced_settings.network_interface,
            confidence_threshold=enhanced_settings.confidence_threshold,
            max_packet_size=enhanced_settings.max_packet_size,
            capture_timeout=enhanced_settings.connection_timeout,
            ml_weight=enhanced_settings.ml_weight,
            threat_intel_weight=enhanced_settings.threat_intel_weight
        )
        
    except Exception as e:
        logger.error(f"Error getting monitoring config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/config")
async def update_monitoring_config(
    user_id: str,
    user_role: Role,
    config: MonitoringConfigResponse,
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Update monitoring configuration.
    
    Requires: MONITORING_CONFIGURE permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.MONITORING_CONFIGURE, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to configure monitoring"
        )
    
    try:
        # This would update the configuration
        # For now, just log the action
        await audit_repo.log_action(
            user_id=user_id,
            action="monitoring_config_updated",
            resource_type="monitoring",
            details=config.model_dump()
        )
        
        return {
            "success": True,
            "message": "Monitoring configuration updated"
        }
        
    except Exception as e:
        logger.error(f"Error updating monitoring config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.websocket("/ws")
async def monitoring_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time monitoring updates.
    """
    await websocket.accept()
    active_websockets.add(websocket)
    
    try:
        # Send initial status
        await websocket.send_json({
            "type": "status",
            "data": monitoring_state,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep connection alive and send updates
        while True:
            await asyncio.sleep(5)  # Send updates every 5 seconds
            
            if monitoring_state["is_monitoring"]:
                await websocket.send_json({
                    "type": "status_update",
                    "data": {
                        "packets_captured": monitoring_state["packets_captured"],
                        "alerts_generated": monitoring_state["alerts_generated"],
                        "uptime_seconds": monitoring_state["uptime_seconds"]
                    },
                    "timestamp": datetime.utcnow().isoformat()
                })
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_websockets.discard(websocket)


async def broadcast_monitoring_update(message: Dict[str, Any]):
    """
    Broadcast monitoring update to all connected WebSocket clients.
    
    Args:
        message: Message to broadcast
    """
    if active_websockets:
        for websocket in active_websockets.copy():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to WebSocket: {e}")
                active_websockets.discard(websocket)


def update_monitoring_stats(packets_captured: int, alerts_generated: int):
    """
    Update monitoring statistics.
    
    Args:
        packets_captured: Number of packets captured
        alerts_generated: Number of alerts generated
    """
    monitoring_state["packets_captured"] += packets_captured
    monitoring_state["alerts_generated"] += alerts_generated
