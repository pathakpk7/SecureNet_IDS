import React from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissionsMap';

/**
 * RoleGuard Component
 * 
 * Conditionally renders children based on user permissions.
 */
const RoleGuard = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const hasRequiredPermission = hasPermission(user, permission);

  if (!hasRequiredPermission) {
    return fallback;
  }

  return <>{children}</>;
};

export const AnyPermission = ({ permissions, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const hasAny = permissions.some(perm => hasPermission(user, perm));

  if (!hasAny) {
    return fallback;
  }

  return <>{children}</>;
};

export const AllPermissions = ({ permissions, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const hasAll = permissions.every(perm => hasPermission(user, perm));

  if (!hasAll) {
    return fallback;
  }

  return <>{children}</>;
};

export const RoleWrapper = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const role = user.role || user.user_metadata?.role || 'user';
  if (!allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleGuard;
