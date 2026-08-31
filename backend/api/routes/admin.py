"""
SecureNet IDS - Organization API Routes

This module provides REST API endpoints for organization management
including CRUD operations, settings, and statistics.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from ..rbac.permissions import Role, Permission, PermissionChecker
from ..database.repositories.organization_repository import OrganizationRepository
from ..database.repositories.user_repository import UserRepository
from ..database.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/organizations", tags=["organizations"])


# Pydantic models
class OrganizationCreate(BaseModel):
    """Model for creating an organization."""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    plan: str = Field(default="free", pattern="^(free|pro|enterprise)$")
    settings: Optional[dict] = None


class OrganizationUpdate(BaseModel):
    """Model for updating an organization."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    plan: Optional[str] = Field(None, pattern="^(free|pro|enterprise)$")
    settings: Optional[dict] = None
    is_active: Optional[bool] = None


class OrganizationResponse(BaseModel):
    """Model for organization response."""
    id: str
    name: str
    slug: str
    description: Optional[str]
    owner_id: str
    plan: str
    settings: dict
    is_active: bool
    is_suspended: bool
    created_at: datetime
    updated_at: datetime


class OrganizationStatsResponse(BaseModel):
    """Model for organization statistics."""
    total_users: int
    total_alerts: int
    active_alerts: int
    critical_alerts: int
    total_reports: int
    last_activity: Optional[datetime]


# Dependency injection
def get_org_repository(supabase_client):
    """Get organization repository instance."""
    return OrganizationRepository(supabase_client)


def get_user_repository(supabase_client):
    """Get user repository instance."""
    return UserRepository(supabase_client)


def get_audit_repository(supabase_client):
    """Get audit repository instance."""
    return AuditRepository(supabase_client)


# API Endpoints
@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Create a new organization.
    
    Requires: ORG_CREATE permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ORG_EDIT, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create organization"
        )
    
    try:
        # Create organization
        org = await org_repo.create_organization(
            name=org_data.name,
            slug=org_data.slug,
            owner_id=user_id,
            description=org_data.description,
            plan=org_data.plan,
            settings=org_data.settings
        )
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create organization"
            )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org.get("id"),
            action="organization_created",
            resource_type="organization",
            resource_id=org.get("id"),
            details={"name": org_data.name, "slug": org_data.slug}
        )
        
        return OrganizationResponse(**org)
        
    except Exception as e:
        logger.error(f"Error creating organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(
    user_id: str,
    user_role: Role,
    org_id: Optional[str] = None,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    List organizations.
    
    Super admins can see all organizations, regular users see their own.
    Requires: ORG_VIEW permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ORG_VIEW, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view organizations"
        )
    
    try:
        if user_role == Role.SUPER_ADMIN:
            # Super admins see all organizations
            orgs = await org_repo.get_all(limit=100)
        else:
            # Regular users see their organization
            if org_id:
                orgs = [await org_repo.get_by_id(org_id)]
            else:
                orgs = await org_repo.get_by_owner(user_id)
        
        return [OrganizationResponse(**org) for org in orgs if org]
        
    except Exception as e:
        logger.error(f"Error listing organizations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: str,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Get organization by ID.
    
    Requires: ORG_VIEW permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ORG_VIEW, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view organization"
        )
    
    try:
        org = await org_repo.get_by_id(org_id)
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        return OrganizationResponse(**org)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: str,
    org_data: OrganizationUpdate,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Update organization.
    
    Requires: ORG_EDIT permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ORG_EDIT, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update organization"
        )
    
    try:
        # Build update data
        update_data = org_data.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update data provided"
            )
        
        org = await org_repo.update(org_id, update_data)
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org_id,
            action="organization_updated",
            resource_type="organization",
            resource_id=org_id,
            details=update_data
        )
        
        return OrganizationResponse(**org)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/{org_id}/stats", response_model=OrganizationStatsResponse)
async def get_organization_stats(
    org_id: str,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Get organization statistics.
    
    Requires: ORG_VIEW_STATS permission
    """
    # Permission check
    checker = PermissionChecker(audit_repo)
    if not checker.has_permission(user_role, Permission.ORG_VIEW_STATS, user_id=user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view organization statistics"
        )
    
    try:
        stats = await org_repo.get_statistics(org_id)
        
        return OrganizationStatsResponse(
            total_users=stats.get("total_users", 0),
            total_alerts=stats.get("total_alerts", 0),
            active_alerts=stats.get("active_alerts", 0),
            critical_alerts=stats.get("critical_alerts", 0),
            total_reports=stats.get("total_reports", 0),
            last_activity=stats.get("last_activity")
        )
        
    except Exception as e:
        logger.error(f"Error getting organization stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/{org_id}/suspend")
async def suspend_organization(
    org_id: str,
    reason: str,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Suspend an organization.
    
    Requires: SUPER_ADMIN role
    """
    if user_role != Role.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can suspend organizations"
        )
    
    try:
        org = await org_repo.suspend_organization(org_id, reason)
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org_id,
            action="organization_suspended",
            resource_type="organization",
            resource_id=org_id,
            details={"reason": reason}
        )
        
        return {"success": True, "message": "Organization suspended"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suspending organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/{org_id}/activate")
async def activate_organization(
    org_id: str,
    user_id: str,
    user_role: Role,
    org_repo: OrganizationRepository = Depends(get_org_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """
    Activate a suspended organization.
    
    Requires: SUPER_ADMIN role
    """
    if user_role != Role.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can activate organizations"
        )
    
    try:
        org = await org_repo.activate_organization(org_id)
        
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        
        # Log audit event
        await audit_repo.log_action(
            user_id=user_id,
            org_id=org_id,
            action="organization_activated",
            resource_type="organization",
            resource_id=org_id
        )
        
        return {"success": True, "message": "Organization activated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
