"""
SecureNet IDS - CSV Report Generator

This module provides CSV report generation capabilities for
security reports including alert exports and statistics.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import csv
from io import StringIO

logger = logging.getLogger(__name__)


class CSVReportGenerator:
    """
    CSV report generator for security data exports.
    
    Generates CSV exports for alerts, logs, and statistics
    with proper formatting and encoding.
    """
    
    def __init__(self):
        """Initialize CSV report generator."""
        pass
    
    def generate_alerts_csv(
        self,
        alerts: List[Dict[str, Any]],
        include_threat_intel: bool = True,
        include_packet_data: bool = False
    ) -> str:
        """
        Generate CSV export of alerts.
        
        Args:
            alerts: List of alert dictionaries
            include_threat_intel: Include threat intelligence data
            include_packet_data: Include raw packet data
            
        Returns:
            CSV string
        """
        output = StringIO()
        
        # Define CSV columns
        fieldnames = [
            "id",
            "timestamp",
            "org_id",
            "source_ip",
            "destination_ip",
            "source_port",
            "destination_port",
            "protocol",
            "attack_type",
            "risk_level",
            "confidence",
            "severity_score",
            "status",
            "assigned_to",
            "description"
        ]
        
        if include_threat_intel:
            fieldnames.extend([
                "threat_intel_sources",
                "threat_intel_malicious_count"
            ])
        
        if include_packet_data:
            fieldnames.extend([
                "packet_length",
                "tcp_flags"
            ])
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for alert in alerts:
            row = {
                "id": alert.get("id"),
                "timestamp": alert.get("timestamp"),
                "org_id": alert.get("org_id"),
                "source_ip": alert.get("source_ip"),
                "destination_ip": alert.get("destination_ip"),
                "source_port": alert.get("packet_data", {}).get("source_port"),
                "destination_port": alert.get("packet_data", {}).get("destination_port"),
                "protocol": alert.get("protocol"),
                "attack_type": alert.get("attack_type"),
                "risk_level": alert.get("risk_level"),
                "confidence": alert.get("confidence"),
                "severity_score": alert.get("severity_score"),
                "status": alert.get("status"),
                "assigned_to": alert.get("assigned_to"),
                "description": alert.get("description")
            }
            
            if include_threat_intel:
                threat_data = alert.get("threat_intel_data", {})
                if isinstance(threat_data, dict):
                    sources = list(threat_data.keys())
                    malicious_count = sum(1 for v in threat_data.values() if isinstance(v, dict) and v.get("is_malicious"))
                else:
                    sources = []
                    malicious_count = 0
                
                row["threat_intel_sources"] = ",".join(sources)
                row["threat_intel_malicious_count"] = malicious_count
            
            if include_packet_data:
                packet_data = alert.get("packet_data", {})
                row["packet_length"] = packet_data.get("packet_length")
                row["tcp_flags"] = packet_data.get("tcp_flags")
            
            writer.writerow(row)
        
        return output.getvalue()
    
    def generate_statistics_csv(
        self,
        stats: Dict[str, Any]
    ) -> str:
        """
        Generate CSV export of statistics.
        
        Args:
            stats: Statistics dictionary
            
        Returns:
            CSV string
        """
        output = StringIO()
        
        fieldnames = [
            "metric",
            "value",
            "timestamp"
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        timestamp = datetime.utcnow().isoformat()
        
        # Flatten nested statistics
        flat_stats = self._flatten_dict(stats)
        
        for key, value in flat_stats.items():
            writer.writerow({
                "metric": key,
                "value": str(value) if value is not None else "",
                "timestamp": timestamp
            })
        
        return output.getvalue()
    
    def generate_audit_logs_csv(
        self,
        audit_logs: List[Dict[str, Any]]
    ) -> str:
        """
        Generate CSV export of audit logs.
        
        Args:
            audit_logs: List of audit log dictionaries
            
        Returns:
            CSV string
        """
        output = StringIO()
        
        fieldnames = [
            "id",
            "timestamp",
            "user_id",
            "org_id",
            "email",
            "role",
            "action",
            "resource_type",
            "resource_id",
            "ip_address",
            "status",
            "error_message"
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for log in audit_logs:
            writer.writerow({
                "id": log.get("id"),
                "timestamp": log.get("created_at"),
                "user_id": log.get("user_id"),
                "org_id": log.get("org_id"),
                "email": log.get("email"),
                "role": log.get("role"),
                "action": log.get("action"),
                "resource_type": log.get("resource_type"),
                "resource_id": log.get("resource_id"),
                "ip_address": log.get("ip_address"),
                "status": log.get("status"),
                "error_message": log.get("error_message")
            })
        
        return output.getvalue()
    
    def generate_summary_report_csv(
        self,
        report_data: Dict[str, Any]
    ) -> str:
        """
        Generate CSV summary report.
        
        Args:
            report_data: Report data dictionary
            
        Returns:
            CSV string
        """
        output = StringIO()
        
        fieldnames = [
            "category",
            "metric",
            "value"
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        # Summary statistics
        summary_metrics = [
            ("Overview", "Total Alerts", report_data.get("total_alerts", 0)),
            ("Overview", "Critical Alerts", report_data.get("critical_alerts", 0)),
            ("Overview", "High Alerts", report_data.get("high_alerts", 0)),
            ("Overview", "Medium Alerts", report_data.get("medium_alerts", 0)),
            ("Overview", "Low Alerts", report_data.get("low_alerts", 0)),
            ("Overview", "Resolved Alerts", report_data.get("resolved_alerts", 0)),
            ("Overview", "Active Threats", report_data.get("active_threats", 0)),
            ("Overview", "Risk Score", report_data.get("risk_score", 0)),
            ("Overview", "Overall Risk", report_data.get("overall_risk", "unknown"))
        ]
        
        for category, metric, value in summary_metrics:
            writer.writerow({
                "category": category,
                "metric": metric,
                "value": str(value)
            })
        
        # Top source IPs
        top_ips = report_data.get("top_source_ips", [])
        for idx, ip_data in enumerate(top_ips[:10], 1):
            writer.writerow({
                "category": "Top Source IPs",
                "metric": f"#{idx} - {ip_data.get('ip', 'unknown')}",
                "value": str(ip_data.get("count", 0))
            })
        
        # Protocol distribution
        protocols = report_data.get("protocols", {})
        for protocol, count in protocols.items():
            writer.writerow({
                "category": "Protocol Distribution",
                "metric": protocol.upper(),
                "value": str(count)
            })
        
        # Attack types
        attack_types = report_data.get("attack_types", {})
        for attack_type, count in attack_types.items():
            writer.writerow({
                "category": "Attack Types",
                "metric": attack_type,
                "value": str(count)
            })
        
        return output.getvalue()
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = "", sep: str = ".") -> Dict[str, Any]:
        """
        Flatten nested dictionary.
        
        Args:
            d: Dictionary to flatten
            parent_key: Parent key for nested items
            sep: Separator for keys
            
        Returns:
            Flattened dictionary
        """
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list):
                items.append((new_key, ",".join(str(x) for x in v)))
            else:
                items.append((new_key, v))
        return dict(items)
    
    def save_csv(self, csv_content: str, file_path: str) -> bool:
        """
        Save CSV content to file.
        
        Args:
            csv_content: CSV string content
            file_path: Path to save file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                f.write(csv_content)
            logger.info(f"CSV report saved to {file_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving CSV to {file_path}: {e}")
            return False
