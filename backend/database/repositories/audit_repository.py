"""
SecureNet IDS - Audit Repository

This module handles all audit log operations including
logging user actions, permission checks, and system events.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import logging
from .base_repository import BaseRepository

logger = logging.getLogger(__name__)


class AuditRepository(BaseRepository):
    """
    Repository for audit log operations.
    
    Handles audit logging for all user actions, permission checks,
    and system events with filtering and export capabilities.
    """
    
    def __init__(self, supabase_client):
        """Initialize audit repository."""
        super().__init__(supabase_client, "audit_logs")
    
    async def log_action(
        self,
        user_id: Optional[str],
        org_id: Optional[str],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        status: str = "success",
        error_message: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Log a user action for audit trail.
        
        Args:
            user_id: User ID performing the action
            org_id: Organization ID
            action: Action performed
            resource_type: Type of resource affected
            resource_id: ID of resource affected
            details: Additional action details
            ip_address: IP address of the user
            user_agent: User agent string
            status: Action status (success, failure, partial)
            error_message: Error message if failed
            
        Returns:
            Created audit log or None if failed
        """
        # Get user email and role if user_id provided
        email = None
        role = None
        if user_id:
            try:
                profile = self.supabase.table("profiles").select("email", "role").eq("id", user_id).single().execute()
                if profile.data:
                    email = profile.data.get("email")
                    role = profile.data.get("role")
            except Exception as e:
                logger.warning(f"Could not fetch user profile for audit log: {e}")
        
        audit_data = {
            "user_id": user_id,
            "org_id": org_id,
            "email": email,
            "role": role,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
            "ip_address": ip_address,
            "user_agent": user_agent,
            "status": status,
            "error_message": error_message,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return await self.create(audit_data)
    
    async def get_by_user(
        self,
        user_id: str,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get audit logs for a specific user.
        
        Args:
            user_id: User ID
            limit: Maximum records to return
            offset: Number of records to skip
            
        Returns:
            List of audit logs
        """
        return await self.get_all(
            filters={"user_id": user_id},
            limit=limit,
            offset=offset,
            order_by="created_at",
            ascending=False
        )
    
    async def get_by_org(
        self,
        org_id: str,
        action: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get audit logs for an organization with optional filtering.
        
        Args:
            org_id: Organization ID
            action: Optional action filter
            status: Optional status filter
            limit: Maximum records to return
            offset: Number of records to skip
            
        Returns:
            List of audit logs
        """
        filters = {"org_id": org_id}
        if action:
            filters["action"] = action
        if status:
            filters["status"] = status
        
        return await self.get_all(
            filters=filters,
            limit=limit,
            offset=offset,
            order_by="created_at",
            ascending=False
        )
    
    async def get_by_resource(
        self,
        resource_type: str,
        resource_id: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get audit logs for a specific resource.
        
        Args:
            resource_type: Type of resource
            resource_id: Resource ID
            limit: Maximum records to return
            
        Returns:
            List of audit logs
        """
        try:
            response = self.supabase.table(self.table_name).select("*").eq("resource_type", resource_type).eq("resource_id", resource_id).order("created_at", desc=True).limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting audit logs for resource {resource_type}/{resource_id}: {e}")
            return []
    
    async def get_by_action(
        self,
        action: str,
        org_id: Optional[str] = None,
        days: int = 30,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get audit logs for a specific action.
        
        Args:
            action: Action to filter by
            org_id: Optional organization ID
            days: Number of days to look back
            limit: Maximum records to return
            
        Returns:
            List of audit logs
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            query = self.supabase.table(self.table_name).select("*").eq("action", action).gte("created_at", cutoff_date.isoformat())
            
            if org_id:
                query = query.eq("org_id", org_id)
            
            response = query.order("created_at", desc=True).limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Error getting audit logs for action {action}: {e}")
            return []
    
    async def get_user_activity_summary(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get activity summary for a user.
        
        Args:
            user_id: User ID
            days: Number of days to analyze
            
        Returns:
            Activity summary dictionary
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            logs = await self.get_by_user(user_id, limit=10000)
            logs = [log for log in logs if self._parse_timestamp(log["created_at"]) >= cutoff_date]
            
            # Calculate summary
            total_actions = len(logs)
            by_action = {}
            by_status = {}
            by_resource = {}
            
            for log in logs:
                action = log.get("action", "unknown")
                status = log.get("status", "unknown")
                resource_type = log.get("resource_type", "unknown")
                
                by_action[action] = by_action.get(action, 0) + 1
                by_status[status] = by_status.get(status, 0) + 1
                by_resource[resource_type] = by_resource.get(resource_type, 0) + 1
            
            return {
                "total_actions": total_actions,
                "by_action": by_action,
                "by_status": by_status,
                "by_resource": by_resource,
                "last_activity": logs[0]["created_at"] if logs else None
            }
        except Exception as e:
            logger.error(f"Error getting user activity summary: {e}")
            return {}
    
    async def get_org_activity_summary(
        self,
        org_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get activity summary for an organization.
        
        Args:
            org_id: Organization ID
            days: Number of days to analyze
            
        Returns:
            Activity summary dictionary
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            logs = await self.get_by_org(org_id, limit=10000)
            logs = [log for log in logs if self._parse_timestamp(log["created_at"]) >= cutoff_date]
            
            # Calculate summary
            total_actions = len(logs)
            by_user = {}
            by_action = {}
            by_status = {}
            
            for log in logs:
                user_id = log.get("user_id")
                email = log.get("email", "unknown")
                action = log.get("action", "unknown")
                status = log.get("status", "unknown")
                
                user_key = f"{user_id}:{email}" if user_id else "system"
                by_user[user_key] = by_user.get(user_key, 0) + 1
                by_action[action] = by_action.get(action, 0) + 1
                by_status[status] = by_status.get(status, 0) + 1
            
            return {
                "total_actions": total_actions,
                "by_user": by_user,
                "by_action": by_action,
                "by_status": by_status,
                "unique_users": len(by_user)
            }
        except Exception as e:
            logger.error(f"Error getting org activity summary: {e}")
            return {}
    
    async def export_logs(
        self,
        org_id: Optional[str] = None,
        user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        format: str = "json"
    ) -> str:
        """
        Export audit logs in specified format.
        
        Args:
            org_id: Optional organization ID filter
            user_id: Optional user ID filter
            start_date: Optional start date
            end_date: Optional end date
            format: Export format (json, csv)
            
        Returns:
            Exported data as string
        """
        try:
            query = self.supabase.table(self.table_name).select("*")
            
            if org_id:
                query = query.eq("org_id", org_id)
            if user_id:
                query = query.eq("user_id", user_id)
            if start_date:
                query = query.gte("created_at", start_date.isoformat())
            if end_date:
                query = query.lte("created_at", end_date.isoformat())
            
            response = query.order("created_at", desc=True).limit(10000).execute()
            logs = response.data if response.data else []
            
            if format == "json":
                import json
                return json.dumps(logs, indent=2, default=str)
            elif format == "csv":
                import csv
                import io
                
                if not logs:
                    return ""
                
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=logs[0].keys())
                writer.writeheader()
                writer.writerows(logs)
                return output.getvalue()
            else:
                raise ValueError(f"Unsupported format: {format}")
        except Exception as e:
            logger.error(f"Error exporting audit logs: {e}")
            raise
    
    async def cleanup_old_logs(self, days: int = 90) -> int:
        """
        Clean up old audit logs.
        
        Args:
            days: Number of days to retain
            
        Returns:
            Number of logs deleted
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            response = self.supabase.table(self.table_name).delete().lt("created_at", cutoff_date.isoformat()).execute()
            deleted_count = len(response.data) if response.data else 0
            logger.info(f"Cleaned up {deleted_count} old audit logs")
            return deleted_count
        except Exception as e:
            logger.error(f"Error cleaning up old audit logs: {e}")
            return 0
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """
        Parse ISO timestamp string to datetime object.
        
        Args:
            timestamp_str: ISO format timestamp string
            
        Returns:
            Datetime object
        """
        try:
            if timestamp_str.endswith('Z'):
                timestamp_str = timestamp_str[:-1] + '+00:00'
            return datetime.fromisoformat(timestamp_str)
        except Exception as e:
            logger.error(f"Error parsing timestamp {timestamp_str}: {e}")
            return datetime.utcnow()
