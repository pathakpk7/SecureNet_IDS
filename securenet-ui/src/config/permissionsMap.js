export const ROLE_PERMISSIONS = {
  admin: ["ALL"],
  user: ["VIEW_DASHBOARD", "VIEW_ALERTS", "VIEW_LOGS", "VIEW_SETTINGS"]
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return ROLE_PERMISSIONS[user.role]?.includes(permission);
};
