export const getResponseAction = (alert) => {
  const level = alert?.threat?.level;

  if (level === "CRITICAL") return "BLOCK_IP";
  if (level === "HIGH") return "RATE_LIMIT";
  if (level === "MEDIUM") return "MONITOR";

  return "IGNORE";
};

export const getIncidentSeverity = (alert) => {
  const level = alert?.threat?.level;
  const prediction = alert?.prediction?.level;

  if (level === "CRITICAL" || prediction === "CRITICAL") return "CRITICAL";
  if (level === "HIGH" || prediction === "HIGH") return "HIGH";
  if (level === "MEDIUM" || prediction === "MEDIUM") return "MEDIUM";
  
  return "LOW";
};

export const getRecommendedActions = (alert) => {
  const action = getResponseAction(alert);
  const severity = getIncidentSeverity(alert);

  const actions = {
    BLOCK_IP: {
      description: "Block malicious IP address immediately",
      priority: "URGENT",
      steps: ["Add to firewall blacklist", "Notify security team", "Log incident"]
    },
    RATE_LIMIT: {
      description: "Apply rate limiting to suspicious traffic",
      priority: "HIGH",
      steps: ["Configure rate limiter", "Monitor traffic patterns", "Set alerts"]
    },
    MONITOR: {
      description: "Monitor for suspicious activity",
      priority: "MEDIUM",
      steps: ["Increase logging", "Set alerts", "Review patterns"]
    },
    IGNORE: {
      description: "No immediate action required",
      priority: "LOW",
      steps: ["Continue monitoring", "Log for analysis"]
    }
  };

  return actions[action];
};
