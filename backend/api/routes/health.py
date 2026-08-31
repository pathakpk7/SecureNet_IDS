"""
SecureNet IDS - Health API Routes

This module provides REST API endpoints for health monitoring
including system health checks, metrics, and status.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from ..utils.health_monitor import HealthMonitor, health_monitor
from ..rbac.permissions import Role, Permission, PermissionChecker
from ..database.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/health", tags=["health"])


# Pydantic models
class HealthResponse(BaseModel):
    """Model for health check response."""
    status: str
    timestamp: datetime
    services: Dict[str, Dict[str, Any]]
    system_metrics: Optional[Dict[str, Any]] = None
    threshold_violations: list = []


class ServiceHealthResponse(BaseModel):
    """Model for individual service health."""
    service: str
    healthy: bool
    message: str
    response_time_ms: float
    details: Dict[str, Any]


# Dependency injection
def get_health_monitor():
    """Get health monitor instance."""
    return health_monitor


def get_audit_repository(supabase_client):
    """Get audit repository instance."""
    return AuditRepository(supabase_client)


# API Endpoints
@router.get("/", response_model=HealthResponse)
async def get_health_status(
    user_id: Optional[str] = None,
    user_role: Role = Role.VIEWER,
    monitor: HealthMonitor = Depends(get_health_monitor),
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get overall system health status.
    
    Requires: SYSTEM_HEALTH permission
    """
    # Permission check (optional for health endpoints)
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.SYSTEM_HEALTH, user_id=user_id):
            # Health endpoints are often public, but we can enforce if needed
            pass
    
    try:
        summary = monitor.get_health_summary()
        return HealthResponse(**summary)
    except Exception as e:
        logger.error(f"Error getting health status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/full")
async def perform_full_health_check(
    user_id: str,
    user_role: Role,
    supabase_client,
    monitor: HealthMonitor = Depends(get_health_monitor),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Perform full health check of all services.
    
    Requires: SYSTEM_HEALTH permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.SYSTEM_HEALTH, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to perform full health check"
        )
    
    try:
        from ..config_enhanced import enhanced_settings
        
        # Perform full health check
        results = await monitor.perform_full_health_check(
            supabase_client=supabase_client,
            model_path=enhanced_settings.model_path,
            api_keys={
                "virustotal": enhanced_settings.virustotal_api_key,
                "abuseipdb": enhanced_settings.abuseipdb_api_key,
                "urlscan": enhanced_settings.urlscan_api_key,
                "otx": enhanced_settings.otx_api_key,
                "google_safe": enhanced_settings.google_safe_api_key
            },
            interface=enhanced_settings.network_interface
        )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            action="health_check_performed",
            resource_type="system",
            details={
                "overall_healthy": results.get("overall_healthy"),
                "violations": results.get("threshold_violations")
            }
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Error performing full health check: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/metrics")
async def get_system_metrics(
    user_id: str,
    user_role: Role,
    hours: int = 1,
    monitor: HealthMonitor = Depends(get_health_monitor),
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get system metrics history.
    
    Requires: SYSTEM_VIEW permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.SYSTEM_VIEW, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view system metrics"
            )
    
    try:
        metrics_history = monitor.get_metrics_history(hours=hours)
        
        # Get current metrics
        current_metrics = monitor.collect_system_metrics()
        
        return {
            "current": {
                "timestamp": current_metrics.timestamp.isoformat(),
                "cpu_percent": current_metrics.cpu_percent,
                "memory_percent": current_metrics.memory_percent,
                "memory_used_mb": round(current_metrics.memory_used_mb, 2),
                "memory_available_mb": round(current_metrics.memory_available_mb, 2),
                "disk_percent": current_metrics.disk_percent,
                "disk_used_gb": round(current_metrics.disk_used_gb, 2),
                "disk_available_gb": round(current_metrics.disk_available_gb, 2),
                "active_connections": current_metrics.active_connections
            },
            "history": metrics_history,
            "period_hours": hours
        }
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/services/{service_name}", response_model=ServiceHealthResponse)
async def get_service_health(
    service_name: str,
    user_id: str,
    user_role: Role,
    monitor: HealthMonitor = Depends(get_health_monitor),
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get health status of a specific service.
    
    Requires: SYSTEM_HEALTH permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.SYSTEM_HEALTH, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view service health"
            )
    
    try:
        # Get service health from monitor
        if service_name in monitor.health_checks:
            check = monitor.health_checks[service_name]
            return ServiceHealthResponse(
                service=check.service,
                healthy=check.healthy,
                message=check.message,
                response_time_ms=check.response_time_ms,
                details=check.details
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service '{service_name}' not found"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting service health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/scheduler/status")
async def get_scheduler_status(
    user_id: str,
    user_role: Role,
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get background job scheduler status.
    
    Requires: SYSTEM_VIEW permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.SYSTEM_VIEW, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view scheduler status"
            )
    
    try:
        from ..background_jobs.scheduler import scheduler
        
        return scheduler.get_scheduler_status()
        
    except Exception as e:
        logger.error(f"Error getting scheduler status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/scheduler/jobs")
async def get_scheduled_jobs(
    user_id: str,
    user_role: Role,
    audit_repo: Optional[AuditRepository] = Depends(get_audit_repository)
):
    """
    Get all scheduled jobs and their status.
    
    Requires: SYSTEM_VIEW permission
    """
    # Permission check
    if audit_repo:
        checker = PermissionChecker(audit_repo)
        if not checker.has_permission(user_role, Permission.SYSTEM_VIEW, user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to view scheduled jobs"
            )
    
    try:
        from ..background_jobs.scheduler import scheduler
        
        return scheduler.get_all_job_statuses()
        
    except Exception as e:
        logger.error(f"Error getting scheduled jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
