"""
SecureNet IDS - Splunk SIEM Connector

This module provides integration with Splunk SIEM for exporting
alerts and logs in Splunk-compatible formats.
"""

from typing import Dict, Any, List
from datetime import datetime
import logging
import json
import requests
from .base_connector import BaseSIEMConnector, SIEMFormat

logger = logging.getLogger(__name__)


class SplunkConnector(BaseSIEMConnector):
    """
    Splunk SIEM connector.
    
    Supports exporting alerts to Splunk via HEC (HTTP Event Collector)
    or direct API calls with proper formatting.
    """
    
    def __init__(self, config: Dict[str, Any], demo_mode: bool = False):
        """
        Initialize Splunk connector.
        
        Args:
            config: Configuration dictionary with:
                - hec_url: HEC endpoint URL
                - hec_token: HEC authentication token
                - index: Splunk index name
                - source: Source type
                - sourcetype: Source type
            demo_mode: If True, use mock/demo mode
        """
        super().__init__(config, demo_mode)
        self.hec_url = config.get("hec_url")
        self.hec_token = config.get("hec_token")
        self.index = config.get("index", "securenet")
        self.source = config.get("source", "securenet_ids")
        self.sourcetype = config.get("sourcetype", "json")
    
    async def connect(self) -> bool:
        """
        Establish connection to Splunk HEC.
        
        Returns:
            True if connection successful, False otherwise
        """
        if self.demo_mode:
            self.is_connected = True
            logger.info("Splunk connector: Demo mode - connection simulated")
            return True
        
        if not self._validate_config(["hec_url", "hec_token"]):
            return False
        
        try:
            # Test HEC endpoint
            headers = {
                "Authorization": f"Splunk {self.hec_token}",
                "Content-Type": "application/json"
            }
            
            test_event = {
                "event": "connection_test",
                "time": datetime.utcnow().timestamp(),
                "host": "securenet_ids"
            }
            
            response = requests.post(
                f"{self.hec_url}/services/collector/event",
                headers=headers,
                json=test_event,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                self.is_connected = True
                logger.info("Splunk HEC connection successful")
                return True
            else:
                logger.error(f"Splunk HEC connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Splunk connection error: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """
        Disconnect from Splunk.
        
        Returns:
            True if disconnection successful
        """
        self.is_connected = False
        logger.info("Splunk connector disconnected")
        return True
    
    async def export_alert(self, alert: Dict[str, Any]) -> bool:
        """
        Export a single alert to Splunk.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            True if export successful, False otherwise
        """
        if self.demo_mode:
            self._log_export(True, 1)
            logger.info(f"Demo mode: Simulated export of alert {alert.get('id')}")
            return True
        
        try:
            formatted_event = self._format_splunk_event(alert)
            return await self._send_to_hec(formatted_event)
        except Exception as e:
            logger.error(f"Error exporting alert to Splunk: {e}")
            return False
    
    async def export_alerts_batch(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Export multiple alerts to Splunk in batch.
        
        Args:
            alerts: List of alert data dictionaries
            
        Returns:
            Export result dictionary
        """
        if self.demo_mode:
            self._log_export(True, len(alerts))
            logger.info(f"Demo mode: Simulated batch export of {len(alerts)} alerts")
            return {
                "success": True,
                "total": len(alerts),
                "exported": len(alerts),
                "failed": 0,
                "demo_mode": True
            }
        
        success_count = 0
        failed_count = 0
        
        for alert in alerts:
            try:
                formatted_event = self._format_splunk_event(alert)
                if await self._send_to_hec(formatted_event):
                    success_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Error exporting alert {alert.get('id')}: {e}")
                failed_count += 1
        
        self._log_export(success_count > 0, success_count)
        
        return {
            "success": success_count > 0,
            "total": len(alerts),
            "exported": success_count,
            "failed": failed_count,
            "demo_mode": False
        }
    
    def format_alert(self, alert: Dict[str, Any], format: str = SIEMFormat.JSON) -> str:
        """
        Format alert data for Splunk.
        
        Args:
            alert: Alert data dictionary
            format: Target format (json, cef, leef, splunk)
            
        Returns:
            Formatted alert string
        """
        if format == SIEMFormat.SPLUNK:
            return self._format_splunk_event(alert)
        elif format == SIEMFormat.CEF:
            return self._format_cef(alert)
        elif format == SIEMFormat.LEEF:
            return self._format_leef(alert)
        else:
            return json.dumps(alert, default=str)
    
    def _format_splunk_event(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format alert as Splunk HEC event.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            Splunk-formatted event dictionary
        """
        return {
            "time": self._parse_timestamp(alert.get("timestamp")),
            "host": alert.get("source_ip", "unknown"),
            "source": self.source,
            "sourcetype": self.sourcetype,
            "index": self.index,
            "event": {
                "alert_id": alert.get("id"),
                "org_id": alert.get("org_id"),
                "source_ip": alert.get("source_ip"),
                "destination_ip": alert.get("destination_ip"),
                "protocol": alert.get("protocol"),
                "attack_type": alert.get("attack_type"),
                "risk_level": alert.get("risk_level"),
                "confidence": alert.get("confidence"),
                "description": alert.get("description"),
                "status": alert.get("status"),
                "severity_score": alert.get("severity_score"),
                "threat_intel": alert.get("threat_intel_data"),
                "packet_data": alert.get("packet_data")
            }
        }
    
    def _format_cef(self, alert: Dict[str, Any]) -> str:
        """
        Format alert in CEF (Common Event Format).
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            CEF-formatted string
        """
        cef_header = f"CEF:0|SecureNet|IDS|1.0|{alert.get('attack_type', 'unknown')}|{alert.get('description', 'Security Alert')}|{self._get_severity(alert.get('risk_level'))}|"
        
        cef_extensions = [
            f"dvchost={alert.get('destination_ip', 'unknown')}",
            f"src={alert.get('source_ip', 'unknown')}",
            f"dst={alert.get('destination_ip', 'unknown')}",
            f"proto={alert.get('protocol', 'unknown')}",
            f"act={alert.get('status', 'open')}",
            f"cs1={alert.get('org_id', 'unknown')}",
            f"cs1Label=Organization",
            f"cs2={alert.get('id', 'unknown')}",
            f"cs2Label=AlertID",
            f"cn1={alert.get('confidence', 0)}",
            f"cn1Label=Confidence"
        ]
        
        return cef_header + " ".join(cef_extensions)
    
    def _format_leef(self, alert: Dict[str, Any]) -> str:
        """
        Format alert in LEEF (Log Event Extended Format).
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            LEEF-formatted string
        """
        leef_header = f"LEEF:1.0|SecureNet|IDS|1.0|{alert.get('attack_type', 'unknown')}|"
        
        leef_fields = [
            f"src={alert.get('source_ip', 'unknown')}",
            f"dst={alert.get('destination_ip', 'unknown')}",
            f"proto={alert.get('protocol', 'unknown')}",
            f"riskLevel={alert.get('risk_level', 'unknown')}",
            f"confidence={alert.get('confidence', 0)}",
            f"orgId={alert.get('org_id', 'unknown')}",
            f"alertId={alert.get('id', 'unknown')}",
            f"status={alert.get('status', 'open')}"
        ]
        
        return leef_header + "\t" + " ".join(leef_fields)
    
    async def _send_to_hec(self, event: Dict[str, Any]) -> bool:
        """
        Send event to Splunk HEC.
        
        Args:
            event: Event dictionary
            
        Returns:
            True if send successful, False otherwise
        """
        try:
            headers = {
                "Authorization": f"Splunk {self.hec_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.hec_url}/services/collector/event",
                headers=headers,
                json=event,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                return True
            else:
                logger.error(f"Splunk HEC send failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending to Splunk HEC: {e}")
            return False
    
    def _parse_timestamp(self, timestamp_str: str) -> float:
        """
        Parse timestamp to Unix epoch.
        
        Args:
            timestamp_str: ISO format timestamp
            
        Returns:
            Unix timestamp
        """
        try:
            if timestamp_str:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                return dt.timestamp()
            return datetime.utcnow().timestamp()
        except Exception:
            return datetime.utcnow().timestamp()
    
    def _get_severity(self, risk_level: str) -> int:
        """
        Convert risk level to CEF severity (0-10).
        
        Args:
            risk_level: Risk level string
            
        Returns:
            Severity number
        """
        severity_map = {
            "low": 3,
            "medium": 5,
            "high": 8,
            "critical": 10
        }
        return severity_map.get(risk_level.lower(), 5)
