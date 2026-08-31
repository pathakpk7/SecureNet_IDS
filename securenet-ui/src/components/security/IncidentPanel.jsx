import React from 'react';
import Card from '../ui/Card';
import { getResponseAction, getRecommendedActions } from '../../services/incidentEngine';

export default function IncidentPanel({ alert }) {
  const safeAlert = alert || {
    message: "Network traffic monitoring active",
    threat: { level: "LOW" },
    prediction: { level: "LOW" }
  };
  
  const action = getResponseAction(safeAlert) || "MONITOR";
  const recommendation = getRecommendedActions(safeAlert) || {
    description: "Continue real-time traffic monitoring and logging",
    priority: "NORMAL",
    steps: ["Inspect flow telemetry", "Verify ML anomaly indicators", "Check threat intelligence reputation"]
  };

  return (
    <Card className="incident-card">
      <h3>Incident Response</h3>
      
      <div className="incident-action">
        <p><b>Recommended Action:</b> <span className="text-cyan-400">{action}</span></p>
        <p><b>Priority:</b> <span className="text-yellow-400">{recommendation.priority || 'NORMAL'}</span></p>
        <p><b>Description:</b> {recommendation.description || 'System state normal'}</p>
      </div>

      <div className="incident-steps">
        <h4>Recommended Steps:</h4>
        <ul>
          {(recommendation.steps || []).map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="incident-actions">
        <button className="btn btn-primary btn-sm">Execute Action</button>
        <button className="btn btn-outline btn-sm">Schedule for Later</button>
        <button className="btn btn-outline btn-sm">View Details</button>
      </div>
    </Card>
  );
}
