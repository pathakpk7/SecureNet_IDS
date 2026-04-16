/**
 * Permission Utility Functions
 * Helper functions to check user permissions in the multi-tenant RBAC system
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with permissions
 * @param {string} permission - Permission key to check
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (user, permission) => {
  return user?.permissions?.[permission] === true;
};

/**
 * Permission definitions for the system
 * Centralized permission constants for consistency
 */
export const PERMISSIONS = {
  // Organization Management
  CAN_MANAGE_USERS: 'canManageUsers',
  CAN_MANAGE_ORG_SETTINGS: 'canManageOrgSettings',
  CAN_INVITE_USERS: 'canInviteUsers',
  
  // Security Operations
  CAN_VIEW_LOGS: 'canViewLogs',
  CAN_BLOCK_IP: 'canBlockIP',
  CAN_RUN_SIMULATION: 'canRunSimulation',
  
  // Analytics and Reporting
  CAN_VIEW_ANALYTICS: 'canViewAnalytics',
  CAN_GENERATE_REPORTS: 'canGenerateReports',
  CAN_EXPORT_DATA: 'canExportData',
  
  // User Management
  CAN_VIEW_USERS: 'canViewUsers',
  CAN_RESET_PASSWORDS: 'canResetPasswords',
  CAN_DEACTIVATE_USERS: 'canDeactivateUsers'
};

/**
 * Default permission sets for different roles
 */
export const DEFAULT_PERMISSIONS = {
  admin: {
    [PERMISSIONS.CAN_MANAGE_USERS]: true,
    [PERMISSIONS.CAN_MANAGE_ORG_SETTINGS]: true,
    [PERMISSIONS.CAN_INVITE_USERS]: true,
    [PERMISSIONS.CAN_VIEW_LOGS]: true,
    [PERMISSIONS.CAN_BLOCK_IP]: true,
    [PERMISSIONS.CAN_RUN_SIMULATION]: true,
    [PERMISSIONS.CAN_VIEW_ANALYTICS]: true,
    [PERMISSIONS.CAN_GENERATE_REPORTS]: true,
    [PERMISSIONS.CAN_EXPORT_DATA]: true,
    [PERMISSIONS.CAN_VIEW_USERS]: true,
    [PERMISSIONS.CAN_RESET_PASSWORDS]: true,
    [PERMISSIONS.CAN_DEACTIVATE_USERS]: true
  },
  user: {
    [PERMISSIONS.CAN_VIEW_LOGS]: true,
    [PERMISSIONS.CAN_VIEW_ANALYTICS]: true,
    [PERMISSIONS.CAN_GENERATE_REPORTS]: true,
    [PERMISSIONS.CAN_EXPORT_DATA]: true,
    [PERMISSIONS.CAN_VIEW_USERS]: true,
    [PERMISSIONS.CAN_RESET_PASSWORDS]: true
  }
};

/**
 * Get user permissions with defaults for missing permissions
 * @param {Object} user - User object
 * @returns {Object} - User permissions with defaults applied
 */
export const getUserPermissions = (user) => {
  const role = user?.role || 'user';
  const userPermissions = user?.permissions || {};
  const defaultPermissions = DEFAULT_PERMISSIONS[role] || {};
  
  return {
    ...defaultPermissions,
    ...userPermissions
  };
};
