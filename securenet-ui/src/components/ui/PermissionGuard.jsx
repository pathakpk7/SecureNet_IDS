import React from 'react';
import { hasPermission } from '../../utils/permissions';

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
const PermissionGuard = ({ children, permission, fallback = null }) => {
  if (hasPermission(children, permission)) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return null;
};

export default PermissionGuard;
