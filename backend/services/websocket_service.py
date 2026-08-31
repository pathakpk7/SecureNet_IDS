"""
WebSocket Service for SecureNet IDS
Handles WebSocket connections, broadcasting, and real-time updates
"""

import logging
from typing import List
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect


logger = logging.getLogger(__name__)


class WebSocketService:
    """
    WebSocket Service - Connection management and broadcasting
    
    Responsibilities:
    - Connection management
    - Broadcast messages
    - Real-time notifications
    - Live updates
    
    NO business logic in this service.
    ONLY connection management and message broadcasting.
    """
    
    def __init__(self):
        """Initialize WebSocket Service"""
        self.active_connections: List[WebSocket] = []
        logger.info("WebSocketService initialized")
    
    async def connect(self, websocket: WebSocket) -> None:
        """
        Accept and register a WebSocket connection
        
        Args:
            websocket: WebSocket connection
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket) -> None:
        """
        Disconnect and remove a WebSocket connection
        
        Args:
            websocket: WebSocket connection
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        """
        Send a message to a specific WebSocket connection
        
        Args:
            message: Message to send
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: dict) -> None:
        """
        Broadcast a message to all connected WebSocket clients
        
        Args:
            message: Message dictionary to broadcast
        """
        from fastapi.encoders import jsonable_encoder
        safe_message = jsonable_encoder(message)
        for connection in self.active_connections[:]:  # Copy list to avoid modification during iteration
            try:
                await connection.send_json(safe_message)
            except Exception:
                self.disconnect(connection)
    
    async def broadcast_alert(self, alert) -> None:
        """
        Broadcast an alert to all connected clients
        
        Args:
            alert: Alert object to broadcast
        """
        dump = alert.model_dump() if hasattr(alert, 'model_dump') else (alert.dict() if hasattr(alert, 'dict') else alert)
        message = {
            "type": "alert",
            "data": dump,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_packet_update(
        self,
        packet,
        prediction_result,
        detection_data: dict,
        stats: dict
    ) -> None:
        """
        Broadcast a packet processing update to all connected clients
        
        Args:
            packet: Packet data
            prediction_result: ML prediction result
            detection_data: Complete detection data
            stats: Monitoring statistics
        """
        pkt_dump = packet.model_dump() if hasattr(packet, 'model_dump') else (packet.dict() if hasattr(packet, 'dict') else packet)
        pred_dump = prediction_result.model_dump() if hasattr(prediction_result, 'model_dump') else (prediction_result.dict() if hasattr(prediction_result, 'dict') else prediction_result)
        message = {
            "type": "packet",
            "data": {
                "packet": pkt_dump,
                "prediction": pred_dump,
                "detection": detection_data,
                "stats": stats
            },
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_status_update(self, monitoring_active: bool, stats: dict) -> None:
        """
        Broadcast a monitoring status update to all connected clients
        
        Args:
            monitoring_active: Whether monitoring is active
            stats: Monitoring statistics
        """
        message = {
            "type": "status",
            "data": {
                "monitoring_active": monitoring_active,
                "stats": stats
            },
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def send_initial_status(self, websocket: WebSocket, monitoring_active: bool, stats: dict) -> None:
        """
        Send initial status to a newly connected WebSocket client
        
        Args:
            websocket: WebSocket connection
            monitoring_active: Whether monitoring is active
            stats: Monitoring statistics
        """
        message = {
            "type": "connected",
            "data": {
                "status": monitoring_active,
                "stats": stats
            },
            "timestamp": datetime.now().isoformat()
        }
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending initial status: {e}")
            self.disconnect(websocket)
    
    def get_connection_count(self) -> int:
        """
        Get the number of active WebSocket connections
        
        Returns:
            Number of active connections
        """
        return len(self.active_connections)
    
    def get_active_connections(self) -> List[WebSocket]:
        """
        Get list of active WebSocket connections
        
        Returns:
            List of active WebSocket connections
        """
        return self.active_connections.copy()
