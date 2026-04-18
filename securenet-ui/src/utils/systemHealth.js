export const getSystemHealth = (alerts) => {
  const high = alerts.filter(a => a.threat?.level === "HIGH").length;
  const critical = alerts.filter(a => a.threat?.level === "CRITICAL").length;

  if (critical > 5) return { status: "CRITICAL", color: "#ff0000" };
  if (critical > 2) return { status: "WARNING", color: "#ffaa00" };
  if (high > 10) return { status: "WARNING", color: "#ffaa00" };
  if (high > 5) return { status: "CAUTION", color: "#ffa500" };

  return { status: "STABLE", color: "#00ff00" };
};

export const getHealthScore = (alerts) => {
  const total = alerts.length;
  const critical = alerts.filter(a => a.threat?.level === "CRITICAL").length;
  const high = alerts.filter(a => a.threat?.level === "HIGH").length;
  
  let score = 100;
  score -= (critical * 20);
  score -= (high * 10);
  
  return Math.max(0, Math.min(100, score));
};
