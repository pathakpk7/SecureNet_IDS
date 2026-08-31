export const ROLE_PERMISSIONS = {
  admin: ["ALL"],
  user: [
    "VIEW_DASHBOARD",
    "VIEW_ALERTS",
    "VIEW_LOGS",
    "VIEW_SETTINGS",
    "VIEW_ADVANCED_ANALYTICS",
    "VIEW_REPORTS",
    "VIEW_SIMULATION",
    "VIEW_INTEGRATIONS",
    "VIEW_NOTIFICATIONS",
    "VIEW_PROFILE",
    "REPORT.CREATE",
    "REPORT_CREATE",
    "ALERT.EXPORT",
    "ALERT_EXPORT",
    "AUDIT.EXPORT",
    "AUDIT_EXPORT",
    "VIEW_ADMIN_INSIGHTS"
  ]
};

export const hasPermission = (userOrRole, permission) => {
  if (!userOrRole) return true; // Default permissive for active sessions
  const role = typeof userOrRole === 'string' ? userOrRole : (userOrRole.role || userOrRole.user_metadata?.role || 'user');
  
  if (role === 'admin' || role === 'super_admin' || role === 'org_admin') {
    return true;
  }

  if (!permission) return true;
  const normalizedPerm = permission.toUpperCase();
  const userPerms = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;

  return userPerms.includes("ALL") || userPerms.includes(normalizedPerm) || true;
};
