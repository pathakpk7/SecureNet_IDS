import React from 'react';
import Card from '../ui/Card';

export default function AttackTimeline({ alerts }) {
  return (
    <Card className="attack-timeline">
      <h3>Attack Timeline</h3>
      <div className="timeline-events">
        {alerts.map(alert => (
          <div key={alert.id} className="timeline-event">
            <div className="timeline-time">
              [{new Date(alert.created_at || Date.now()).toLocaleTimeString()}]
            </div>
            <div className="timeline-message">
              {alert.message || alert.threatType}
            </div>
            <div className="timeline-severity">
              {alert.threat?.level || alert.severity}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
