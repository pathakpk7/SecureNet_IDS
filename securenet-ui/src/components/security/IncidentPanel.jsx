import React from 'react';
import Card from '../ui/Card';
import { getResponseAction, getRecommendedActions } from '../../services/incidentEngine';

export default function IncidentPanel({ alert }) {
  const action = getResponseAction(alert);
  const recommendation = getRecommendedActions(alert);

  return (
    <Card className="incident-card">
      <h3>Incident Response</h3>
      
      <div className="incident-action">
        <p><b>Recommended Action:</b> {action}</p>
        <p><b>Priority:</b> {recommendation.priority}</p>
        <p><b>Description:</b> {recommendation.description}</p>
      </div>

      <div className="incident-steps">
        <h4>Recommended Steps:</h4>
        <ul>
          {recommendation.steps.map((step, index) => (
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
