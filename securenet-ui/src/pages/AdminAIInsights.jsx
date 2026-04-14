import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import '../styles/pages/ai.css';

const AdminAIInsights = () => {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    riskScore: 87.4,
    anomalies: 23,
    threats: 12,
    vulnerabilities: 8
  });

  const [attackForecast, setAttackForecast] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [65, 72, 89, 94, 78, 82]
  });

  const [systemAnomalies, setSystemAnomalies] = useState([
    { id: 1, type: 'Network Traffic', severity: 'critical', affected: 'Web Servers', confidence: 94, trend: 'increasing' },
    { id: 2, type: 'Login Patterns', severity: 'high', affected: 'Auth System', confidence: 87, trend: 'stable' },
    { id: 3, type: 'Database Queries', severity: 'medium', affected: 'Database Cluster', confidence: 72, trend: 'decreasing' },
    { id: 4, type: 'File System', severity: 'low', affected: 'Storage Array', confidence: 65, trend: 'stable' },
    { id: 5, type: 'API Requests', severity: 'high', affected: 'API Gateway', confidence: 89, trend: 'increasing' },
    { id: 6, type: 'Memory Usage', severity: 'medium', affected: 'Application Servers', confidence: 78, trend: 'stable' }
  ]);

  const fullAIPredictions = [
    {
      id: 1,
      title: 'Advanced Persistent Threat Detected',
      riskLevel: 'critical',
      confidence: 94,
      prediction: 'AI models identify sophisticated multi-stage attack pattern consistent with APT group activity. Lateral movement detected across 3 network segments with data exfiltration preparation.',
      suggestedActions: [
        'Isolate affected network segments immediately',
        'Deploy network segmentation controls',
        'Initiate incident response protocol',
        'Preserve forensic evidence',
        'Notify security leadership',
        'Prepare containment strategy'
      ],
      timeToAct: '30 minutes',
      affectedSystems: ['Web Servers', 'Database', 'File Storage'],
      attackVector: 'Multi-vector',
      estimatedImpact: 'High'
    },
    {
      id: 2,
      title: 'Zero-Day Exploit in Progress',
      riskLevel: 'critical',
      confidence: 91,
      prediction: 'Unusual memory allocation patterns and system calls indicate active zero-day exploitation. Attack targeting core application framework with privilege escalation attempts.',
      suggestedActions: [
        'Shutdown vulnerable services',
        'Apply emergency patches',
        'Monitor for privilege escalation',
        'Capture memory dumps for analysis',
        'Update intrusion detection signatures',
        'Prepare rollback procedures'
      ],
      timeToAct: '15 minutes',
      affectedSystems: ['Application Framework', 'Authentication'],
      attackVector: 'Unknown vulnerability',
      estimatedImpact: 'Critical'
    },
    {
      id: 3,
      title: 'Large-Scale DDoS Attack Imminent',
      riskLevel: 'high',
      confidence: 88,
      prediction: 'Traffic pattern analysis predicts massive DDoS attack targeting infrastructure within 2 hours. Botnet activity detected across multiple geographic regions.',
      suggestedActions: [
        'Activate DDoS mitigation services',
        'Scale up CDN resources',
        'Prepare traffic filtering rules',
        'Notify upstream providers',
        'Update monitoring thresholds',
        'Prepare communication plan'
      ],
      timeToAct: '2 hours',
      affectedSystems: ['Network Infrastructure', 'CDN'],
      attackVector: 'Distributed denial of service',
      estimatedImpact: 'High'
    },
    {
      id: 4,
      title: 'Insider Threat Pattern Identified',
      riskLevel: 'high',
      confidence: 85,
      prediction: 'Behavioral analysis detects anomalous access patterns consistent with insider threat. Unusual data access and transfer activities detected from privileged accounts.',
      suggestedActions: [
        'Monitor privileged account activity',
        'Review access logs and permissions',
        'Implement additional authentication',
        'Conduct security awareness training',
        'Prepare HR notification protocol',
        'Document evidence chain'
      ],
      timeToAct: '4 hours',
      affectedSystems: ['File Systems', 'Database', 'Applications'],
      attackVector: 'Insider threat',
      estimatedImpact: 'Medium'
    },
    {
      id: 5,
      title: 'Supply Chain Vulnerability Exploited',
      riskLevel: 'medium',
      confidence: 79,
      prediction: 'Third-party component analysis reveals vulnerable library being actively exploited. Attackers leveraging known CVE in authentication module.',
      suggestedActions: [
        'Update vulnerable dependencies',
        'Patch third-party components',
        'Review supply chain security',
        'Implement runtime protection',
        'Monitor for exploitation attempts',
        'Update vulnerability management'
      ],
      timeToAct: '6 hours',
      affectedSystems: ['Authentication Systems'],
      attackVector: 'Supply chain',
      estimatedImpact: 'Medium'
    }
  ];

  const riskMetrics = {
    overall: 'CRITICAL',
    threats: 12,
    vulnerabilities: 8,
    anomalies: 23,
    riskScore: 87.4,
    attackProbability: 94,
    systemHealth: 67,
    lastScan: '2 minutes ago',
    modelAccuracy: 96.2
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        riskScore: Math.max(0, Math.min(100, prev.riskScore + (Math.random() - 0.5) * 5)),
        anomalies: Math.max(0, prev.anomalies + Math.floor((Math.random() - 0.5) * 3)),
        threats: Math.max(0, prev.threats + Math.floor((Math.random() - 0.5) * 2)),
        vulnerabilities: Math.max(0, prev.vulnerabilities + Math.floor((Math.random() - 0.5) * 2))
      }));

      setAttackForecast(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(50, Math.min(100, value + (Math.random() - 0.5) * 10))
        )
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#ff0000';
    if (confidence >= 80) return '#ff3366';
    if (confidence >= 70) return '#ffaa00';
    if (confidence >= 60) return '#00f5ff';
    return '#666';
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  return (
    <div className="ai-insights-page admin-ai-insights fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Intelligence Center</h1>
        <p className="page-subtitle">Advanced threat prediction, system-wide anomalies, and attack forecasting</p>
      </div>

      {/* Real-time Risk Dashboard */}
      <div className="risk-dashboard">
        <Card className="risk-summary-card">
          <div className="risk-header">
            <h3>Real-Time Risk Assessment</h3>
            <span 
              className="risk-level-badge critical"
              style={{ backgroundColor: getRiskColor(riskMetrics.overall.toLowerCase()) }}
            >
              {riskMetrics.overall} RISK
            </span>
          </div>
          <div className="risk-metrics-grid">
            <div className="metric-item critical">
              <span className="metric-value">{riskMetrics.riskScore.toFixed(1)}</span>
              <span className="metric-label">Risk Score</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.threats}</span>
              <span className="metric-label">Active Threats</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.vulnerabilities}</span>
              <span className="metric-label">Vulnerabilities</span>
            </div>
            <div className="metric-item high">
              <span className="metric-value">{riskMetrics.anomalies}</span>
              <span className="metric-label">Anomalies</span>
            </div>
            <div className="metric-item critical">
              <span className="metric-value">{riskMetrics.attackProbability}%</span>
              <span className="metric-label">Attack Probability</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.systemHealth}%</span>
              <span className="metric-label">System Health</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.modelAccuracy}%</span>
              <span className="metric-label">Model Accuracy</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{riskMetrics.lastScan}</span>
              <span className="metric-label">Last Scan</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Attack Forecasting Chart */}
      <div className="attack-forecast-section">
        <Card className="forecast-card">
          <div className="forecast-header">
            <h3>Attack Probability Forecast</h3>
            <span className="forecast-indicator">LIVE</span>
          </div>
          <LineChart 
            data={attackForecast}
            title="24-Hour Attack Probability Forecast"
            height={300}
            realTime={true}
          />
        </Card>
      </div>

      {/* System-Wide Anomalies */}
      <div className="anomalies-section">
        <Card className="anomalies-card">
          <div className="anomalies-header">
            <h3>System-Wide Anomalies</h3>
            <span className="anomaly-count">{systemAnomalies.length} detected</span>
          </div>
          <div className="anomalies-grid">
            {systemAnomalies.map((anomaly) => (
              <div key={anomaly.id} className={`anomaly-item ${anomaly.severity}`}>
                <div className="anomaly-header">
                  <span className="anomaly-type">{anomaly.type}</span>
                  <span className={`anomaly-severity ${anomaly.severity}`} style={{ color: getSeverityColor(anomaly.severity) }}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                <div className="anomaly-details">
                  <span className="anomaly-affected">{anomaly.affected}</span>
                  <span className="anomaly-confidence">{anomaly.confidence}% confidence</span>
                  <span className={`anomaly-trend ${anomaly.trend}`}>{anomaly.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full AI Predictions */}
      <div className="predictions-section">
        <div className="predictions-header">
          <h3>Advanced AI Predictions</h3>
          <span className="prediction-count">{fullAIPredictions.length} predictions</span>
        </div>
        <div className="predictions-grid">
          {fullAIPredictions.map((prediction) => (
            <Card 
              key={prediction.id} 
              className={`prediction-card ${prediction.riskLevel} ${selectedInsight === prediction.id ? 'selected' : ''}`}
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
                <div className="prediction-meta">
                  <div className="time-to-act">
                    <span className="time-label">Time to Act:</span>
                    <span className="time-value">{prediction.timeToAct}</span>
                  </div>
                  <div className="affected-systems">
                    <span className="systems-label">Affected:</span>
                    <span className="systems-value">{prediction.affectedSystems.join(', ')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Insight Panel */}
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
            {fullAIPredictions
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

      {/* AI System Controls */}
      <div className="ai-controls">
        <Card className="controls-card">
          <h3>AI System Controls</h3>
          <div className="control-buttons">
            <button className="btn btn-primary critical">Run Full Analysis</button>
            <button className="btn btn-primary">Update Models</button>
            <button className="btn btn-outline">Export Predictions</button>
            <button className="btn btn-outline">Configure Thresholds</button>
            <button className="btn btn-outline">Retrain Models</button>
            <button className="btn btn-outline">System Diagnostics</button>
          </div>
        </Card>
      </div>

      {/* AI System Status */}
      <Card className="ai-status-card">
        <h3>AI System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Model Version</span>
            <span className="status-value">v4.1.2</span>
          </div>
          <div className="status-item">
            <span className="status-label">Training Data</span>
            <span className="status-value">4.8TB</span>
          </div>
          <div className="status-item">
            <span className="status-label">Accuracy</span>
            <span className="status-value">96.2%</span>
          </div>
          <div className="status-item">
            <span className="status-label">Processing Speed</span>
            <span className="status-value">1.2ms/prediction</span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Update</span>
            <span className="status-value">5 minutes ago</span>
          </div>
          <div className="status-item">
            <span className="status-label">Active Models</span>
            <span className="status-value">12</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAIInsights;
