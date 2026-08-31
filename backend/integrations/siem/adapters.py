"""
SecureNet IDS - SIEM Adapters

This module provides adapter classes to manage SIEM connectors
and handle export operations across different SIEM platforms.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from .connectors.base_connector import BaseSIEMConnector, SIEMFormat
from .connectors.splunk_connector import SplunkConnector
from .connectors.elk_connector import ELKConnector
from .connectors.qradar_connector import QRadarConnector

logger = logging.getLogger(__name__)


class SIEMAdapter:
    """
    Adapter class to manage SIEM connectors and exports.
    
    This class provides a unified interface for managing multiple
    SIEM connectors and exporting alerts to different platforms.
    """
    
    def __init__(self):
        """Initialize SIEM adapter."""
        self.connectors: Dict[str, BaseSIEMConnector] = {}
        self.active_configs: Dict[str, Dict[str, Any]] = {}
    
    def register_connector(
        self,
        name: str,
        siem_type: str,
        config: Dict[str, Any],
        demo_mode: bool = False
    ) -> bool:
        """
        Register a SIEM connector.
        
        Args:
            name: Connector name/identifier
            siem_type: Type of SIEM (splunk, elk, qradar)
            config: Connector configuration
            demo_mode: If True, use demo mode
            
        Returns:
            True if registration successful, False otherwise
        """
        try:
            connector = self._create_connector(siem_type, config, demo_mode)
            if connector:
                self.connectors[name] = connector
                self.active_configs[name] = {
                    "type": siem_type,
                    "config": config,
                    "demo_mode": demo_mode,
                    "registered_at": datetime.utcnow().isoformat()
                }
                logger.info(f"Registered SIEM connector: {name} ({siem_type})")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to register connector {name}: {e}")
            return False
    
    def unregister_connector(self, name: str) -> bool:
        """
        Unregister a SIEM connector.
        
        Args:
            name: Connector name/identifier
            
        Returns:
            True if unregistration successful
        """
        if name in self.connectors:
            del self.connectors[name]
            del self.active_configs[name]
            logger.info(f"Unregistered SIEM connector: {name}")
            return True
        return False
    
    async def export_to_connector(
        self,
        connector_name: str,
        alerts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Export alerts to a specific connector.
        
        Args:
            connector_name: Name of connector to export to
            alerts: List of alert data dictionaries
            
        Returns:
            Export result dictionary
        """
        if connector_name not in self.connectors:
            return {
                "success": False,
                "error": f"Connector {connector_name} not found",
                "connector_name": connector_name
            }
        
        connector = self.connectors[connector_name]
        
        try:
            # Connect if not already connected
            if not connector.is_connected:
                await connector.connect()
            
            # Export alerts
            result = await connector.export_alerts_batch(alerts)
            result["connector_name"] = connector_name
            result["connector_type"] = self.active_configs[connector_name]["type"]
            
            return result
            
        except Exception as e:
            logger.error(f"Error exporting to connector {connector_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "connector_name": connector_name
            }
    
    async def export_to_all_connectors(
        self,
        alerts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Export alerts to all registered connectors.
        
        Args:
            alerts: List of alert data dictionaries
            
        Returns:
            Export results dictionary for all connectors
        """
        results = {}
        
        for connector_name in self.connectors:
            result = await self.export_to_connector(connector_name, alerts)
            results[connector_name] = result
        
        # Calculate overall statistics
        total_exported = sum(r.get("exported", 0) for r in results.values())
        total_failed = sum(r.get("failed", 0) for r in results.values())
        success_count = sum(1 for r in results.values() if r.get("success", False))
        
        return {
            "total_connectors": len(self.connectors),
            "successful_exports": success_count,
            "failed_exports": len(self.connectors) - success_count,
            "total_alerts_exported": total_exported,
            "total_alerts_failed": total_failed,
            "connector_results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def test_connector(self, connector_name: str) -> Dict[str, Any]:
        """
        Test connection to a specific connector.
        
        Args:
            connector_name: Name of connector to test
            
        Returns:
            Test result dictionary
        """
        if connector_name not in self.connectors:
            return {
                "success": False,
                "error": f"Connector {connector_name} not found"
            }
        
        connector = self.connectors[connector_name]
        return await connector.test_connection()
    
    async def test_all_connectors(self) -> Dict[str, Any]:
        """
        Test all registered connectors.
        
        Returns:
            Test results dictionary for all connectors
        """
        results = {}
        
        for connector_name in self.connectors:
            result = await self.test_connector(connector_name)
            results[connector_name] = result
        
        return {
            "total_connectors": len(self.connectors),
            "connector_results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_connector_status(self, connector_name: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a specific connector.
        
        Args:
            connector_name: Name of connector
            
        Returns:
            Status dictionary or None if not found
        """
        if connector_name in self.connectors:
            return self.connectors[connector_name].get_status()
        return None
    
    def get_all_connector_statuses(self) -> Dict[str, Dict[str, Any]]:
        """
        Get status of all connectors.
        
        Returns:
            Dictionary of connector statuses
        """
        return {
            name: connector.get_status()
            for name, connector in self.connectors.items()
        }
    
    def get_registered_connectors(self) -> List[Dict[str, Any]]:
        """
        Get list of registered connectors.
        
        Returns:
            List of connector information dictionaries
        """
        return [
            {
                "name": name,
                "type": config["type"],
                "demo_mode": config["demo_mode"],
                "registered_at": config["registered_at"],
                "connected": self.connectors[name].is_connected
            }
            for name, config in self.active_configs.items()
        ]
    
    def _create_connector(
        self,
        siem_type: str,
        config: Dict[str, Any],
        demo_mode: bool
    ) -> Optional[BaseSIEMConnector]:
        """
        Create a connector instance based on type.
        
        Args:
            siem_type: Type of SIEM
            config: Configuration dictionary
            demo_mode: Demo mode flag
            
        Returns:
            Connector instance or None if type not supported
        """
        siem_type = siem_type.lower()
        
        if siem_type == "splunk":
            return SplunkConnector(config, demo_mode)
        elif siem_type == "elk" or siem_type == "elasticsearch":
            return ELKConnector(config, demo_mode)
        elif siem_type == "qradar":
            return QRadarConnector(config, demo_mode)
        else:
            logger.error(f"Unsupported SIEM type: {siem_type}")
            return None


class SIEMExportManager:
    """
    Manager for SIEM export operations with scheduling and retry logic.
    
    This class handles automated exports, retries, and export history.
    """
    
    def __init__(self, adapter: SIEMAdapter):
        """
        Initialize SIEM export manager.
        
        Args:
            adapter: SIEM adapter instance
        """
        self.adapter = adapter
        self.export_history: List[Dict[str, Any]] = []
        self.retry_queue: List[Dict[str, Any]] = []
    
    async def export_alerts(
        self,
        alerts: List[Dict[str, Any]],
        connector_names: Optional[List[str]] = None,
        retry_failed: bool = True,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Export alerts with retry logic.
        
        Args:
            alerts: List of alert data dictionaries
            connector_names: Optional list of specific connector names
            retry_failed: Whether to retry failed exports
            max_retries: Maximum retry attempts
            
        Returns:
            Export result dictionary
        """
        export_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        if connector_names:
            # Export to specific connectors
            results = {}
            for name in connector_names:
                result = await self.adapter.export_to_connector(name, alerts)
                results[name] = result
        else:
            # Export to all connectors
            results = await self.adapter.export_to_all_connectors(alerts)
        
        # Record export in history
        export_record = {
            "export_id": export_id,
            "timestamp": datetime.utcnow().isoformat(),
            "alert_count": len(alerts),
            "connector_names": connector_names or list(self.adapter.connectors.keys()),
            "results": results,
            "retry_failed": retry_failed
        }
        self.export_history.append(export_record)
        
        # Handle retries if enabled
        if retry_failed:
            failed_connectors = [
                name for name, result in results.get("connector_results", {}).items()
                if not result.get("success", False)
            ]
            
            if failed_connectors:
                await self._retry_failed_exports(
                    export_id,
                    alerts,
                    failed_connectors,
                    max_retries
                )
        
        return {
            "export_id": export_id,
            "success": True,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _retry_failed_exports(
        self,
        export_id: str,
        alerts: List[Dict[str, Any]],
        connector_names: List[str],
        max_retries: int
    ):
        """
        Retry failed exports.
        
        Args:
            export_id: Original export ID
            alerts: Alert data to retry
            connector_names: Connectors that failed
            max_retries: Maximum retry attempts
        """
        for attempt in range(max_retries):
            logger.info(f"Retry attempt {attempt + 1}/{max_retries} for export {export_id}")
            
            for connector_name in connector_names:
                result = await self.adapter.export_to_connector(connector_name, alerts)
                
                if result.get("success", False):
                    logger.info(f"Retry successful for connector {connector_name}")
                    connector_names.remove(connector_name)
            
            if not connector_names:
                logger.info("All retries successful")
                break
            
            # Wait before next retry
            import asyncio
            await asyncio.sleep(5 ** (attempt + 1))  # Exponential backoff
    
    def get_export_history(
        self,
        limit: int = 100,
        export_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get export history.
        
        Args:
            limit: Maximum records to return
            export_id: Optional specific export ID
            
        Returns:
            List of export records
        """
        if export_id:
            return [record for record in self.export_history if record["export_id"] == export_id]
        
        return self.export_history[-limit:]
    
    def clear_export_history(self, older_than_days: int = 30) -> int:
        """
        Clear old export history.
        
        Args:
            older_than_days: Clear records older than this many days
            
        Returns:
            Number of records cleared
        """
        cutoff_date = datetime.utcnow() - datetime.timedelta(days=older_than_days)
        original_count = len(self.export_history)
        
        self.export_history = [
            record for record in self.export_history
            if datetime.fromisoformat(record["timestamp"]) >= cutoff_date
        ]
        
        cleared_count = original_count - len(self.export_history)
        logger.info(f"Cleared {cleared_count} export history records")
        return cleared_count
