"""
SecureNet IDS - Base SIEM Connector

This module provides the base connector class for SIEM integrations
with common functionality for all SIEM platforms.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)


class SIEMFormat:
    """Supported SIEM export formats"""
    JSON = "json"
    CEF = "cef"  # Common Event Format
    LEEF = "leef"  # Log Event Extended Format
    SPLUNK = "splunk"
    ELK = "elk"


class BaseSIEMConnector(ABC):
    """
    Base class for SIEM connectors.
    
    All SIEM connectors should inherit from this class and implement
    the required methods for exporting alerts and logs.
    """
    
    def __init__(self, config: Dict[str, Any], demo_mode: bool = False):
        """
        Initialize SIEM connector.
        
        Args:
            config: Connector configuration
            demo_mode: If True, use mock/demo mode without actual connections
        """
        self.config = config
        self.demo_mode = demo_mode
        self.is_connected = False
        self.last_export_time = None
        self.export_count = 0
    
    @abstractmethod
    async def connect(self) -> bool:
        """
        Establish connection to SIEM platform.
        
        Returns:
            True if connection successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """
        Disconnect from SIEM platform.
        
        Returns:
            True if disconnection successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def export_alert(self, alert: Dict[str, Any]) -> bool:
        """
        Export a single alert to SIEM.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            True if export successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def export_alerts_batch(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Export multiple alerts to SIEM in batch.
        
        Args:
            alerts: List of alert data dictionaries
            
        Returns:
            Export result dictionary with success/failure counts
        """
        pass
    
    @abstractmethod
    def format_alert(self, alert: Dict[str, Any], format: str = SIEMFormat.JSON) -> str:
        """
        Format alert data for specific SIEM format.
        
        Args:
            alert: Alert data dictionary
            format: Target format (json, cef, leef, etc.)
            
        Returns:
            Formatted alert string
        """
        pass
    
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test connection to SIEM platform.
        
        Returns:
            Test result dictionary
        """
        if self.demo_mode:
            return {
                "success": True,
                "message": "Demo mode - connection test skipped",
                "demo_mode": True,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        try:
            connected = await self.connect()
            if connected:
                await self.disconnect()
                return {
                    "success": True,
                    "message": "Connection test successful",
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "success": False,
                    "message": "Connection test failed",
                    "demo_mode": False,
                    "timestamp": datetime.utcnow().isoformat()
                }
        except Exception as e:
            logger.error(f"Connection test error: {e}")
            return {
                "success": False,
                "message": f"Connection test error: {str(e)}",
                "demo_mode": False,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get connector status.
        
        Returns:
            Status dictionary
        """
        return {
            "connected": self.is_connected,
            "demo_mode": self.demo_mode,
            "last_export_time": self.last_export_time,
            "export_count": self.export_count,
            "config": {
                "endpoint": self.config.get("endpoint", "N/A"),
                "format": self.config.get("format", "json")
            }
        }
    
    def _log_export(self, success: bool, count: int = 1):
        """
        Log export operation.
        
        Args:
            success: Whether export was successful
            count: Number of items exported
        """
        if success:
            self.export_count += count
            self.last_export_time = datetime.utcnow().isoformat()
            logger.info(f"Exported {count} items to SIEM successfully")
        else:
            logger.error(f"Failed to export {count} items to SIEM")
    
    def _validate_config(self, required_fields: List[str]) -> bool:
        """
        Validate connector configuration.
        
        Args:
            required_fields: List of required configuration fields
            
        Returns:
            True if configuration is valid, False otherwise
        """
        for field in required_fields:
            if field not in self.config or not self.config[field]:
                logger.error(f"Missing required configuration field: {field}")
                return False
        return True
