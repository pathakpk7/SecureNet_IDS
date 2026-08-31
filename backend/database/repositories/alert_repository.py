"""
SecureNet IDS - Alert Repository

This module handles all alert-related database operations including
alert CRUD operations, assignment, resolution, and filtering.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging
from .base_repository import BaseRepository

logger = logging.getLogger(__name__)


class AlertRepository(BaseRepository):
    """
    Repository for alert operations.
    
    Handles alert CRUD operations, assignment, resolution,
    status management, and filtering.
    """
    
    def __init__(self, supabase_client):
        """Initialize alert repository."""
        super().__init__(supabase_client, "alerts")
    
    async def create_alert(
        self,
        org_id: str,
        source_ip: str,
        destination_ip: str,
        protocol: str,
        attack_type: str,
        risk_level: str,
        confidence: float,
        description: str,
        packet_data: Optional[Dict[str, Any]] = None,
        threat_intel_data: Optional[Dict[str, Any]] = None,
        prediction_result: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new security alert.
        
        Args:
            org_id: Organization ID
            source_ip: Source IP address
            destination_ip: Destination IP address
            protocol: Network protocol
            attack_type: Type of attack
            risk_level: Risk level (low, medium, high, critical)
            confidence: ML confidence score
            description: Alert description
            packet_data: Raw packet data
            threat_intel_data: Threat intelligence results
            prediction_result: ML prediction details
            
        Returns:
            Created alert or None if failed
        """
        alert_data = {
            "org_id": org_id,
            "source_ip": source_ip,
            "destination_ip": destination_ip,
            "protocol": protocol,
            "attack_type": attack_type,
            "risk_level": risk_level,
            "confidence": confidence,
            "description": description,
            "status": "open",
            "severity_score": self._calculate_severity_score(risk_level, confidence),
            "timestamp": datetime.utcnow().isoformat(),
            "packet_data": packet_data,
            "threat_intel_data": threat_intel_data,
            "prediction_result": prediction_result,
            "tags": []
        }
        
        return await self.create(alert_data)
    
    async def get_by_org(
        self,
        org_id: str,
        status: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get alerts for an organization with optional filtering.
        
        Args:
            org_id: Organization ID
            status: Optional status filter
            risk_level: Optional risk level filter
            limit: Maximum records to return
            offset: Number of records to skip
            
        Returns:
            List of alerts
        """
        filters = {"org_id": org_id}
        if status:
            filters["status"] = status
        if risk_level:
            filters["risk_level"] = risk_level
        
        return await self.get_all(
            filters=filters,
            limit=limit,
            offset=offset,
            order_by="timestamp",
            ascending=False
        )
    
    async def get_by_assigned_user(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get alerts assigned to a specific user.
        
        Args:
            user_id: User ID
            limit: Maximum records to return
            
        Returns:
            List of alerts
        """
        return await self.get_all(
            filters={"assigned_to": user_id},
            limit=limit,
            order_by="timestamp",
            ascending=False
        )
    
    async def assign_alert(self, alert_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Assign an alert to a user.
        
        Args:
            alert_id: Alert ID
            user_id: User ID to assign to
            
        Returns:
            Updated alert or None if failed
        """
        return await self.update(alert_id, {
            "assigned_to": user_id,
            "status": "investigating"
        })
    
    async def resolve_alert(
        self,
        alert_id: str,
        resolved_by: str,
        resolution_notes: Optional[str] = None,
        status: str = "resolved"
    ) -> Optional[Dict[str, Any]]:
        """
        Resolve an alert.
        
        Args:
            alert_id: Alert ID
            resolved_by: User ID resolving the alert
            resolution_notes: Optional resolution notes
            status: Resolution status (resolved, false_positive)
            
        Returns:
            Updated alert or None if failed
        """
        update_data = {
            "status": status,
            "resolved_by": resolved_by,
            "resolved_at": datetime.utcnow().isoformat()
        }
        
        if resolution_notes:
            update_data["investigation_notes"] = resolution_notes
        
        return await self.update(alert_id, update_data)
    
    async def escalate_alert(self, alert_id: str, escalated_by: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Escalate an alert.
        
        Args:
            alert_id: Alert ID
            escalated_by: User ID escalating
            notes: Optional escalation notes
            
        Returns:
            Updated alert or None if failed
        """
        update_data = {
            "status": "escalated",
            "investigation_notes": notes or "Alert escalated"
        }
        
        return await self.update(alert_id, update_data)
    
    async def add_tag(self, alert_id: str, tag: str) -> Optional[Dict[str, Any]]:
        """
        Add a tag to an alert.
        
        Args:
            alert_id: Alert ID
            tag: Tag to add
            
        Returns:
            Updated alert or None if failed
        """
        alert = await self.get_by_id(alert_id)
        if not alert:
            return None
        
        current_tags = alert.get("tags", [])
        if tag not in current_tags:
            current_tags.append(tag)
        
        return await self.update(alert_id, {"tags": current_tags})
    
    async def remove_tag(self, alert_id: str, tag: str) -> Optional[Dict[str, Any]]:
        """
        Remove a tag from an alert.
        
        Args:
            alert_id: Alert ID
            tag: Tag to remove
            
        Returns:
            Updated alert or None if failed
        """
        alert = await self.get_by_id(alert_id)
        if not alert:
            return None
        
        current_tags = alert.get("tags", [])
        if tag in current_tags:
            current_tags.remove(tag)
        
        return await self.update(alert_id, {"tags": current_tags})
    
    async def get_alerts_by_ip(self, org_id: str, ip_address: str, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get alerts for a specific IP address.
        
        Args:
            org_id: Organization ID
            ip_address: IP address to search
            days: Number of days to look back
            
        Returns:
            List of alerts
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            source_filter = "source_ip.eq.{}".format(ip_address)
            dest_filter = "destination_ip.eq.{}".format(ip_address)
            ip_filter = source_filter + "," + dest_filter
            response = self.supabase.table(self.table_name).select("*").eq("org_id", org_id).or_(ip_filter).gte("timestamp", cutoff_date.isoformat()).order("timestamp", ascending=False).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting alerts for IP {ip_address}: {e}")
            return []
    
    async def get_alert_statistics(self, org_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Get alert statistics for an organization.
        
        Args:
            org_id: Organization ID
            days: Number of days to analyze
            
        Returns:
            Statistics dictionary
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get all alerts in time range
            alerts = await self.get_by_org(org_id, limit=10000)
            alerts = [a for a in alerts if self._parse_timestamp(a["timestamp"]) >= cutoff_date]
            
            # Calculate statistics
            total = len(alerts)
            by_status = {}
            by_risk_level = {}
            by_attack_type = {}
            
            for alert in alerts:
                status = alert.get("status", "unknown")
                risk = alert.get("risk_level", "unknown")
                attack_type = alert.get("attack_type", "unknown")
                
                by_status[status] = by_status.get(status, 0) + 1
                by_risk_level[risk] = by_risk_level.get(risk, 0) + 1
                by_attack_type[attack_type] = by_attack_type.get(attack_type, 0) + 1
            
            return {
                "total": total,
                "by_status": by_status,
                "by_risk_level": by_risk_level,
                "by_attack_type": by_attack_type,
                "avg_confidence": sum(a.get("confidence", 0) for a in alerts) / total if total > 0 else 0
            }
        except Exception as e:
            logger.error(f"Error getting alert statistics: {e}")
            return {}
    
    async def get_top_source_ips(self, org_id: str, days: int = 30, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top source IPs by alert count.
        
        Args:
            org_id: Organization ID
            days: Number of days to analyze
            limit: Maximum IPs to return
            
        Returns:
            List of IP addresses with alert counts
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            alerts = await self.get_by_org(org_id, limit=10000)
            alerts = [a for a in alerts if self._parse_timestamp(a["timestamp"]) >= cutoff_date]
            
            ip_counts = {}
            for alert in alerts:
                ip = alert.get("source_ip")
                if ip:
                    ip_counts[ip] = ip_counts.get(ip, 0) + 1
            
            sorted_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
            
            return [{"ip": ip, "count": count} for ip, count in sorted_ips]
        except Exception as e:
            logger.error(f"Error getting top source IPs: {e}")
            return []
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """
        Parse ISO timestamp string to datetime object.
        
        Args:
            timestamp_str: ISO format timestamp string
            
        Returns:
            Datetime object
        """
        try:
            # Handle Z suffix for UTC
            if timestamp_str.endswith('Z'):
                timestamp_str = timestamp_str[:-1] + '+00:00'
            return datetime.fromisoformat(timestamp_str)
        except Exception as e:
            logger.error(f"Error parsing timestamp {timestamp_str}: {e}")
            return datetime.utcnow()
    
    def _calculate_severity_score(self, risk_level: str, confidence: float) -> int:
        """
        Calculate severity score from risk level and confidence.
        
        Args:
            risk_level: Risk level string
            confidence: ML confidence score (0-1)
            
        Returns:
            Severity score (0-100)
        """
        risk_scores = {
            "low": 25,
            "medium": 50,
            "high": 75,
            "critical": 100
        }
        
        base_score = risk_scores.get(risk_level, 50)
        confidence_boost = int(confidence * 20)  # Up to 20 points for confidence
        
        return min(100, base_score + confidence_boost)
