import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/Charts/LineChart';
import PieChart from '../../components/Charts/PieChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import '../../styles/pages/ai.css';

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
        <p className="page-subtitle">Machine learning-powered threat analysis, real-time predictions, and autonomous recommendations</p>
      </div>

      {/* Row 1: 4 KPI CARDS IN ONE ROW */}
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
            <div className="metric-value">
              {typeof aiMetrics.accuracy === 'number' ? aiMetrics.accuracy.toFixed(1) : aiMetrics.accuracy}%
            </div>
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
            <div className="metric-value">
              {typeof aiMetrics.responseTime === 'number' ? aiMetrics.responseTime.toFixed(2) : aiMetrics.responseTime}s
            </div>
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-trend positive">-0.3s faster</div>
          </div>
        </Card>
      </div>

      {/* Row 2: THREAT PREDICTION TRENDS CHART */}
      <Card className="insights-card" style={{ marginBottom: '24px' }}>
        <div className="aa-card-header">
          <h3>Threat Prediction Trends</h3>
          <span className="aa-badge">7-DAY FORECAST</span>
        </div>
        <div className="chart-container" style={{ height: '260px', position: 'relative' }}>
          <LineChart data={threatTrends} height="100%" />
        </div>
      </Card>

      {/* Row 3: AI MODEL PERFORMANCE & AI RECOMMENDATIONS IN ONE ROW */}
      <div className="ai-models-recs-row">
        <Card className="insights-card">
          <div className="aa-card-header">
            <h3>AI Model Performance</h3>
            <span className="aa-badge">v3.2.1 ENGINE</span>
          </div>
          <div className="model-stats">
            <div className="stat-row">
              <span>Model Version:</span>
              <span className="font-mono text-cyan font-bold">v3.2.1-RandomForest</span>
            </div>
            <div className="stat-row">
              <span>Training Data:</span>
              <span className="text-gray-200">2.4M CICIDS2017 Events</span>
            </div>
            <div className="stat-row">
              <span>Last Updated:</span>
              <span className="text-gray-300">2 hours ago</span>
            </div>
            <div className="stat-row">
              <span>Confidence Score:</span>
              <span className="text-emerald font-bold">96.2%</span>
            </div>
          </div>
        </Card>

        <Card className="insights-card">
          <div className="aa-card-header">
            <h3>AI Recommendations</h3>
            <span className="aa-badge">AUTONOMOUS</span>
          </div>
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
