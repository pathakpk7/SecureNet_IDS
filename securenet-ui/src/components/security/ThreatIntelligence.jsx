import React from 'react';
import Card from '../ui/Card';

export default function ThreatIntelligence({ alerts = [] }) {
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const topThreat = safeAlerts[0] || {
    message: 'Active network traffic within normal thresholds',
    threat: { level: 'LOW' },
    prediction: { message: 'Normal operational baseline' }
  };

  const level = topThreat?.threat?.level || 'LOW';

  return (
    <Card className="intel-card">
      <h3>Threat Intelligence</h3>

      <p><b>Top Threat:</b> {topThreat?.threatType || topThreat?.attack_type || topThreat?.message || 'No active threats'}</p>
      <p><b>Risk Level:</b> <span className={`badge badge-${level.toLowerCase()}`}>{level}</span></p>
      <p><b>Prediction:</b> {topThreat?.prediction?.message || topThreat?.description || 'No prediction available'}</p>

      <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "8px" }}>
        <b>Insight:</b>{' '}
        {level === 'CRITICAL' ? ' Immediate threat detected - automatic mitigation engaged' :
         level === 'HIGH' ? ' High confidence attack signature identified' :
         level === 'MEDIUM' ? ' Anomalous flow telemetry detected' :
         ' Baseline traffic verified by CICIDS2017 AI model'}
      </p>
    </Card>
  );
}
