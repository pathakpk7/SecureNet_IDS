export const NAV_ITEMS = [
  {
    group: "Monitoring",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
      { name: "Alerts", path: "/alerts", icon: "warning" },
      { name: "Logs", path: "/logs", icon: "description" }
    ]
  },
  {
    group: "Analysis",
    items: [
      { name: "Attack Analysis", path: "/attack-analysis", icon: "security" },
      { name: "Network Monitor", path: "/network-monitor", icon: "network" },
      { name: "AI Insights", path: "/ai-insights", icon: "psychology" },
      { name: "Reports", path: "/reports", icon: "assessment" }
    ]
  },
  {
    group: "Management",
    items: [
      { name: "Settings", path: "/settings", icon: "settings" },
      { name: "Notifications", path: "/notifications", icon: "notifications" }
    ]
  },
  {
    group: "Admin",
    items: [
      { name: "Admin Panel", path: "/admin-panel", icon: "admin", adminOnly: true },
      { name: "Enhanced Admin", path: "/enhanced-admin", icon: "admin", adminOnly: true },
      { name: "Audit Logs", path: "/audit-logs", icon: "description", adminOnly: true },
      { name: "SIEM Export", path: "/siem-export", icon: "integration", adminOnly: true }
    ]
  },
  {
    group: "User",
    items: [
      { name: "Profile", path: "/profile", icon: "person" }
    ]
  }
];

export const getNavItemsByRole = (role) => {
  return NAV_ITEMS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.adminOnly || role === 'admin')
  })).filter(group => group.items.length > 0);
};
