"""
SecureNet IDS - Background Tasks

This module provides predefined background tasks for the scheduler
including report generation, data cleanup, and health monitoring.
"""

import logging
from datetime import datetime
from typing import Optional
from ..database.repositories.alert_repository import AlertRepository
from ..database.repositories.audit_repository import AuditRepository
from ..reporting.generators.pdf_generator import PDFReportGenerator
from ..reporting.generators.csv_generator import CSVReportGenerator
from ..reporting.templates.report_templates import DailyReportTemplate, WeeklyReportTemplate
from ..database.repositories.organization_repository import OrganizationRepository

logger = logging.getLogger(__name__)


class BackgroundTasks:
    """
    Collection of background tasks for the scheduler.
    
    Provides common tasks like report generation, data cleanup,
    and health monitoring.
    """
    
    def __init__(self, supabase_client):
        """
        Initialize background tasks.
        
        Args:
            supabase_client: Supabase client instance
        """
        self.supabase = supabase_client
        self.alert_repo = AlertRepository(supabase_client)
        self.audit_repo = AuditRepository(supabase_client)
        self.org_repo = OrganizationRepository(supabase_client)
    
    async def generate_daily_reports(self):
        """
        Generate daily reports for all organizations.
        
        This task runs daily to generate PDF and CSV reports
        for each organization's security activity.
        """
        logger.info("Starting daily report generation")
        
        try:
            # Get all active organizations
            orgs = await self.org_repo.get_all(limit=1000, filters={"is_active": True})
            
            for org in orgs:
                try:
                    org_id = org.get("id")
                    org_name = org.get("name", "Unknown")
                    
                    logger.info(f"Generating daily report for organization: {org_name}")
                    
                    # Get alerts for the day
                    from datetime import timedelta
                    alerts = await self.alert_repo.get_by_org(org_id, limit=10000)
                    
                    # Filter to last 24 hours
                    cutoff = datetime.utcnow() - timedelta(days=1)
                    daily_alerts = [
                        a for a in alerts 
                        if self._parse_timestamp(a.get("timestamp")) >= cutoff
                    ]
                    
                    if not daily_alerts:
                        logger.info(f"No alerts for {org_name} in the last 24 hours")
                        continue
                    
                    # Generate report data
                    template = DailyReportTemplate(org_id)
                    report_data = template.generate_report_data(daily_alerts, {})
                    
                    # Generate PDF report
                    pdf_generator = PDFReportGenerator(org_name)
                    pdf_bytes = pdf_generator.generate_report(report_data, "daily")
                    
                    # Generate CSV report
                    csv_generator = CSVReportGenerator()
                    csv_content = csv_generator.generate_summary_report_csv(report_data)
                    
                    # Store report in database (would need report repository)
                    logger.info(f"Daily report generated for {org_name}: {len(daily_alerts)} alerts")
                    
                except Exception as e:
                    logger.error(f"Error generating daily report for org {org.get('id')}: {e}")
            
            logger.info("Daily report generation completed")
            
        except Exception as e:
            logger.error(f"Error in daily report generation task: {e}")
    
    async def cleanup_old_audit_logs(self):
        """
        Clean up old audit logs.
        
        This task runs weekly to remove audit logs older than 90 days.
        """
        logger.info("Starting audit log cleanup")
        
        try:
            deleted_count = await self.audit_repo.cleanup_old_logs(days=90)
            logger.info(f"Cleaned up {deleted_count} old audit logs")
        except Exception as e:
            logger.error(f"Error in audit log cleanup task: {e}")
    
    async def cleanup_old_alerts(self):
        """
        Clean up old resolved alerts.
        
        This task runs weekly to remove resolved alerts older than 180 days.
        """
        logger.info("Starting old alerts cleanup")
        
        try:
            from datetime import timedelta
            cutoff = datetime.utcnow() - timedelta(days=180)
            
            # This would need to be implemented in alert repository
            # For now, just log the action
            logger.info(f"Would clean up alerts older than {cutoff.isoformat()}")
            
        except Exception as e:
            logger.error(f"Error in old alerts cleanup task: {e}")
    
    async def health_check(self):
        """
        Perform system health check.
        
        This task runs every 5 minutes to check system health.
        """
        logger.debug("Performing system health check")
        
        try:
            health_status = {
                "timestamp": datetime.utcnow().isoformat(),
                "database": await self._check_database_health(),
                "organizations": await self._check_organizations_health(),
                "alerts": await self._check_alerts_health()
            }
            
            overall_healthy = all(
                status.get("healthy", False) 
                for status in health_status.values() 
                if isinstance(status, dict)
            )
            
            if overall_healthy:
                logger.debug("System health check: All systems healthy")
            else:
                logger.warning(f"System health check: Issues detected - {health_status}")
            
        except Exception as e:
            logger.error(f"Error in health check task: {e}")
    
    async def _check_database_health(self) -> Dict[str, Any]:
        """Check database health."""
        try:
            # Simple health check by querying organizations
            orgs = await self.org_repo.get_all(limit=1)
            return {
                "healthy": True,
                "message": "Database connection healthy"
            }
        except Exception as e:
            return {
                "healthy": False,
                "message": f"Database connection failed: {str(e)}"
            }
    
    async def _check_organizations_health(self) -> Dict[str, Any]:
        """Check organizations health."""
        try:
            org_count = await self.org_repo.count()
            return {
                "healthy": True,
                "message": f"{org_count} organizations active"
            }
        except Exception as e:
            return {
                "healthy": False,
                "message": f"Organizations check failed: {str(e)}"
            }
    
    async def _check_alerts_health(self) -> Dict[str, Any]:
        """Check alerts health."""
        try:
            # Check recent alerts
            from datetime import timedelta
            cutoff = datetime.utcnow() - timedelta(hours=1)
            recent_alerts = await self.alert_repo.get_by_org(
                org_id="*",  # This would need to be modified for all orgs
                limit=1
            )
            return {
                "healthy": True,
                "message": "Alert system healthy"
            }
        except Exception as e:
            return {
                "healthy": False,
                "message": f"Alerts check failed: {str(e)}"
            }
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """Parse timestamp string to datetime."""
        try:
            if timestamp_str:
                if timestamp_str.endswith('Z'):
                    timestamp_str = timestamp_str[:-1] + '+00:00'
                return datetime.fromisoformat(timestamp_str)
            return datetime.utcnow()
        except Exception:
            return datetime.utcnow()


def register_default_tasks(scheduler, supabase_client):
    """
    Register default background tasks with scheduler.
    
    Args:
        scheduler: BackgroundJobScheduler instance
        supabase_client: Supabase client instance
    """
    tasks = BackgroundTasks(supabase_client)
    
    # Register daily report generation (runs daily at 00:00)
    scheduler.register_job(
        name="daily_reports",
        func=tasks.generate_daily_reports,
        interval_seconds=86400,  # 24 hours
        enabled=True
    )
    
    # Register audit log cleanup (runs weekly)
    scheduler.register_job(
        name="audit_log_cleanup",
        func=tasks.cleanup_old_audit_logs,
        interval_seconds=604800,  # 7 days
        enabled=True
    )
    
    # Register old alerts cleanup (runs weekly)
    scheduler.register_job(
        name="old_alerts_cleanup",
        func=tasks.cleanup_old_alerts,
        interval_seconds=604800,  # 7 days
        enabled=True
    )
    
    # Register health check (runs every 5 minutes)
    scheduler.register_job(
        name="health_check",
        func=tasks.health_check,
        interval_seconds=300,  # 5 minutes
        enabled=True
    )
    
    logger.info("Default background tasks registered")
