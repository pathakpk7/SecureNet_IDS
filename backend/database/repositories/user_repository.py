"""
SecureNet IDS - User Repository

This module handles all user-related database operations including
user management, role assignment, and organization membership.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import logging
from .base_repository import BaseRepository

logger = logging.getLogger(__name__)


class UserRepository(BaseRepository):
    """
    Repository for user/profile operations.
    
    Handles user CRUD operations, role management, organization
    membership, and user settings.
    """
    
    def __init__(self, supabase_client):
        """Initialize user repository."""
        super().__init__(supabase_client, "profiles")
    
    async def create_profile(
        self,
        user_id: str,
        email: str,
        org_id: str,
        role: str = "viewer",
        full_name: Optional[str] = None,
        settings: Optional[Dict[str, Any]] = None,
        created_by: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new user profile.
        
        Args:
            user_id: User ID from auth.users
            email: User email
            org_id: Organization ID
            role: User role
            full_name: User's full name
            settings: User settings
            created_by: ID of user creating this profile
            
        Returns:
            Created profile or None if failed
        """
        profile_data = {
            "id": user_id,
            "email": email,
            "org_id": org_id,
            "role": role,
            "full_name": full_name,
            "settings": settings or self._get_default_settings(),
            "is_active": True,
            "is_invited": False,
            "created_by": created_by
        }
        
        return await self.create(profile_data)
    
    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile by email.
        
        Args:
            email: User email
            
        Returns:
            Profile or None if not found
        """
        try:
            response = self.supabase.table(self.table_name).select("*").eq("email", email).single().execute()
            return response.data if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {e}")
            return None
    
    async def get_by_org(self, org_id: str, active_only: bool = True) -> List[Dict[str, Any]]:
        """
        Get all users in an organization.
        
        Args:
            org_id: Organization ID
            active_only: Only return active users
            
        Returns:
            List of user profiles
        """
        filters = {"org_id": org_id}
        if active_only:
            filters["is_active"] = True
        
        return await self.get_all(filters=filters, order_by="created_at", ascending=False)
    
    async def get_by_role(self, org_id: str, role: str) -> List[Dict[str, Any]]:
        """
        Get all users with a specific role in an organization.
        
        Args:
            org_id: Organization ID
            role: User role
            
        Returns:
            List of user profiles
        """
        return await self.get_all(filters={"org_id": org_id, "role": role})
    
    async def update_role(self, user_id: str, new_role: str, updated_by: str) -> Optional[Dict[str, Any]]:
        """
        Update user role.
        
        Args:
            user_id: User ID
            new_role: New role
            updated_by: ID of user making the change
            
        Returns:
            Updated profile or None if failed
        """
        return await self.update(user_id, {
            "role": new_role,
            "updated_by": updated_by,
            "updated_at": datetime.utcnow().isoformat()
        })
    
    async def update_settings(self, user_id: str, settings: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user settings.
        
        Args:
            user_id: User ID
            settings: New settings
            
        Returns:
            Updated profile or None if failed
        """
        profile = await self.get_by_id(user_id)
        if not profile:
            return None
        
        current_settings = profile.get("settings", {})
        merged_settings = {**current_settings, **settings}
        
        return await self.update(user_id, {"settings": merged_settings})
    
    async def deactivate_user(self, user_id: str, updated_by: str) -> Optional[Dict[str, Any]]:
        """
        Deactivate a user.
        
        Args:
            user_id: User ID
            updated_by: ID of user deactivating
            
        Returns:
            Updated profile or None if failed
        """
        return await self.update(user_id, {
            "is_active": False,
            "updated_by": updated_by
        })
    
    async def activate_user(self, user_id: str, updated_by: str) -> Optional[Dict[str, Any]]:
        """
        Activate a deactivated user.
        
        Args:
            user_id: User ID
            updated_by: ID of user activating
            
        Returns:
            Updated profile or None if failed
        """
        return await self.update(user_id, {
            "is_active": True,
            "updated_by": updated_by
        })
    
    async def update_last_login(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Update user's last login timestamp.
        
        Args:
            user_id: User ID
            
        Returns:
            Updated profile or None if failed
        """
        return await self.update(user_id, {
            "last_login_at": datetime.utcnow().isoformat()
        })
    
    async def transfer_ownership(self, org_id: str, new_owner_id: str, current_owner_id: str) -> bool:
        """
        Transfer organization ownership to another user.
        
        Args:
            org_id: Organization ID
            new_owner_id: New owner user ID
            current_owner_id: Current owner user ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Update new owner to org_admin role
            await self.update_role(new_owner_id, "org_admin", current_owner_id)
            
            # Update organization owner
            self.supabase.table("organizations").update({"owner_id": new_owner_id}).eq("id", org_id).execute()
            
            logger.info(f"Transferred ownership of org {org_id} to user {new_owner_id}")
            return True
        except Exception as e:
            logger.error(f"Error transferring ownership: {e}")
            return False
    
    async def get_user_permissions(self, user_id: str) -> Dict[str, bool]:
        """
        Get user's permissions based on their role.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary of permissions
        """
        from ..rbac.permissions import PermissionChecker, Role
        
        profile = await self.get_by_id(user_id)
        if not profile:
            return {}
        
        role_str = profile.get("role", "viewer")
        try:
            role = Role(role_str)
        except ValueError:
            role = Role.VIEWER
        
        checker = PermissionChecker()
        permissions = checker.get_user_permissions(role)
        
        return {perm.value: True for perm in permissions}
    
    def _get_default_settings(self) -> Dict[str, Any]:
        """
        Get default user settings.
        
        Returns:
            Default settings dictionary
        """
        return {
            "timezone": "UTC",
            "language": "en",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False
            },
            "dashboard_preferences": {
                "default_view": "overview",
                "items_per_page": 25
            }
        }
