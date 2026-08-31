"""
SecureNet IDS - Health Monitoring System

This module provides comprehensive health monitoring for the SOC platform
including service health checks, metrics collection, and alerting.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import psutil
import time

logger = logging.getLogger(__name__)


@dataclass
class HealthCheckResult:
    """Result of a health check."""
    service: str
    healthy: bool
    message: str
    response_time_ms: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SystemMetrics:
    """System performance metrics."""
    timestamp: datetime = field(default_factory=datetime.utcnow)
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    memory_used_mb: float = 0.0
    memory_available_mb: float = 0.0
    disk_percent: float = 0.0
    disk_used_gb: float = 0.0
    disk_available_gb: float = 0.0
    network_sent_mb: float = 0.0
    network_recv_mb: float = 0.0
    active_connections: int = 0


class HealthMonitor:
    """
    Health monitoring system for SOC platform.
    
    Monitors all system components, collects metrics,
    and provides health status endpoints.
    """
    
    def __init__(self):
        """Initialize health monitor."""
        self.health_checks: Dict[str, HealthCheckResult] = {}
        self.metrics_history: List[SystemMetrics] = []
        self.max_history_size = 1000
        self.alert_thresholds = {
            "cpu_percent": 80,
            "memory_percent": 85,
            "disk_percent": 90
        }
    
    async def check_database_health(self, supabase_client) -> HealthCheckResult:
        """
        Check database health.
        
        Args:
            supabase_client: Supabase client instance
            
        Returns:
            Health check result
        """
        start_time = time.time()
        
        try:
            # Simple query to test connection
            response = supabase_client.table("organizations").select("id").limit(1).execute()
            
            response_time = (time.time() - start_time) * 1000
            
            if response.data is not None:
                return HealthCheckResult(
                    service="database",
                    healthy=True,
                    message="Database connection healthy",
                    response_time_ms=response_time,
                    details={"query_time_ms": response_time}
                )
            else:
                return HealthCheckResult(
                    service="database",
                    healthy=False,
                    message="Database query returned no data",
                    response_time_ms=response_time
                )
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return HealthCheckResult(
                service="database",
                healthy=False,
                message=f"Database connection failed: {str(e)}",
                response_time_ms=response_time
            )
    
    async def check_ml_model_health(self, model_path: str) -> HealthCheckResult:
        """
        Check ML model health.
        
        Args:
            model_path: Path to model file
            
        Returns:
            Health check result
        """
        start_time = time.time()
        
        try:
            from pathlib import Path
            model_file = Path(model_path)
            
            if not model_file.exists():
                return HealthCheckResult(
                    service="ml_model",
                    healthy=False,
                    message=f"Model file not found: {model_path}",
                    response_time_ms=(time.time() - start_time) * 1000
                )
            
            # Check file size
            file_size_mb = model_file.stat().st_size / (1024 * 1024)
            
            response_time = (time.time() - start_time) * 1000
            
            return HealthCheckResult(
                service="ml_model",
                healthy=True,
                message="ML model file accessible",
                response_time_ms=response_time,
                details={
                    "file_size_mb": round(file_size_mb, 2),
                    "model_path": str(model_path)
                }
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return HealthCheckResult(
                service="ml_model",
                healthy=False,
                message=f"ML model check failed: {str(e)}",
                response_time_ms=response_time
            )
    
    async def check_threat_intel_health(self, api_keys: Dict[str, Optional[str]]) -> HealthCheckResult:
        """
        Check threat intelligence API health.
        
        Args:
            api_keys: Dictionary of API keys
            
        Returns:
            Health check result
        """
        start_time = time.time()
        
        try:
            available_apis = sum(1 for key in api_keys.values() if key)
            total_apis = len(api_keys)
            
            response_time = (time.time() - start_time) * 1000
            
            if available_apis > 0:
                return HealthCheckResult(
                    service="threat_intel",
                    healthy=True,
                    message=f"{available_apis}/{total_apis} threat intel APIs configured",
                    response_time_ms=response_time,
                    details={
                        "available_apis": available_apis,
                        "total_apis": total_apis
                    }
                )
            else:
                return HealthCheckResult(
                    service="threat_intel",
                    healthy=False,
                    message="No threat intel APIs configured",
                    response_time_ms=response_time
                )
                
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return HealthCheckResult(
                service="threat_intel",
                healthy=False,
                message=f"Threat intel check failed: {str(e)}",
                response_time_ms=response_time
            )
    
    async def check_packet_capture_health(self, interface: str) -> HealthCheckResult:
        """
        Check packet capture health.
        
        Args:
            interface: Network interface name
            
        Returns:
            Health check result
        """
        start_time = time.time()
        
        try:
            # Check if interface exists
            import socket
            interfaces = psutil.net_if_addrs()
            
            if interface not in interfaces:
                return HealthCheckResult(
                    service="packet_capture",
                    healthy=False,
                    message=f"Network interface not found: {interface}",
                    response_time_ms=(time.time() - start_time) * 1000,
                    details={"available_interfaces": list(interfaces.keys())}
                )
            
            response_time = (time.time() - start_time) * 1000
            
            return HealthCheckResult(
                service="packet_capture",
                healthy=True,
                message=f"Network interface accessible: {interface}",
                response_time_ms=response_time,
                details={"interface": interface}
            )
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return HealthCheckResult(
                service="packet_capture",
                healthy=False,
                message=f"Packet capture check failed: {str(e)}",
                response_time_ms=response_time
            )
    
    def collect_system_metrics(self) -> SystemMetrics:
        """
        Collect system performance metrics.
        
        Returns:
            System metrics
        """
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_available_mb = memory.available / (1024 * 1024)
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            disk_used_gb = disk.used / (1024 * 1024 * 1024)
            disk_available_gb = disk.free / (1024 * 1024 * 1024)
            
            # Network metrics
            network = psutil.net_io_counters()
            network_sent_mb = network.bytes_sent / (1024 * 1024)
            network_recv_mb = network.bytes_recv / (1024 * 1024)
            
            # Network connections
            connections = len(psutil.net_connections())
            
            metrics = SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_mb=memory_used_mb,
                memory_available_mb=memory_available_mb,
                disk_percent=disk_percent,
                disk_used_gb=disk_used_gb,
                disk_available_gb=disk_available_gb,
                network_sent_mb=network_sent_mb,
                network_recv_mb=network_recv_mb,
                active_connections=connections
            )
            
            # Add to history
            self.metrics_history.append(metrics)
            if len(self.metrics_history) > self.max_history_size:
                self.metrics_history.pop(0)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
            return SystemMetrics()
    
    def check_metric_thresholds(self, metrics: SystemMetrics) -> List[str]:
        """
        Check if metrics exceed alert thresholds.
        
        Args:
            metrics: System metrics
            
        Returns:
            List of threshold violation messages
        """
        violations = []
        
        if metrics.cpu_percent > self.alert_thresholds["cpu_percent"]:
            violations.append(f"CPU usage {metrics.cpu_percent}% exceeds threshold {self.alert_thresholds['cpu_percent']}%")
        
        if metrics.memory_percent > self.alert_thresholds["memory_percent"]:
            violations.append(f"Memory usage {metrics.memory_percent}% exceeds threshold {self.alert_thresholds['memory_percent']}%")
        
        if metrics.disk_percent > self.alert_thresholds["disk_percent"]:
            violations.append(f"Disk usage {metrics.disk_percent}% exceeds threshold {self.alert_thresholds['disk_percent']}%")
        
        return violations
    
    async def perform_full_health_check(
        self,
        supabase_client,
        model_path: str,
        api_keys: Dict[str, Optional[str]],
        interface: str
    ) -> Dict[str, Any]:
        """
        Perform full health check of all services.
        
        Args:
            supabase_client: Supabase client
            model_path: ML model path
            api_keys: Threat intel API keys
            interface: Network interface
            
        Returns:
            Complete health check results
        """
        results = {}
        
        # Check all services
        results["database"] = await self.check_database_health(supabase_client)
        results["ml_model"] = await self.check_ml_model_health(model_path)
        results["threat_intel"] = await self.check_threat_intel_health(api_keys)
        results["packet_capture"] = await self.check_packet_capture_health(interface)
        
        # Collect system metrics
        metrics = self.collect_system_metrics()
        results["system_metrics"] = metrics
        
        # Check thresholds
        violations = self.check_metric_thresholds(metrics)
        results["threshold_violations"] = violations
        
        # Overall health
        all_healthy = all(
            result.healthy for result in results.values()
            if isinstance(result, HealthCheckResult)
        )
        
        results["overall_healthy"] = all_healthy and len(violations) == 0
        results["timestamp"] = datetime.utcnow().isoformat()
        
        return results
    
    def get_health_summary(self) -> Dict[str, Any]:
        """
        Get summary of health check results.
        
        Returns:
            Health summary dictionary
        """
        if not self.health_checks:
            return {
                "status": "unknown",
                "message": "No health checks performed yet",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        healthy_count = sum(1 for check in self.health_checks.values() if check.healthy)
        total_count = len(self.health_checks)
        
        return {
            "status": "healthy" if healthy_count == total_count else "degraded",
            "healthy_services": healthy_count,
            "total_services": total_count,
            "last_check": max(
                check.timestamp for check in self.health_checks.values()
            ).isoformat(),
            "services": {
                name: {
                    "healthy": check.healthy,
                    "message": check.message,
                    "response_time_ms": check.response_time_ms
                }
                for name, check in self.health_checks.items()
            }
        }
    
    def get_metrics_history(self, hours: int = 1) -> List[Dict[str, Any]]:
        """
        Get metrics history for specified time period.
        
        Args:
            hours: Number of hours of history
            
        Returns:
            List of metrics dictionaries
        """
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        return [
            {
                "timestamp": m.timestamp.isoformat(),
                "cpu_percent": m.cpu_percent,
                "memory_percent": m.memory_percent,
                "disk_percent": m.disk_percent,
                "active_connections": m.active_connections
            }
            for m in self.metrics_history
            if m.timestamp >= cutoff
        ]


# Global health monitor instance
health_monitor = HealthMonitor()
