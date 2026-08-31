"""
SecureNet IDS - Organization Repository

This module handles all organization-related database operations including
organization management, settings, and statistics.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
from .base_repository import BaseRepository

logger = logging.getLogger(__name__)


class OrganizationRepository(BaseRepository):
    """
    Repository for organization operations.
    
    Handles organization CRUD operations, settings management,
    user management within organizations, and statistics.
    """
    
    def __init__(self, supabase_client):
        """Initialize organization repository."""
        super().__init__(supabase_client, "organizations")
    
    async def create_organization(
        self,
        name: str,
        slug: str,
        owner_id: str,
        description: Optional[str] = None,
        plan: str = "free",
        settings: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new organization.
        
        Args:
            name: Organization name
            slug: URL-friendly slug
            owner_id: Owner user ID
            description: Optional description
            plan: Subscription plan
            settings: Organization settings
            
        Returns:
            Created organization or None if failed
        """
        org_data = {
            "name": name,
            "slug": slug,
            "owner_id": owner_id,
            "description": description,
            "plan": plan,
            "settings": settings or self._get_default_settings(),
            "is_active": True
        }
        
        return await self.create(org_data)
    
    async def get_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get organization by slug.
        
        Args:
            slug: Organization slug
            
        Returns:
            Organization or None if not found
        """
        try:
            response = self.supabase.table(self.table_name).select("*").eq("slug", slug).single().execute()
            return response.data if response.data else None
        except Exception as e:
            logger.error(f"Error getting organization by slug {slug}: {e}")
            return None
    
    async def get_by_owner(self, owner_id: str) -> List[Dict[str, Any]]:
        """
        Get all organizations owned by a user.
        
        Args:
            owner_id: Owner user ID
            
        Returns:
            List of organizations
        """
        return await self.get_all(filters={"owner_id": owner_id})
    
    async def update_settings(self, org_id: str, settings: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update organization settings.
        
        Args:
            org_id: Organization ID
            settings: New settings
            
        Returns:
            Updated organization or None if failed
        """
        org = await self.get_by_id(org_id)
        if not org:
            return None
        
        current_settings = org.get("settings", {})
        merged_settings = {**current_settings, **settings}
        
        return await self.update(org_id, {"settings": merged_settings})
    
    async def get_statistics(self, org_id: str) -> Dict[str, Any]:
        """
        Get organization statistics.
        
        Args:
            org_id: Organization ID
            
        Returns:
            Statistics dictionary
        """
        try:
            # Use the database function for statistics
            response = self.supabase.rpc("get_org_statistics", {"p_org_id": org_id}).execute()
            return response.data if response.data else {}
        except Exception as e:
            logger.error(f"Error getting statistics for org {org_id}: {e}")
            return {}
    
    async def get_active_users_count(self, org_id: str) -> int:
        """
        Get count of active users in organization.
        
        Args:
            org_id: Organization ID
            
        Returns:
            Number of active users
        """
        try:
            response = self.supabase.table("profiles").select("*", count="exact").eq("org_id", org_id).eq("is_active", True).execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting active users for org {org_id}: {e}")
            return 0
    
    async def get_alerts_count(self, org_id: str, days: int = 30) -> int:
        """
        Get count of alerts in organization for specified time period.
        
        Args:
            org_id: Organization ID
            days: Number of days to look back
            
        Returns:
            Number of alerts
        """
        try:
            cutoff_date = datetime.utcnow() - datetime.timedelta(days=days)
            response = self.supabase.table("alerts").select("*", count="exact").eq("org_id", org_id).gte("timestamp", cutoff_date.isoformat()).execute()
            return response.count if response.count else 0
        except Exception as e:
            logger.error(f"Error counting alerts for org {org_id}: {e}")
            return 0
    
    async def suspend_organization(self, org_id: str, reason: str) -> Optional[Dict[str, Any]]:
        """
        Suspend an organization.
        
        Args:
            org_id: Organization ID
            reason: Suspension reason
            
        Returns:
            Updated organization or None if failed
        """
        return await self.update(org_id, {
            "is_suspended": True,
            "suspension_reason": reason
        })
    
    async def activate_organization(self, org_id: str) -> Optional[Dict[str, Any]]:
        """
        Activate a suspended organization.
        
        Args:
            org_id: Organization ID
            
        Returns:
            Updated organization or None if failed
        """
        return await self.update(org_id, {
            "is_suspended": False,
            "suspension_reason": None
        })
    
    async def update_plan(self, org_id: str, plan: str, max_users: int = None, max_alerts: int = None) -> Optional[Dict[str, Any]]:
        """
        Update organization subscription plan.
        
        Args:
            org_id: Organization ID
            plan: New plan name
            max_users: Maximum users allowed
            max_alerts: Maximum alerts per month
            
        Returns:
            Updated organization or None if failed
        """
        update_data = {"plan": plan}
        if max_users is not None:
            update_data["max_users"] = max_users
        if max_alerts is not None:
            update_data["max_alerts_per_month"] = max_alerts
        
        return await self.update(org_id, update_data)
    
    def _get_default_settings(self) -> Dict[str, Any]:
        """
        Get default organization settings.
        
        Returns:
            Default settings dictionary
        """
        return {
            "max_users": 100,
            "retention_days": 30,
            "alert_threshold": "medium",
            "enable_notifications": True,
            "enable_siem_export": False,
            "siem_config": {},
            "dashboard_settings": {
                "refresh_interval": 30,
                "show_threat_map": True,
                "show_attack_timeline": True
            }
        }
