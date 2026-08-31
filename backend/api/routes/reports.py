"""
SecureNet IDS - Report API Routes

This module provides REST API endpoints for report generation
including PDF, CSV exports, and report management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response, StreamingResponse
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging
import io

from ..rbac.permissions import Role, Permission, PermissionChecker
from ..database.repositories.alert_repository import AlertRepository
from ..database.repositories.audit_repository import AuditRepository
from ..reporting.generators.pdf_generator import PDFReportGenerator
from ..reporting.generators.csv_generator import CSVReportGenerator
from ..reporting.templates.report_templates import DailyReportTemplate, WeeklyReportTemplate, MonthlyReportTemplate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


# Pydantic models
class ReportCreate(BaseModel):
    """Model for creating a report."""
    report_type: str = Field(..., pattern="^(daily|weekly|monthly|custom)$")
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    format: str = Field(default="pdf", pattern="^(pdf|csv|json)$")
    parameters: Optional[dict] = None


class ReportResponse(BaseModel):
    """Model for report response."""
    id: str
    org_id: str
    report_type: str
    title: str
    description: Optional[str]
    format: str
    status: str
    file_url: Optional[str]
    created_at: datetime
    generated_at: Optional[datetime]


class ReportGenerateRequest(BaseModel):
    """Model for on-demand report generation."""
    report_type: str = Field(..., pattern="^(daily|weekly|monthly)$")
    format: str = Field(default="pdf", pattern="^(pdf|csv)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


# Dependency injection
def get_alert_repository(supabase_client):
    """Get alert repository instance."""
    return AlertRepository(supabase_client)


def get_audit_repository(supabase_client):
    """Get audit repository instance."""
    return AuditRepository(supabase_client)


# API Endpoints
@router.post("/generate", status_code=status.HTTP_200_OK)
async def generate_report(
    request: ReportGenerateRequest,
    user_id: str,
    user_role: Role,
    org_id: str,
    alert_repo: AlertRepository = Depends(get_alert_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Generate a report on-demand.
    
    Returns the report file directly.
    Requires: REPORT_CREATE permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.REPORT_CREATE, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to generate reports"
        )
    
    try:
        # Get alerts for the organization
        alerts = await alert_repo.get_by_org(org_id, limit=10000)
        
        if not alerts:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No alerts found for report generation"
            )
        
        # Generate report data based on type
        if request.report_type == "daily":
            template = DailyReportTemplate(org_id)
        elif request.report_type == "weekly":
            template = WeeklyReportTemplate(org_id)
        else:  # monthly
            template = MonthlyReportTemplate(org_id)
        
        report_data = template.generate_report_data(alerts, {})
        
        # Generate report in requested format
        if request.format == "pdf":
            generator = PDFReportGenerator(f"Organization {org_id}")
            pdf_bytes = generator.generate_report(report_data, request.report_type)
            
            # Log audit event
            await audit_repo.log_action(
                user_id=user_id,
                org_id=org_id,
                action="report_generated",
                resource_type="report",
                details={
                    "report_type": request.report_type,
                    "format": "pdf",
                    "alert_count": len(alerts)
                }
            )
            
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={request.report_type}_report_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
                }
            )
        
        elif request.format == "csv":
            generator = CSVReportGenerator()
            csv_content = generator.generate_summary_report_csv(report_data)
            
            # Log audit event
            await audit_repo.log_action(
                user_id=user_id,
                org_id=org_id,
                action="report_generated",
                resource_type="report",
                details={
                    "report_type": request.report_type,
                    "format": "csv",
                    "alert_count": len(alerts)
                }
            )
            
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={request.report_type}_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"
                }
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/alerts/export")
async def export_alerts(
    user_id: str,
    user_role: Role,
    org_id: str,
    format: str = "csv",
    include_threat_intel: bool = True,
    alert_repo: AlertRepository = Depends(get_alert_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Export alerts in CSV format.
    
    Requires: ALERT_EXPORT permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ALERT_EXPORT, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export alerts"
        )
    
    try:
        alerts = await alert_repo.get_by_org(org_id, limit=10000)
        
        if not alerts:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No alerts found for export"
            )
        
        generator = CSVReportGenerator()
        csv_content = generator.generate_alerts_csv(
            alerts,
            include_threat_intel=include_threat_intel,
            include_packet_data=False
        )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org_id,
            action="alerts_exported",
            resource_type="alert",
            details={
                "format": format,
                "alert_count": len(alerts),
                "include_threat_intel": include_threat_intel
            }
        )
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=alerts_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/audit-logs/export")
async def export_audit_logs(
    user_id: str,
    user_role: Role,
    org_id: str,
    format: str = "csv",
    days: int = 30,
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Export audit logs in CSV format.
    
    Requires: AUDIT_EXPORT permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.AUDIT_EXPORT, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export audit logs"
        )
    
    try:
        logs = await audit_repo.get_by_org(org_id, days=days, limit=10000)
        
        if not logs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No audit logs found for export"
            )
        
        generator = CSVReportGenerator()
        csv_content = generator.generate_audit_logs_csv(logs)
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org_id,
            action="audit_logs_exported",
            resource_type="audit_log",
            details={
                "format": format,
                "days": days,
                "log_count": len(logs)
            }
        )
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=audit_logs_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting audit logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/statistics")
async def get_report_statistics(
    user_id: str,
    user_role: Role,
    org_id: str,
    alert_repo: AlertRepository = Depends(get_alert_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Get statistics for report generation.
    
    Requires: REPORT_VIEW permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.REPORT_VIEW, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view report statistics"
        )
    
    try:
        # Get alert statistics
        alert_stats = await alert_repo.get_alert_statistics(org_id, days=30)
        
        # Get top source IPs
        top_ips = await alert_repo.get_top_source_ips(org_id, days=30, limit=10)
        
        return {
            "alert_statistics": alert_stats,
            "top_source_ips": top_ips,
            "available_report_types": ["daily", "weekly", "monthly"],
            "available_formats": ["pdf", "csv"]
        }
        
    except Exception as e:
        logger.error(f"Error getting report statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
