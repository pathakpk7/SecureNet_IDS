const activityMap = {};

export const analyzeThreatPattern = (alert) => {
  const source = alert.source_ip || alert.sourceIP || "unknown";

  if (!activityMap[source]) {
    activityMap[source] = [];
  }

  // Add timestamp
  activityMap[source].push(Date.now());

  // Keep last 10 entries only
  activityMap[source] = activityMap[source].slice(-10);

  const count = activityMap[source].length;

  // Prediction logic
  if (count >= 8) {
    return { level: "CRITICAL", message: "Attack escalation detected" };
  }

  if (count >= 5) {
    return { level: "HIGH", message: "Suspicious activity increasing" };
  }

  if (count >= 3) {
    return { level: "MEDIUM", message: "Unusual repeated activity" };
  }

  return { level: "LOW", message: "Normal activity" };
};
