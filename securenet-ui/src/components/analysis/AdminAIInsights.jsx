import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import '../../styles/pages/analysis.css';

const AdminAIInsights = () => {
  const [aiMetrics, setAiMetrics] = useState({
    threatsPredicted: 1247,
    accuracy: 94.7,
    falsePositives: 23,
    responseTime: 1.2
  });

  const [threatTrends, setThreatTrends] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [45, 52, 38, 67, 59, 41, 35]
  });

  const [aiRecommendations, setAiRecommendations] = useState([
    { id: 1, type: 'Security', priority: 'High', description: 'Update firewall rules for DDoS protection' },
    { id: 2, type: 'Performance', priority: 'Medium', description: 'Optimize AI model training schedule' },
    { id: 3, type: 'Compliance', priority: 'Low', description: 'Review access logs for audit trail' },
    { id: 4, type: 'Security', priority: 'Critical', description: 'Investigate unusual traffic patterns from 185.220.101.182' }
  ]);

  // Simulate real-time AI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAiMetrics(prev => ({
        threatsPredicted: prev.threatsPredicted + Math.floor(Math.random() * 3),
        accuracy: Math.max(85, Math.min(99, prev.accuracy + (Math.random() - 0.5) * 0.5)),
        falsePositives: Math.max(0, prev.falsePositives + Math.floor(Math.random() * 2) - 1),
        responseTime: Math.max(0.5, Math.min(3, prev.responseTime + (Math.random() - 0.5) * 0.2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-insights-page fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Security Insights</h1>
        <p className="page-subtitle">Machine learning-powered threat analysis and predictions</p>
      </div>

      <div className="ai-metrics-grid">
        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">
              <AnimatedCounter value={aiMetrics.threatsPredicted} />
            </div>
            <div className="metric-label">Threats Predicted</div>
            <div className="metric-trend positive">+12% this week</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{aiMetrics.accuracy}%</div>
            <div className="metric-label">AI Accuracy</div>
            <div className="metric-trend positive">+2.3% improvement</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{aiMetrics.falsePositives}</div>
            <div className="metric-label">False Positives</div>
            <div className="metric-trend negative">+5 this month</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{aiMetrics.responseTime}s</div>
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-trend positive">-0.3s faster</div>
          </div>
        </Card>
      </div>

      <div className="insights-grid">
        <Card className="insights-card">
          <h3 className="card-title">Threat Prediction Trends</h3>
          <div className="chart-container">
            <LineChart data={threatTrends} />
          </div>
        </Card>

        <Card className="insights-card">
          <h3 className="card-title">AI Model Performance</h3>
          <div className="model-stats">
            <div className="stat-row">
              <span>Model Version:</span>
              <span>v3.2.1</span>
            </div>
            <div className="stat-row">
              <span>Training Data:</span>
              <span>2.4M events</span>
            </div>
            <div className="stat-row">
              <span>Last Updated:</span>
              <span>2 hours ago</span>
            </div>
            <div className="stat-row">
              <span>Confidence Score:</span>
              <span>96.2%</span>
            </div>
          </div>
        </Card>

        <Card className="insights-card full-width">
          <h3 className="card-title">AI Recommendations</h3>
          <div className="recommendations-list">
            {aiRecommendations.map(rec => (
              <div key={rec.id} className={`recommendation-item ${rec.priority.toLowerCase()}`}>
                <div className="rec-header">
                  <span className="rec-type">{rec.type}</span>
                  <span className={`rec-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                </div>
                <div className="rec-description">{rec.description}</div>
                <div className="rec-actions">
                  <button className="btn btn-sm btn-primary">Apply</button>
                  <button className="btn btn-sm btn-outline">Review</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAIInsights;
