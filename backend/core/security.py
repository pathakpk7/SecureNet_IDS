"""
SecureNet IDS - Enterprise RBAC Permissions System

This module defines the permission system for the SOC platform with:
- Granular permission definitions
- Role-based permission mapping
- Permission checking utilities
- Audit logging for permission checks
"""

from enum import Enum
from typing import Dict, List, Set, Optional
from functools import wraps
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class Permission(str, Enum):
    """Granular permission definitions for SOC platform"""
    
    # Organization Management
    ORG_VIEW = "org.view"
    ORG_EDIT = "org.edit"
    ORG_DELETE = "org.delete"
    ORG_MANAGE_SETTINGS = "org.manage_settings"
    ORG_MANAGE_USERS = "org.manage_users"
    ORG_INVITE_USERS = "org.invite_users"
    ORG_VIEW_STATS = "org.view_stats"
    
    # User Management
    USER_VIEW = "user.view"
    USER_CREATE = "user.create"
    USER_EDIT = "user.edit"
    USER_DELETE = "user.delete"
    USER_ASSIGN_ROLES = "user.assign_roles"
    USER_RESET_PASSWORD = "user.reset_password"
    USER_DEACTIVATE = "user.deactivate"
    
    # Alert Management
    ALERT_VIEW = "alert.view"
    ALERT_CREATE = "alert.create"
    ALERT_EDIT = "alert.edit"
    ALERT_DELETE = "alert.delete"
    ALERT_ASSIGN = "alert.assign"
    ALERT_RESOLVE = "alert.resolve"
    ALERT_ESCALATE = "alert.escalate"
    ALERT_EXPORT = "alert.export"
    ALERT_VIEW_ALL = "alert.view_all"
    
    # Log Management
    LOG_VIEW = "log.view"
    LOG_VIEW_ALL = "log.view_all"
    LOG_EXPORT = "log.export"
    LOG_DELETE = "log.delete"
    
    # Network Monitoring
    MONITORING_START = "monitoring.start"
    MONITORING_STOP = "monitoring.stop"
    MONITORING_VIEW = "monitoring.view"
    MONITORING_CONFIGURE = "monitoring.configure"
    
    # Threat Intelligence
    THREAT_INTEL_VIEW = "threat_intel.view"
    THREAT_INTEL_MANAGE = "threat_intel.manage"
    THREAT_INTEL_EXPORT = "threat_intel.export"
    
    # Blacklist Management
    BLACKLIST_VIEW = "blacklist.view"
    BLACKLIST_ADD = "blacklist.add"
    BLACKLIST_REMOVE = "blacklist.remove"
    BLACKLIST_MANAGE = "blacklist.manage"
    
    # Reporting
    REPORT_VIEW = "report.view"
    REPORT_CREATE = "report.create"
    REPORT_DELETE = "report.delete"
    REPORT_SCHEDULE = "report.schedule"
    REPORT_EXPORT = "report.export"
    
    # SIEM Integration
    SIEM_VIEW = "siem.view"
    SIEM_CONFIGURE = "siem.configure"
    SIEM_MANAGE = "siem.manage"
    SIEM_EXPORT = "siem.export"
    
    # Audit Logs
    AUDIT_VIEW = "audit.view"
    AUDIT_VIEW_ALL = "audit.view_all"
    AUDIT_EXPORT = "audit.export"
    
    # System Administration
    SYSTEM_VIEW = "system.view"
    SYSTEM_CONFIGURE = "system.configure"
    SYSTEM_MANAGE = "system.manage"
    SYSTEM_HEALTH = "system.health"


class Role(str, Enum):
    """Enterprise SOC roles with hierarchical permissions"""
    
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    SECURITY_ANALYST = "security_analyst"
    VIEWER = "viewer"


