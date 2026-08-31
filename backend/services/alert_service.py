"""
Alert Service for SecureNet IDS
Handles alert creation, management, filtering, and risk calculation
"""

import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

from core.config import settings
from database import db_manager
from schemas import Alert, RiskLevel, AttackType


logger = logging.getLogger(__name__)


class AlertStatus(str, Enum):
    """Alert status"""
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class AlertService:
    """
    Alert Service - Alert management
    
    Responsibilities:
    - Create alerts
    - Update alerts
    - Resolve alerts
    - Filter alerts
    - Risk calculation
    - Repository interaction
    
    NO direct database access - use db_manager.
    """
    
    def __init__(self):
        """Initialize Alert Service"""
        self.alert_stats = {
            "total_created": 0,
            "total_resolved": 0,
            "by_risk_level": {
                "low": 0,
                "medium": 0,
                "high": 0,
                "critical": 0
            },
            "by_attack_type": {}
        }
        
        logger.info("AlertService initialized")
    
    async def create_alert(
        self,
        source_ip: str,
        destination_ip: str,
        protocol: str,
        attack_type: str,
        risk_level: str,
        confidence: float,
        threat_intel_data: Optional[List] = None,
        packet_data: Optional[Dict] = None,
        prediction_result: Optional[Dict] = None
    ) -> Optional[Alert]:
        """
        Create a new security alert
        
        Args:
            source_ip: Source IP address
            destination_ip: Destination IP address
            protocol: Network protocol
            attack_type: Type of attack
            risk_level: Risk level
            confidence: Confidence score
            threat_intel_data: Threat intelligence data
            packet_data: Packet data
            prediction_result: ML prediction result
            
        Returns:
            Created Alert object or None if creation failed
        """
        try:
            # Calculate risk if not provided
            if isinstance(risk_level, str):
                risk_level_enum = RiskLevel(risk_level.lower())
            else:
                risk_level_enum = risk_level
            
            # Create alert description
            description = self._generate_alert_description(
                attack_type, source_ip, destination_ip, risk_level_enum
            )
            
            alert = Alert(
                source_ip=source_ip,
                destination_ip=destination_ip,
                protocol=protocol,
                timestamp=datetime.now(),
                attack_type=attack_type,
                risk_level=risk_level,
                confidence=confidence,
                description=description,
                threat_intel_data=threat_intel_data or [],
                packet_data=packet_data or {},
                prediction_result=prediction_result or {}
            )
            
            # Store in database
            alert_id = await db_manager.insert_alert(alert)
            
            if alert_id:
                logger.info(f"Alert created: {alert_id}")
                
                # Update statistics
                self.alert_stats["total_created"] += 1
                self.alert_stats["by_risk_level"][risk_level.lower()] += 1
                
                if attack_type not in self.alert_stats["by_attack_type"]:
                    self.alert_stats["by_attack_type"][attack_type] = 0
                self.alert_stats["by_attack_type"][attack_type] += 1
                
                return alert
            else:
                logger.error("Failed to store alert in database")
                return None
                
        except Exception as e:
            logger.error(f"Error creating alert: {e}")
            return None
    
    def _generate_alert_description(
        self,
        attack_type: str,
        source_ip: str,
        destination_ip: str,
        risk_level: RiskLevel
    ) -> str:
        """
        Generate alert description
        
        Args:
            attack_type: Type of attack
            source_ip: Source IP address
            destination_ip: Destination IP address
            risk_level: Risk level
            
        Returns:
            Alert description string
        """
        attack_upper = attack_type.upper() if attack_type else 'UNKNOWN'
        return f"{attack_upper} attack detected from {source_ip} to {destination_ip} (Risk: {risk_level.value})"
    
    async def get_alerts(
        self,
        limit: int = 100,
        offset: int = 0,
        risk_level: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Alert]:
        """
        Get alerts with filtering
        
        Args:
            limit: Maximum number of alerts to return
            offset: Offset for pagination
            risk_level: Filter by risk level
            status: Filter by status
            
        Returns:
            List of Alert objects
        """
        try:
            alerts = await db_manager.get_alerts(
                limit=limit,
                offset=offset,
                risk_level=risk_level
            )
            return alerts
        except Exception as e:
            logger.error(f"Error retrieving alerts: {e}")
            return []
    
    async def get_alert_by_id(self, alert_id: str) -> Optional[Alert]:
        """
        Get a specific alert by ID
        
        Args:
            alert_id: Alert ID
            
        Returns:
            Alert object or None if not found
        """
        try:
            # This would need to be implemented in db_manager
            # For now, get all alerts and filter
            alerts = await db_manager.get_alerts(limit=1000)
            for alert in alerts:
                if hasattr(alert, 'id') and alert.id == alert_id:
                    return alert
            return None
        except Exception as e:
            logger.error(f"Error retrieving alert by ID: {e}")
            return None
    
    async def update_alert_status(
        self,
        alert_id: str,
        status: AlertStatus,
        notes: Optional[str] = None
    ) -> bool:
        """
        Update alert status
        
        Args:
            alert_id: Alert ID
            status: New status
            notes: Optional notes
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            # This would need to be implemented in db_manager
            # For now, just log
            logger.info(f"Alert {alert_id} status updated to {status.value}")
            
            if status == AlertStatus.RESOLVED:
                self.alert_stats["total_resolved"] += 1
            
            return True
        except Exception as e:
            logger.error(f"Error updating alert status: {e}")
            return False
    
    async def resolve_alert(self, alert_id: str, notes: Optional[str] = None) -> bool:
        """
        Mark an alert as resolved
        
        Args:
            alert_id: Alert ID
            notes: Optional resolution notes
            
        Returns:
            True if resolution successful, False otherwise
        """
        return await self.update_alert_status(alert_id, AlertStatus.RESOLVED, notes)
    
    def calculate_risk_score(
        self,
        confidence: float,
        threat_intel_risk: Optional[str] = None,
        attack_type: Optional[str] = None
    ) -> RiskLevel:
        """
        Calculate risk level based on multiple factors
        
        Args:
            confidence: ML confidence score
            threat_intel_risk: Risk level from threat intelligence
            attack_type: Type of attack
            
        Returns:
            Calculated RiskLevel
        """
        # Base risk from confidence
        if confidence >= 0.9:
            base_risk = RiskLevel.CRITICAL
        elif confidence >= 0.7:
            base_risk = RiskLevel.HIGH
        elif confidence >= 0.5:
            base_risk = RiskLevel.MEDIUM
        else:
            base_risk = RiskLevel.LOW
        
        # Adjust based on threat intelligence
        if threat_intel_risk:
            threat_risk = RiskLevel(threat_intel_risk.lower())
            
            # Take the higher risk
            risk_order = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
            base_index = risk_order.index(base_risk)
            threat_index = risk_order.index(threat_risk)
            
            return risk_order[max(base_index, threat_index)]
        
        return base_risk
    
    def filter_alerts_by_risk(self, alerts: List[Alert], min_risk: RiskLevel) -> List[Alert]:
        """
        Filter alerts by minimum risk level
        
        Args:
            alerts: List of alerts to filter
            min_risk: Minimum risk level
            
        Returns:
            Filtered list of alerts
        """
        risk_order = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.CRITICAL]
        min_index = risk_order.index(min_risk)
        
        return [
            alert for alert in alerts
            if isinstance(alert.risk_level, RiskLevel) and
               risk_order.index(alert.risk_level) >= min_index
        ]
    
    def get_alert_stats(self) -> Dict[str, Any]:
        """
        Get alert statistics
        
        Returns:
            Alert statistics dictionary
        """
        return self.alert_stats.copy()
    
    def reset_alert_stats(self) -> None:
        """Reset alert statistics"""
        self.alert_stats = {
            "total_created": 0,
            "total_resolved": 0,
            "by_risk_level": {
                "low": 0,
                "medium": 0,
                "high": 0,
                "critical": 0
            },
            "by_attack_type": {}
        }
        logger.info("Alert statistics reset")
