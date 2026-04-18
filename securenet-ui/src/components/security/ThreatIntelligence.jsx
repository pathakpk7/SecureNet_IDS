import React from 'react';
import Card from '../ui/Card';

export default function ThreatIntelligence({ alerts }) {
  const topThreat = alerts[0];

  return (
    <Card className="intel-card">
      <h3>Threat Intelligence</h3>

      <p><b>Top Threat:</b> {topThreat?.message || 'No active threats'}</p>
      <p><b>Risk Level:</b> {topThreat?.threat?.level || 'LOW'}</p>
      <p><b>Prediction:</b> {topThreat?.prediction?.message || 'No prediction available'}</p>

      <p style={{ fontSize: "12px", opacity: 0.7 }}>
        Reason:
        {topThreat?.threat?.level === 'CRITICAL' ? ' Immediate threat detected - requires action' :
         topThreat?.threat?.level === 'HIGH' ? ' High frequency + suspicious behavior' :
         topThreat?.threat?.level === 'MEDIUM' ? ' Anomalous pattern detected' :
         ' Normal activity monitoring'}
      </p>
    </Card>
  );
}
