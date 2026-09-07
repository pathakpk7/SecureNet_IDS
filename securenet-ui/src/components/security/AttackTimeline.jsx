import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';

export default function AttackTimeline({ alerts = [] }) {
  const navigate = useNavigate();
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const latestAlert = safeAlerts[0] || null;
  const alertCount = safeAlerts.length;

  return (
    <Card 
      className="attack-timeline db-card-clickable"
      onClick={() => navigate('/alerts')}
      title="Click to view full attack timeline on Alerts page"
    >
      <div className="db-card-header">
        <h3>Live Attack Timeline</h3>
        <span className="db-card-link-badge">{alertCount} Events Logged</span>
      </div>

      <div className="db-timeline-body">
        {latestAlert ? (
          <div className="db-timeline-latest">
            <div className="db-timeline-main">
              <span className="db-timeline-time">
                [{new Date(latestAlert.created_at || Date.now()).toLocaleTimeString()}]
              </span>
              <span className="db-timeline-msg">
                {latestAlert.message || latestAlert.threatType || 'Network Anomaly Detected'}
              </span>
            </div>
            <span className={`badge badge-${(latestAlert.threat?.level || latestAlert.severity || 'LOW').toLowerCase()}`}>
              {latestAlert.threat?.level || latestAlert.severity || 'LOW'}
            </span>
          </div>
        ) : (
          <div className="db-timeline-empty">
            <div className="db-status-dot active"></div>
            <span>No critical attack vectors active. Monitoring socket traffic...</span>
          </div>
        )}

        <div className="db-timeline-cta">
          <button 
            className="db-timeline-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/alerts');
            }}
          >
            Explore Full Timeline →
          </button>
        </div>
      </div>
    </Card>
  );
}
