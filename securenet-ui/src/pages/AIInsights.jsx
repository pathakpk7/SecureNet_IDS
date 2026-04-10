import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/ai.css';

const AIInsights = () => {
  const [selectedInsight, setSelectedInsight] = useState(null);

  const aiPredictions = [
    {
      id: 1,
      title: 'Potential SQL Injection Attack',
      riskLevel: 'high',
      confidence: 87,
      prediction: 'AI models detect patterns consistent with SQL injection attempts on the login endpoint. Attack likely to escalate within the next 2 hours.',
      suggestedActions: [
        'Enable additional input validation',
        'Implement rate limiting on login attempts',
        'Monitor database query patterns',
        'Prepare incident response team'
      ],
      timeToAct: '2 hours'
    },
    {
      id: 2,
      title: 'Unusual Network Traffic Pattern',
      riskLevel: 'medium',
      confidence: 72,
      prediction: 'Anomalous traffic patterns detected from IP range 192.168.1.0/24. Possible lateral movement or internal reconnaissance.',
      suggestedActions: [
        'Isolate affected subnet',
        'Conduct network forensic analysis',
        'Review user access logs',
        'Update firewall rules'
      ],
      timeToAct: '6 hours'
    },
    {
      id: 3,
      title: 'Credential Stuffing Risk',
      riskLevel: 'high',
      confidence: 91,
      prediction: 'High volume of failed login attempts from multiple geographic locations indicates credential stuffing attack.',
      suggestedActions: [
        'Enable multi-factor authentication',
        'Implement CAPTCHA on login',
        'Block suspicious IP ranges',
        'Notify affected users'
      ],
      timeToAct: '1 hour'
    },
    {
      id: 4,
      title: 'Zero-Day Vulnerability Risk',
      riskLevel: 'medium',
      confidence: 65,
      prediction: 'Unusual application behavior patterns suggest potential zero-day vulnerability in web application framework.',
      suggestedActions: [
        'Conduct vulnerability assessment',
        'Monitor for exploit attempts',
        'Prepare security patches',
        'Enable additional logging'
      ],
      timeToAct: '24 hours'
    }
  ];

  const riskMetrics = {
    overall: 'HIGH',
    threats: 12,
    vulnerabilities: 8,
    anomalies: 23,
    lastScan: '5 minutes ago'
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00f5ff';
    if (confidence >= 60) return '#ffaa00';
    return '#ff3366';
  };

  return (
    <div className="ai-insights-page fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Insights</h1>
        <p className="page-subtitle">Advanced threat prediction and AI-powered security analysis</p>
      </div>

      <div className="risk-overview">
        <Card className="risk-summary-card">
          <div className="risk-header">
            <h3>Current Risk Assessment</h3>
            <span 
              className="risk-level-badge"
              style={{ backgroundColor: getRiskColor(riskMetrics.overall.toLowerCase()) }}
            >
              {riskMetrics.overall} RISK
            </span>
          </div>
          <div className="risk-metrics">
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.threats}</span>
              <span className="metric-label">Active Threats</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.vulnerabilities}</span>
              <span className="metric-label">Vulnerabilities</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.anomalies}</span>
              <span className="metric-label">Anomalies</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.lastScan}</span>
              <span className="metric-label">Last Scan</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="predictions-grid">
        {aiPredictions.map((prediction) => (
          <Card 
            key={prediction.id} 
            className={`prediction-card ${selectedInsight === prediction.id ? 'selected' : ''}`}
            onClick={() => setSelectedInsight(prediction.id)}
          >
            <div className="prediction-header">
              <h4 className="prediction-title">{prediction.title}</h4>
              <div className="prediction-badges">
                <span 
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(prediction.riskLevel) }}
                >
                  {prediction.riskLevel.toUpperCase()}
                </span>
                <span 
                  className="confidence-badge"
                  style={{ color: getConfidenceColor(prediction.confidence) }}
                >
                  {prediction.confidence}% Confidence
                </span>
              </div>
            </div>
            <div className="prediction-content">
              <p className="prediction-text">{prediction.prediction}</p>
              <div className="time-to-act">
                <span className="time-label">Time to Act:</span>
                <span className="time-value">{prediction.timeToAct}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedInsight && (
        <Card className="detailed-insight-card">
          <div className="insight-header">
            <h3>Recommended Actions</h3>
            <button 
              className="btn btn-outline"
              onClick={() => setSelectedInsight(null)}
            >
              Close
            </button>
          </div>
          <div className="insight-content">
            {aiPredictions
              .find(p => p.id === selectedInsight)
              ?.suggestedActions.map((action, index) => (
                <div key={index} className="action-item">
                  <span className="action-number">{index + 1}</span>
                  <span className="action-text">{action}</span>
                  <button className="btn btn-sm btn-primary">Execute</button>
                </div>
              ))}
          </div>
        </Card>
      )}

      <div className="ai-controls">
        <Card className="controls-card">
          <h3>AI Controls</h3>
          <div className="control-buttons">
            <button className="btn btn-primary">Run Full Analysis</button>
            <button className="btn btn-outline">Update Models</button>
            <button className="btn btn-outline">Export Predictions</button>
            <button className="btn btn-outline">Configure Thresholds</button>
          </div>
        </Card>
      </div>

      <Card className="ai-status-card">
        <h3>AI System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Model Version</span>
            <span className="status-value">v3.2.1</span>
          </div>
          <div className="status-item">
            <span className="status-label">Training Data</span>
            <span className="status-value">2.4TB</span>
          </div>
          <div className="status-item">
            <span className="status-label">Accuracy</span>
            <span className="status-value">94.7%</span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Update</span>
            <span className="status-value">2 hours ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIInsights;
