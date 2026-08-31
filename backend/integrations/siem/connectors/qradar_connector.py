"""
SecureNet IDS - IBM QRadar SIEM Connector

This module provides integration with IBM QRadar SIEM for exporting
alerts and logs in QRadar-compatible formats.
"""

from typing import Dict, Any, List
from datetime import datetime
import logging
import json
import requests
from .base_connector import BaseSIEMConnector, SIEMFormat

logger = logging.getLogger(__name__)


class QRadarConnector(BaseSIEMConnector):
    """
    IBM QRadar SIEM connector.
    
    Supports exporting alerts to QRadar via REST API with proper
    formatting and log source configuration.
    """
    
    def __init__(self, config: Dict[str, Any], demo_mode: bool = False):
        """
        Initialize QRadar connector.
        
        Args:
            config: Configuration dictionary with:
                - base_url: QRadar console URL
                - api_token: QRadar API token
                - log_source_type: Log source type ID
                - log_source_id: Log source ID
                - qid: QID (Qradar ID) for event mapping
            demo_mode: If True, use mock/demo mode
        """
        super().__init__(config, demo_mode)
        self.base_url = config.get("base_url")
        self.api_token = config.get("api_token")
        self.log_source_type = config.get("log_source_type", "SecureNet IDS")
        self.log_source_id = config.get("log_source_id")
        self.qid = config.get("qid", 1000000)  # Default QID for custom events
    
    async def connect(self) -> bool:
        """
        Establish connection to QRadar.
        
        Returns:
            True if connection successful, False otherwise
        """
        if self.demo_mode:
            self.is_connected = True
            logger.info("QRadar connector: Demo mode - connection simulated")
            return True
        
        if not self._validate_config(["base_url", "api_token"]):
            return False
        
        try:
            # Test QRadar API connection
            headers = {
                "SEC": self.api_token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Test with a simple API call to get system info
            response = requests.get(
                f"{self.base_url}/api/about",
                headers=headers,
                timeout=10,
                verify=False
            )
            
            if response.status_code == 200:
                self.is_connected = True
                logger.info("QRadar API connection successful")
                return True
            else:
                logger.error(f"QRadar API connection failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"QRadar connection error: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """
        Disconnect from QRadar.
        
        Returns:
            True if disconnection successful
        """
        self.is_connected = False
        logger.info("QRadar connector disconnected")
        return True
    
    async def export_alert(self, alert: Dict[str, Any]) -> bool:
        """
        Export a single alert to QRadar.
        
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
            formatted_event = self._format_qradar_event(alert)
            return await self._send_to_qradar(formatted_event)
        except Exception as e:
            logger.error(f"Error exporting alert to QRadar: {e}")
            return False
    
    async def export_alerts_batch(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Export multiple alerts to QRadar in batch.
        
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
                formatted_event = self._format_qradar_event(alert)
                if await self._send_to_qradar(formatted_event):
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
        Format alert data for QRadar.
        
        Args:
            alert: Alert data dictionary
            format: Target format (json, cef, leef)
            
        Returns:
            Formatted alert string
        """
        if format == SIEMFormat.CEF:
            return self._format_cef(alert)
        elif format == SIEMFormat.LEEF:
            return self._format_leef(alert)
        else:
            return json.dumps(alert, default=str)
    
    def _format_qradar_event(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format alert as QRadar event.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            QRadar-formatted event dictionary
        """
        return {
            "event_source": self.log_source_type,
            "log_source_id": self.log_source_id,
            "qid": self.qid,
            "payload": {
                "timestamp": self._parse_timestamp(alert.get("timestamp")),
                "source_ip": alert.get("source_ip"),
                "destination_ip": alert.get("destination_ip"),
                "source_port": alert.get("packet_data", {}).get("source_port"),
                "destination_port": alert.get("packet_data", {}).get("destination_port"),
                "protocol": alert.get("protocol"),
                "attack_type": alert.get("attack_type"),
                "risk_level": alert.get("risk_level"),
                "confidence": alert.get("confidence"),
                "description": alert.get("description"),
                "alert_id": alert.get("id"),
                "org_id": alert.get("org_id"),
                "severity_score": alert.get("severity_score"),
                "threat_intel": alert.get("threat_intel_data"),
                "status": alert.get("status")
            }
        }
    
    def _format_cef(self, alert: Dict[str, Any]) -> str:
        """
        Format alert in CEF format for QRadar.
        
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
            f"spt={alert.get('packet_data', {}).get('source_port', 0)}",
            f"dpt={alert.get('packet_data', {}).get('destination_port', 0)}",
            f"proto={alert.get('protocol', 'unknown')}",
            f"act={alert.get('status', 'open')}",
            f"cs1={alert.get('org_id', 'unknown')}",
            f"cs1Label=Organization",
            f"cs2={alert.get('id', 'unknown')}",
            f"cs2Label=AlertID",
            f"cn1={alert.get('confidence', 0)}",
            f"cn1Label=Confidence",
            f"cn2={alert.get('severity_score', 0)}",
            f"cn2Label=SeverityScore"
        ]
        
        return cef_header + " ".join(cef_extensions)
    
    def _format_leef(self, alert: Dict[str, Any]) -> str:
        """
        Format alert in LEEF format for QRadar.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            LEEF-formatted string
        """
        leef_header = f"LEEF:1.0|SecureNet|IDS|1.0|{alert.get('attack_type', 'unknown')}|"
        
        leef_fields = [
            f"src={alert.get('source_ip', 'unknown')}",
            f"dst={alert.get('destination_ip', 'unknown')}",
            f"sport={alert.get('packet_data', {}).get('source_port', 0)}",
            f"dport={alert.get('packet_data', {}).get('destination_port', 0)}",
            f"proto={alert.get('protocol', 'unknown')}",
            f"riskLevel={alert.get('risk_level', 'unknown')}",
            f"confidence={alert.get('confidence', 0)}",
            f"severityScore={alert.get('severity_score', 0)}",
            f"orgId={alert.get('org_id', 'unknown')}",
            f"alertId={alert.get('id', 'unknown')}",
            f"status={alert.get('status', 'open')}"
        ]
        
        return leef_header + "\t" + " ".join(leef_fields)
    
    async def _send_to_qradar(self, event: Dict[str, Any]) -> bool:
        """
        Send event to QRadar via REST API.
        
        Args:
            event: Event dictionary
            
        Returns:
            True if send successful, False otherwise
        """
        try:
            headers = {
                "SEC": self.api_token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # QRadar uses /api/ariel/leases for event ingestion
            # or /api/cef_events for CEF format
            response = requests.post(
                f"{self.base_url}/api/cef_events",
                headers=headers,
                json=event,
                timeout=10,
                verify=False
            )
            
            if response.status_code in [200, 201, 202]:
                return True
            else:
                logger.error(f"QRadar send failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending to QRadar: {e}")
            return False
    
    def _parse_timestamp(self, timestamp_str: str) -> str:
        """
        Parse timestamp to QRadar format.
        
        Args:
            timestamp_str: ISO format timestamp
            
        Returns:
            QRadar-formatted timestamp
        """
        try:
            if timestamp_str:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                return dt.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
            return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        except Exception:
            return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    
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