# Role-Permission Mapping
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.SUPER_ADMIN: {
        # Super Admin has ALL permissions
        Permission.ORG_VIEW,
        Permission.ORG_EDIT,
        Permission.ORG_DELETE,
        Permission.ORG_MANAGE_SETTINGS,
        Permission.ORG_MANAGE_USERS,
        Permission.ORG_INVITE_USERS,
        Permission.ORG_VIEW_STATS,
        Permission.USER_VIEW,
        Permission.USER_CREATE,
        Permission.USER_EDIT,
        Permission.USER_DELETE,
        Permission.USER_ASSIGN_ROLES,
        Permission.USER_RESET_PASSWORD,
        Permission.USER_DEACTIVATE,
        Permission.ALERT_VIEW,
        Permission.ALERT_CREATE,
        Permission.ALERT_EDIT,
        Permission.ALERT_DELETE,
        Permission.ALERT_ASSIGN,
        Permission.ALERT_RESOLVE,
        Permission.ALERT_ESCALATE,
        Permission.ALERT_EXPORT,
        Permission.ALERT_VIEW_ALL,
        Permission.LOG_VIEW,
        Permission.LOG_VIEW_ALL,
        Permission.LOG_EXPORT,
        Permission.LOG_DELETE,
        Permission.MONITORING_START,
        Permission.MONITORING_STOP,
        Permission.MONITORING_VIEW,
        Permission.MONITORING_CONFIGURE,
        Permission.THREAT_INTEL_VIEW,
        Permission.THREAT_INTEL_MANAGE,
        Permission.THREAT_INTEL_EXPORT,
        Permission.BLACKLIST_VIEW,
        Permission.BLACKLIST_ADD,
        Permission.BLACKLIST_REMOVE,
        Permission.BLACKLIST_MANAGE,
        Permission.REPORT_VIEW,
        Permission.REPORT_CREATE,
        Permission.REPORT_DELETE,
        Permission.REPORT_SCHEDULE,
        Permission.REPORT_EXPORT,
        Permission.SIEM_VIEW,
        Permission.SIEM_CONFIGURE,
        Permission.SIEM_MANAGE,
        Permission.SIEM_EXPORT,
        Permission.AUDIT_VIEW,
        Permission.AUDIT_VIEW_ALL,
        Permission.AUDIT_EXPORT,
        Permission.SYSTEM_VIEW,
        Permission.SYSTEM_CONFIGURE,
        Permission.SYSTEM_MANAGE,
        Permission.SYSTEM_HEALTH,
    },
    
    Role.ORG_ADMIN: {
        # Organization Admin permissions (within their org)
        Permission.ORG_VIEW,
        Permission.ORG_EDIT,
        Permission.ORG_MANAGE_SETTINGS,
        Permission.ORG_MANAGE_USERS,
        Permission.ORG_INVITE_USERS,
        Permission.ORG_VIEW_STATS,
        Permission.USER_VIEW,
        Permission.USER_CREATE,
        Permission.USER_EDIT,
        Permission.USER_ASSIGN_ROLES,
        Permission.USER_RESET_PASSWORD,
        Permission.USER_DEACTIVATE,
        Permission.ALERT_VIEW,
        Permission.ALERT_ASSIGN,
        Permission.ALERT_RESOLVE,
        Permission.ALERT_ESCALATE,
        Permission.ALERT_EXPORT,
        Permission.LOG_VIEW,
        Permission.LOG_EXPORT,
        Permission.MONITORING_START,
        Permission.MONITORING_STOP,
        Permission.MONITORING_VIEW,
        Permission.MONITORING_CONFIGURE,
        Permission.THREAT_INTEL_VIEW,
        Permission.THREAT_INTEL_MANAGE,
        Permission.BLACKLIST_VIEW,
        Permission.BLACKLIST_ADD,
        Permission.BLACKLIST_REMOVE,
        Permission.BLACKLIST_MANAGE,
        Permission.REPORT_VIEW,
        Permission.REPORT_CREATE,
        Permission.REPORT_SCHEDULE,
        Permission.REPORT_EXPORT,
        Permission.SIEM_VIEW,
        Permission.SIEM_CONFIGURE,
        Permission.SIEM_MANAGE,
        Permission.SIEM_EXPORT,
        Permission.AUDIT_VIEW,
        Permission.AUDIT_EXPORT,
    },
    
    Role.SECURITY_ANALYST: {
        # Security Analyst permissions (investigation focus)
        Permission.ORG_VIEW,
        Permission.ORG_VIEW_STATS,
        Permission.USER_VIEW,
        Permission.ALERT_VIEW,
        Permission.ALERT_ASSIGN,
        Permission.ALERT_RESOLVE,
        Permission.ALERT_EXPORT,
        Permission.LOG_VIEW,
        Permission.LOG_EXPORT,
        Permission.MONITORING_VIEW,
        Permission.THREAT_INTEL_VIEW,
        Permission.BLACKLIST_VIEW,
        Permission.REPORT_VIEW,
        Permission.REPORT_CREATE,
        Permission.REPORT_EXPORT,
        Permission.AUDIT_VIEW,
        Permission.AUDIT_EXPORT,
    },
    
    Role.VIEWER: {
        # Viewer permissions (read-only)
        Permission.ORG_VIEW,
        Permission.ORG_VIEW_STATS,
        Permission.ALERT_VIEW,
        Permission.LOG_VIEW,
        Permission.MONITORING_VIEW,
        Permission.THREAT_INTEL_VIEW,
        Permission.BLACKLIST_VIEW,
        Permission.REPORT_VIEW,
    },
}


