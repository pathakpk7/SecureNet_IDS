export const getThreatScore = (alert) => {
  let score = 0;

  // Base on keywords
  const message = alert.message?.toLowerCase() || "";

  if (message.includes("ddos")) score += 40;
  if (message.includes("sql")) score += 35;
  if (message.includes("brute")) score += 30;
  if (message.includes("malware")) score += 50;
  if (message.includes("phishing")) score += 25;

  // Frequency boost
  if (alert.count > 10) score += 20;
  if (alert.count > 50) score += 30;

  // Severity mapping
  if (score >= 70) return { level: "CRITICAL", color: "#ff0000" };
  if (score >= 50) return { level: "HIGH", color: "#ff3366" };
  if (score >= 30) return { level: "MEDIUM", color: "#ffaa00" };

  return { level: "LOW", color: "#00ffcc" };
};
