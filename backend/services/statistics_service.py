"""
Statistics Service for SecureNet IDS
Handles system statistics, dashboard statistics, performance metrics, and trend calculations
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict

from database import db_manager


logger = logging.getLogger(__name__)


class StatisticsService:
    """
    Statistics Service - Statistics management
    
    Responsibilities:
    - System statistics
    - Dashboard statistics
    - Performance metrics
    - Trend calculations
    - Aggregation of statistics from multiple sources
    
    NO direct database access - use db_manager.
    """
    
    def __init__(self):
        """Initialize Statistics Service"""
        self.cached_stats = {}
        self.cache_expiry = None
        self.cache_duration = timedelta(minutes=5)
        
        logger.info("StatisticsService initialized")
    
    async def get_system_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive system statistics
        
        Returns:
            System statistics dictionary
        """
        try:
            # Check cache
            if self._is_cache_valid():
                return self.cached_stats
            
            # Get statistics from database
            db_stats = await db_manager.get_statistics()
            
            # Add system-level statistics
            system_stats = {
                **db_stats,
                "system": {
                    "timestamp": datetime.now().isoformat(),
                    "uptime": self._calculate_uptime(),
                    "memory_usage": self._get_memory_usage(),
                    "cpu_usage": self._get_cpu_usage()
                }
            }
            
            # Update cache
            self.cached_stats = system_stats
            self.cache_expiry = datetime.now() + self.cache_duration
            
            return system_stats
            
        except Exception as e:
            logger.error(f"Error retrieving system statistics: {e}")
            return {"error": str(e)}
    
    async def get_dashboard_statistics(self) -> Dict[str, Any]:
        """
        Get statistics optimized for dashboard display
        
        Returns:
            Dashboard statistics dictionary
        """
        try:
            system_stats = await self.get_system_statistics()
            
            # Extract dashboard-relevant statistics
            dashboard_stats = {
                "alerts": {
                    "total": system_stats.get("total_alerts", 0),
                    "today": system_stats.get("alerts_today", 0),
                    "by_risk": system_stats.get("alerts_by_risk", {})
                },
                "attacks": {
                    "total": system_stats.get("total_attacks", 0),
                    "by_type": system_stats.get("attacks_by_type", {})
                },
                "monitoring": {
                    "active": system_stats.get("monitoring_active", False),
                    "start_time": system_stats.get("monitoring_start_time"),
                    "uptime": system_stats.get("monitoring_uptime", 0)
                },
                "performance": {
                    "packets_per_second": system_stats.get("packets_per_second", 0),
                    "avg_processing_time": system_stats.get("avg_processing_time", 0)
                }
            }
            
            return dashboard_stats
            
        except Exception as e:
            logger.error(f"Error retrieving dashboard statistics: {e}")
            return {"error": str(e)}
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """
        Get performance metrics
        
        Returns:
            Performance metrics dictionary
        """
        try:
            stats = await self.get_system_statistics()
            
            performance_metrics = {
                "packet_processing": {
                    "total_packets": stats.get("total_packets", 0),
                    "processing_rate": stats.get("packets_per_second", 0),
                    "avg_capture_time": stats.get("avg_capture_time", 0.0),
                    "avg_feature_time": stats.get("avg_feature_time", 0.0),
                    "avg_prediction_time": stats.get("avg_prediction_time", 0.0),
                    "avg_threat_intel_time": stats.get("avg_threat_intel_time", 0.0),
                    "avg_database_time": stats.get("avg_database_time", 0.0)
                },
                "ml_performance": {
                    "total_predictions": stats.get("total_predictions", 0),
                    "accuracy": stats.get("ml_accuracy", 0.0),
                    "attack_detection_rate": stats.get("attack_detection_rate", 0.0)
                },
                "threat_intel": {
                    "total_checks": stats.get("total_threat_checks", 0),
                    "cache_hit_rate": stats.get("threat_cache_hit_rate", 0.0),
                    "avg_response_time": stats.get("threat_avg_response_time", 0.0)
                }
            }
            
            return performance_metrics
            
        except Exception as e:
            logger.error(f"Error retrieving performance metrics: {e}")
            return {"error": str(e)}
    
    async def get_trend_statistics(self, days: int = 7) -> Dict[str, Any]:
        """
        Get trend statistics over a time period
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Trend statistics dictionary
        """
        try:
            # This would need to be implemented in db_manager
            # For now, return placeholder data
            trend_stats = {
                "period_days": days,
                "start_date": (datetime.now() - timedelta(days=days)).isoformat(),
                "end_date": datetime.now().isoformat(),
                "alerts_trend": self._generate_trend_data(days),
                "attacks_trend": self._generate_trend_data(days),
                "performance_trend": self._generate_trend_data(days)
            }
            
            return trend_stats
            
        except Exception as e:
            logger.error(f"Error retrieving trend statistics: {e}")
            return {"error": str(e)}
    
    def _generate_trend_data(self, days: int) -> List[Dict[str, Any]]:
        """
        Generate placeholder trend data
        
        Args:
            days: Number of days
            
        Returns:
            List of trend data points
        """
        trend_data = []
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i - 1)
            trend_data.append({
                "date": date.isoformat(),
                "value": 0  # Placeholder - would be calculated from database
            })
        return trend_data
    
    def _is_cache_valid(self) -> bool:
        """Check if cached statistics are still valid"""
        if not self.cache_expiry:
            return False
        return datetime.now() < self.cache_expiry
    
    def _calculate_uptime(self) -> str:
        """
        Calculate system uptime
        
        Returns:
            Uptime string
        """
        # Placeholder - would be calculated from actual start time
        return "0:00:00"
    
    def _get_memory_usage(self) -> float:
        """
        Get current memory usage
        
        Returns:
            Memory usage percentage
        """
        # Placeholder - would use psutil or similar
        return 0.0
    
    def _get_cpu_usage(self) -> float:
        """
        Get current CPU usage
        
        Returns:
            CPU usage percentage
        """
        # Placeholder - would use psutil or similar
        return 0.0
    
    def clear_cache(self) -> None:
        """Clear statistics cache"""
        self.cached_stats = {}
        self.cache_expiry = None
        logger.info("Statistics cache cleared")
    
    async def aggregate_statistics(
        self,
        monitoring_stats: Dict[str, Any],
        pipeline_stats: Dict[str, Any],
        threat_stats: Dict[str, Any],
        alert_stats: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Aggregate statistics from multiple sources
        
        Args:
            monitoring_stats: Monitoring service statistics
            pipeline_stats: Pipeline service statistics
            threat_stats: Threat service statistics
            alert_stats: Alert service statistics
            
        Returns:
            Aggregated statistics dictionary
        """
        aggregated = {
            "monitoring": monitoring_stats,
            "pipeline": pipeline_stats,
            "threat_intelligence": threat_stats,
            "alerts": alert_stats,
            "aggregated_at": datetime.now().isoformat()
        }
        
        # Calculate derived statistics
        aggregated["derived"] = {
            "total_packets_processed": monitoring_stats.get("packets_processed", 0),
            "attack_detection_rate": self._calculate_detection_rate(
                monitoring_stats.get("packets_processed", 0),
                monitoring_stats.get("attacks_detected", 0)
            ),
            "alert_generation_rate": self._calculate_alert_rate(
                monitoring_stats.get("attacks_detected", 0),
                alert_stats.get("total_created", 0)
            )
        }
        
        return aggregated
    
    def _calculate_detection_rate(self, total_packets: int, attacks_detected: int) -> float:
        """
        Calculate attack detection rate
        
        Args:
            total_packets: Total packets processed
            attacks_detected: Number of attacks detected
            
        Returns:
            Detection rate (0.0 to 1.0)
        """
        if total_packets == 0:
            return 0.0
        return attacks_detected / total_packets
    
    def _calculate_alert_rate(self, attacks_detected: int, alerts_created: int) -> float:
        """
        Calculate alert generation rate
        
        Args:
            attacks_detected: Number of attacks detected
            alerts_created: Number of alerts created
            
        Returns:
            Alert rate (0.0 to 1.0)
        """
        if attacks_detected == 0:
            return 0.0
        return alerts_created / attacks_detected
