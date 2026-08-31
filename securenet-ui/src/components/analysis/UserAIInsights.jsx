import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import '../../styles/pages/analysis.css';

const UserAIInsights = () => {
  const [personalInsights, setPersonalInsights] = useState({
    riskScore: 28,
    threatsBlocked: 12,
    suspiciousActivity: 3,
    securityRecommendations: 5
  });

  const [threatTimeline, setThreatTimeline] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [0, 1, 2, 1, 3, 1]
  });

  const [personalRecommendations, setPersonalRecommendations] = useState([
    { id: 1, type: 'Security', priority: 'Medium', description: 'Enable two-factor authentication' },
    { id: 2, type: 'Privacy', priority: 'Low', description: 'Review app permissions' },
    { id: 3, type: 'Password', priority: 'High', description: 'Update weak passwords detected' },
    { id: 4, type: 'Network', priority: 'Medium', description: 'Review connected devices' }
  ]);

  // Simulate personal insights updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalInsights(prev => ({
        riskScore: Math.max(0, Math.min(100, prev.riskScore + (Math.random() - 0.5) * 5)),
        threatsBlocked: prev.threatsBlocked + (Math.random() > 0.8 ? 1 : 0),
        suspiciousActivity: Math.max(0, prev.suspiciousActivity + Math.floor(Math.random() * 2) - 1),
        securityRecommendations: Math.max(0, prev.securityRecommendations + Math.floor(Math.random() * 2) - 1)
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-ai-insights-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal AI Insights</h1>
        <p className="page-subtitle">AI-powered security analysis for your account</p>
      </div>

      <div className="personal-metrics-grid">
        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{personalInsights.riskScore}</div>
            <div className="metric-label">Risk Score</div>
            <div className="metric-trend positive">Low risk</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{personalInsights.threatsBlocked}</div>
            <div className="metric-label">Threats Blocked</div>
            <div className="metric-trend positive">This month</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{personalInsights.suspiciousActivity}</div>
            <div className="metric-label">Suspicious Events</div>
            <div className="metric-trend negative">Needs review</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{personalInsights.securityRecommendations}</div>
            <div className="metric-label">Recommendations</div>
            <div className="metric-trend">Action items</div>
          </div>
        </Card>
      </div>

      <div className="insights-grid">
        <Card className="insights-card">
          <h3 className="card-title">Your Threat Timeline</h3>
          <div className="chart-container">
            <LineChart data={threatTimeline} />
          </div>
        </Card>

        <Card className="insights-card">
          <h3 className="card-title">Security Score Breakdown</h3>
          <div className="score-breakdown">
            <div className="score-item">
              <span className="score-label">Password Strength:</span>
              <span className="score-value high">85%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Login Security:</span>
              <span className="score-value medium">70%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Device Safety:</span>
              <span className="score-value high">92%</span>
            </div>
            <div className="score-item">
              <span className="score-label">Network Security:</span>
              <span className="score-value low">45%</span>
            </div>
          </div>
        </Card>

        <Card className="insights-card full-width">
          <h3 className="card-title">Personal Security Recommendations</h3>
          <div className="recommendations-list">
            {personalRecommendations.map(rec => (
              <div key={rec.id} className={`recommendation-item ${rec.priority.toLowerCase()}`}>
                <div className="rec-header">
                  <span className="rec-type">{rec.type}</span>
                  <span className={`rec-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                </div>
                <div className="rec-description">{rec.description}</div>
                <div className="rec-actions">
                  <button className="btn btn-sm btn-primary">Apply Now</button>
                  <button className="btn btn-sm btn-outline">Learn More</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAIInsights;
