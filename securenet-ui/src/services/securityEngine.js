import { getThreatScore } from "../utils/threatScoring";
import { analyzeThreatPattern } from "../utils/predictiveEngine";

export const processAlert = (alert) => {
  const threat = getThreatScore(alert);
  const prediction = analyzeThreatPattern(alert);

  return {
    ...alert,
    threat,
    prediction
  };
};
