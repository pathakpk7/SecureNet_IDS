"""
Monitoring Service for SecureNet IDS
Handles monitoring lifecycle, capture control, and monitoring state
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional

from core.config import settings
from capture import AsyncPacketCapture
from schemas import MonitoringStatus


logger = logging.getLogger(__name__)


class MonitoringService:
    """
    Monitoring Service - Monitoring lifecycle management
    
    Responsibilities:
    - Start monitoring
    - Stop monitoring
    - Monitoring state management
    - Capture control
    - Monitoring statistics tracking
    
    NO database code in this service.
    NO business logic beyond monitoring control.
    """
    
    def __init__(self, pipeline_service = None):
        """
        Initialize Monitoring Service
        
        Args:
            pipeline_service: Pipeline service for packet processing
        """
        self.pipeline_service = pipeline_service
        
        # Monitoring state
        self.monitoring_active: bool = False
        self.monitoring_start_time: Optional[datetime] = None
        self.packet_capture: Optional[AsyncPacketCapture] = None
        self.monitoring_task: Optional[asyncio.Task] = None
        
        # Monitoring statistics
        self.monitoring_stats = {
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
        
        logger.info("MonitoringService initialized")
    
    async def start_monitoring(self) -> bool:
        """
        Start network monitoring
        
        Returns:
            bool: True if monitoring started successfully, False otherwise
        """
        if self.monitoring_active:
            logger.warning("Monitoring is already active")
            return False
        
        try:
            # Initialize packet capture
            self.packet_capture = AsyncPacketCapture(
                interface=settings.network_interface,
                packet_callback=None  # We'll process in monitoring loop
            )
            
            # Start packet capture
            await self.packet_capture.start()
            
            self.monitoring_active = True
            self.monitoring_start_time = datetime.now()
            self.monitoring_stats["start_time"] = self.monitoring_start_time.isoformat()
            
            # Start monitoring loop in background
            self.monitoring_task = asyncio.create_task(self._monitoring_loop())
            
            logger.info("Monitoring started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}")
            return False
    
    async def stop_monitoring(self) -> bool:
        """
        Stop network monitoring
        
        Returns:
            bool: True if monitoring stopped successfully, False otherwise
        """
        if not self.monitoring_active:
            logger.warning("Monitoring is not active")
            return False
        
        try:
            self.monitoring_active = False
            
            # Cancel monitoring task
            if self.monitoring_task:
                self.monitoring_task.cancel()
                try:
                    await self.monitoring_task
                except asyncio.CancelledError:
                    pass
            
            # Stop packet capture
            if self.packet_capture:
                await self.packet_capture.stop()
            
            logger.info("Monitoring stopped successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop monitoring: {e}")
            return False
    
    async def _monitoring_loop(self) -> None:
        """
        Main monitoring loop for packet processing
        
        Continuously processes packets from the capture system through the
        complete IDS pipeline via PipelineService.
        """
        while self.monitoring_active:
            try:
                # Get packet from capture
                packet = await self.packet_capture.get_packet(timeout=1.0)
                
                if packet:
                    # Update capture statistics
                    self.monitoring_stats["packets_captured"] += 1
                    
                    # Process packet through pipeline
                    if self.pipeline_service:
                        detection_data = await self.pipeline_service.process_packet(packet)
                        
                        # Update statistics from pipeline
                        pipeline_stats = self.pipeline_service.get_pipeline_stats()
                        self.monitoring_stats.update(pipeline_stats)
                    
            except asyncio.TimeoutError:
                continue  # No packet received, continue loop
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(1)
    
    def get_monitoring_status(self) -> MonitoringStatus:
        """
        Get current monitoring status and statistics
        
        Returns:
            MonitoringStatus object
        """
        return MonitoringStatus(
            monitoring_active=self.monitoring_active,
            start_time=self.monitoring_start_time,
            statistics=self.monitoring_stats
        )
    
    def is_monitoring_active(self) -> bool:
        """
        Check if monitoring is currently active
        
        Returns:
            bool: True if monitoring is active
        """
        return self.monitoring_active
    
    def get_monitoring_stats(self) -> dict:
        """
        Get monitoring statistics
        
        Returns:
            Monitoring statistics dictionary
        """
        return self.monitoring_stats.copy()
    
    def reset_monitoring_stats(self) -> None:
        """Reset monitoring statistics"""
        self.monitoring_stats = {
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
        logger.info("Monitoring statistics reset")