class PermissionChecker:
    """
    Permission checker with audit logging support.
    
    This class provides methods to check user permissions and logs
    all permission checks for audit trail purposes.
    """
    
    def __init__(self, audit_logger=None):
        """
        Initialize permission checker.
        
        Args:
            audit_logger: Optional audit logger for permission checks
        """
        self.audit_logger = audit_logger
    
    def has_permission(
        self,
        user_role: Role,
        permission: Permission,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        resource_id: Optional[str] = None
    ) -> bool:
        """
        Check if user has a specific permission.
        
        Args:
            user_role: User's role
            permission: Permission to check
            user_id: User ID for audit logging
            org_id: Organization ID for audit logging
            resource_id: Resource ID being accessed
            
        Returns:
            True if user has permission, False otherwise
        """
        has_perm = permission in ROLE_PERMISSIONS.get(user_role, set())
        
        # Log permission check if audit logger is provided
        if self.audit_logger:
            self._log_permission_check(
                user_id=user_id,
                org_id=org_id,
                role=user_role.value,
                permission=permission.value,
                granted=has_perm,
                resource_id=resource_id
            )
        
        return has_perm
    
    def has_any_permission(
        self,
        user_role: Role,
        permissions: List[Permission],
        user_id: Optional[str] = None,
        org_id: Optional[str] = None
    ) -> bool:
        """
        Check if user has any of the specified permissions.
        
        Args:
            user_role: User's role
            permissions: List of permissions to check
            user_id: User ID for audit logging
            org_id: Organization ID for audit logging
            
        Returns:
            True if user has any of the permissions, False otherwise
        """
        user_permissions = ROLE_PERMISSIONS.get(user_role, set())
        has_perm = any(perm in user_permissions for perm in permissions)
        
        # Log permission check if audit logger is provided
        if self.audit_logger:
            self._log_permission_check(
                user_id=user_id,
                org_id=org_id,
                role=user_role.value,
                permission=f"any_of({[p.value for p in permissions]})",
                granted=has_perm
            )
        
        return has_perm
    
    def has_all_permissions(
        self,
        user_role: Role,
        permissions: List[Permission],
        user_id: Optional[str] = None,
        org_id: Optional[str] = None
    ) -> bool:
        """
        Check if user has all of the specified permissions.
        
        Args:
            user_role: User's role
            permissions: List of permissions to check
            user_id: User ID for audit logging
            org_id: Organization ID for audit logging
            
        Returns:
            True if user has all permissions, False otherwise
        """
        user_permissions = ROLE_PERMISSIONS.get(user_role, set())
        has_perm = all(perm in user_permissions for perm in permissions)
        
        # Log permission check if audit logger is provided
        if self.audit_logger:
            self._log_permission_check(
                user_id=user_id,
                org_id=org_id,
                role=user_role.value,
                permission=f"all_of({[p.value for p in permissions]})",
                granted=has_perm
            )
        
        return has_perm
    
    def get_user_permissions(self, user_role: Role) -> Set[Permission]:
        """
        Get all permissions for a given role.
        
        Args:
            user_role: User's role
            
        Returns:
            Set of permissions for the role
        """
        return ROLE_PERMISSIONS.get(user_role, set()).copy()
    
    def _log_permission_check(
        self,
        user_id: Optional[str],
        org_id: Optional[str],
        role: str,
        permission: str,
        granted: bool,
        resource_id: Optional[str] = None
    ):
        """
        Log permission check for audit trail.
        
        Args:
            user_id: User ID
            org_id: Organization ID
            role: User role
            permission: Permission checked
            granted: Whether permission was granted
            resource_id: Resource ID being accessed
        """
        if self.audit_logger:
            try:
                self.audit_logger.log(
                    action="permission_check",
                    user_id=user_id,
                    org_id=org_id,
                    details={
                        "role": role,
                        "permission": permission,
                        "granted": granted,
                        "resource_id": resource_id,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                )
            except Exception as e:
                logger.error(f"Failed to log permission check: {e}")


def require_permission(permission: Permission):
    """
    Decorator to require a specific permission for a function.
    
    Usage:
        @require_permission(Permission.ALERT_VIEW)
        async def get_alerts(user_role: Role, ...):
            ...
    
    Args:
        permission: Required permission
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user_role from kwargs or args
            user_role = kwargs.get('user_role')
            if not user_role and len(args) > 0:
                user_role = args[0]  # Assume first arg is user_role
            
            if not user_role:
                raise PermissionError("User role not provided")
            
            checker = PermissionChecker()
            if not checker.has_permission(user_role, permission):
                raise PermissionError(
                    f"Permission '{permission.value}' required. "
                    f"User role: {user_role.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_any_permission(*permissions: Permission):
    """
    Decorator to require any of the specified permissions.
    
    Usage:
        @require_any_permission(Permission.ALERT_VIEW, Permission.ALERT_VIEW_ALL)
        async def get_alerts(user_role: Role, ...):
            ...
    
    Args:
        *permissions: List of permissions (any one is sufficient)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_role = kwargs.get('user_role')
            if not user_role and len(args) > 0:
                user_role = args[0]
            
            if not user_role:
                raise PermissionError("User role not provided")
            
            checker = PermissionChecker()
            if not checker.has_any_permission(user_role, list(permissions)):
                raise PermissionError(
                    f"One of permissions {[p.value for p in permissions]} required. "
                    f"User role: {user_role.value}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def get_role_hierarchy() -> Dict[Role, int]:
    """
    Get role hierarchy levels (higher number = more privileges).
    
    Returns:
        Dictionary mapping roles to hierarchy levels
    """
    return {
        Role.VIEWER: 1,
        Role.SECURITY_ANALYST: 2,
        Role.ORG_ADMIN: 3,
        Role.SUPER_ADMIN: 4,
    }


def can_elevate_role(current_role: Role, target_role: Role) -> bool:
    """
    Check if current role can elevate to target role.
    
    Args:
        current_role: Current user role
        target_role: Target role to elevate to
        
    Returns:
        True if elevation is allowed, False otherwise
    """
    hierarchy = get_role_hierarchy()
    return hierarchy.get(current_role, 0) > hierarchy.get(target_role, 0)
