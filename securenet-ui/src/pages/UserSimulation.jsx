import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/simulation.css';

const UserSimulation = () => {
  const [selectedView, setSelectedView] = useState('history');
  const [simulationHistory] = useState([
    {
      attackType: 'DDoS Attack',
      status: 'detected',
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
      sourceIP: '192.168.1.100',
      targetSystem: 'production',
      blocked: true,
      details: {
        packetsDropped: 856,
        alertsTriggered: 3,
        responseTime: '125ms',
        impact: 'network'
      },
      idsResponse: {
        detectionTime: '89ms',
        rulesTriggered: 2,
        confidence: '92%',
        mitigation: 'automatic'
      }
    },
    {
      attackType: 'SQL Injection',
      status: 'detected',
      severity: 'high',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
      sourceIP: '192.168.1.101',
      targetSystem: 'production',
      blocked: true,
      details: {
        packetsDropped: 234,
        alertsTriggered: 2,
        responseTime: '67ms',
        impact: 'database'
      },
      idsResponse: {
        detectionTime: '45ms',
        rulesTriggered: 1,
        confidence: '87%',
        mitigation: 'automatic'
      }
    },
    {
      attackType: 'Port Scan',
      status: 'detected',
      severity: 'medium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
      sourceIP: '192.168.1.102',
      targetSystem: 'production',
      blocked: true,
      details: {
        packetsDropped: 445,
        alertsTriggered: 1,
        responseTime: '234ms',
        impact: 'network'
      },
      idsResponse: {
        detectionTime: '156ms',
        rulesTriggered: 1,
        confidence: '78%',
        mitigation: 'manual'
      }
    },
    {
      attackType: 'Brute Force',
      status: 'detected',
      severity: 'medium',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString(),
      sourceIP: '192.168.1.103',
      targetSystem: 'production',
      blocked: true,
      details: {
        packetsDropped: 123,
        alertsTriggered: 2,
        responseTime: '89ms',
        impact: 'authentication'
      },
      idsResponse: {
        detectionTime: '34ms',
        rulesTriggered: 2,
        confidence: '85%',
        mitigation: 'automatic'
      }
    },
    {
      attackType: 'Malware Upload',
      status: 'detected',
      severity: 'high',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toLocaleString(),
      sourceIP: '192.168.1.104',
      targetSystem: 'production',
      blocked: true,
      details: {
        packetsDropped: 567,
        alertsTriggered: 4,
        responseTime: '145ms',
        impact: 'endpoint'
      },
      idsResponse: {
        detectionTime: '98ms',
        rulesTriggered: 3,
        confidence: '94%',
        mitigation: 'automatic'
      }
    }
  ]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    return status === 'detected' ? '#ff3366' : '#00f5ff';
  };

  const getFilteredHistory = () => {
    return simulationHistory.filter(sim => sim.targetSystem === 'production');
  };

  const getStats = () => {
    const filtered = getFilteredHistory();
    return {
      total: filtered.length,
      blocked: filtered.filter(s => s.blocked).length,
      highSeverity: filtered.filter(s => s.severity === 'high').length,
      avgResponseTime: filtered.length > 0 
        ? Math.round(filtered.reduce((acc, s) => acc + parseInt(s.details.responseTime), 0) / filtered.length)
        : 0
    };
  };

  const stats = getStats();

  return (
    <div className="user-simulation-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Simulation Results</h1>
        <p className="page-subtitle">View attack simulation results and IDS performance</p>
      </div>

      <div className="simulation-stats user-stats">
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Simulations</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{stats.blocked}</span>
            <span className="stat-label">Blocked Attacks</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{stats.highSeverity}</span>
            <span className="stat-label">High Severity</span>
          </div>
        </Card>
        <Card className="stat-card user-stat">
          <div className="stat-content">
            <span className="stat-value">{stats.avgResponseTime}ms</span>
            <span className="stat-label">Avg Response</span>
          </div>
        </Card>
      </div>

      <div className="view-controls user-controls">
        <Card className="view-selector">
          <h3>View Options</h3>
          <div className="view-tabs">
            <button 
              className={`view-tab ${selectedView === 'history' ? 'active' : ''}`}
              onClick={() => setSelectedView('history')}
            >
              Simulation History
            </button>
            <button 
              className={`view-tab ${selectedView === 'performance' ? 'active' : ''}`}
              onClick={() => setSelectedView('performance')}
            >
              IDS Performance
            </button>
            <button 
              className={`view-tab ${selectedView === 'summary' ? 'active' : ''}`}
              onClick={() => setSelectedView('summary')}
            >
              Summary Report
            </button>
          </div>
        </Card>
      </div>

      {selectedView === 'history' && (
        <Card className="history-card user-history">
          <div className="history-header">
            <h3>Recent Simulation Results</h3>
            <span className="history-count">{getFilteredHistory().length} results</span>
          </div>
          <div className="history-list">
            {getFilteredHistory().map((result, index) => (
              <div key={index} className="history-item user-history-item">
                <div className="history-info">
                  <span className="history-attack">{result.attackType}</span>
                  <span className="history-time">{result.timestamp}</span>
                  <span className="history-target">Target: {result.targetSystem}</span>
                </div>
                <div className="history-meta">
                  <span 
                    className="history-status"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.status}
                  </span>
                  <span className="history-source">{result.sourceIP}</span>
                  <span 
                    className="history-severity"
                    style={{ backgroundColor: getSeverityColor(result.severity) }}
                  >
                    {result.severity}
                  </span>
                  <span className="history-response">
                    {result.details.responseTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedView === 'performance' && (
        <Card className="performance-card user-performance">
          <h3>IDS Performance Analysis</h3>
          <div className="performance-content">
            <div className="performance-overview">
              <h4>Overall Performance</h4>
              <div className="performance-metrics">
                <div className="performance-item">
                  <span className="metric-label">Detection Rate:</span>
                  <span className="metric-value">
                    {Math.round((stats.blocked / stats.total) * 100)}%
                  </span>
                </div>
                <div className="performance-item">
                  <span className="metric-label">Average Detection Time:</span>
                  <span className="metric-value">
                    {Math.round(getFilteredHistory().reduce((acc, s) => acc + parseInt(s.idsResponse.detectionTime), 0) / getFilteredHistory().length)}ms
                  </span>
                </div>
                <div className="performance-item">
                  <span className="metric-label">Average Confidence:</span>
                  <span className="metric-value">
                    {Math.round(getFilteredHistory().reduce((acc, s) => acc + parseInt(s.idsResponse.confidence), 0) / getFilteredHistory().length)}%
                  </span>
                </div>
                <div className="performance-item">
                  <span className="metric-label">Total Rules Triggered:</span>
                  <span className="metric-value">
                    {getFilteredHistory().reduce((acc, s) => acc + s.idsResponse.rulesTriggered, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="attack-breakdown">
              <h4>Attack Type Breakdown</h4>
              <div className="breakdown-list">
                {Object.entries(
                  getFilteredHistory().reduce((acc, sim) => {
                    acc[sim.attackType] = (acc[sim.attackType] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([attackType, count]) => (
                  <div key={attackType} className="breakdown-item">
                    <span className="breakdown-attack">{attackType}</span>
                    <span className="breakdown-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {selectedView === 'summary' && (
        <Card className="summary-card user-summary">
          <h3>Simulation Summary Report</h3>
          <div className="summary-content">
            <div className="summary-section">
              <h4>Security Overview</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Attacks Simulated:</span>
                  <span className="summary-value">{stats.total}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Successfully Blocked:</span>
                  <span className="summary-value">{stats.blocked}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">High Priority Attacks:</span>
                  <span className="summary-value">{stats.highSeverity}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">System Response Time:</span>
                  <span className="summary-value">{stats.avgResponseTime}ms average</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h4>IDS Effectiveness</h4>
              <div className="effectiveness-metrics">
                <div className="effectiveness-item">
                  <div className="effectiveness-label">Detection Success Rate</div>
                  <div className="effectiveness-bar">
                    <div 
                      className="effectiveness-fill"
                      style={{ width: `${(stats.blocked / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="effectiveness-value">
                    {Math.round((stats.blocked / stats.total) * 100)}%
                  </div>
                </div>
                <div className="effectiveness-item">
                  <div className="effectiveness-label">Response Performance</div>
                  <div className="effectiveness-bar">
                    <div 
                      className="effectiveness-fill"
                      style={{ width: `${Math.min(100, (200 - stats.avgResponseTime) / 2)}%` }}
                    ></div>
                  </div>
                  <div className="effectiveness-value">
                    {stats.avgResponseTime < 100 ? 'Excellent' : stats.avgResponseTime < 150 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h4>Recent Activity</h4>
              <div className="recent-activity">
                {getFilteredHistory().slice(0, 3).map((result, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <span className="activity-attack">{result.attackType}</span>
                      <span className="activity-time">{result.timestamp}</span>
                    </div>
                    <div className="activity-status">
                      <span 
                        className="activity-badge"
                        style={{ backgroundColor: getSeverityColor(result.severity) }}
                      >
                        {result.severity}
                      </span>
                      <span className="activity-result">
                        {result.blocked ? 'Blocked' : 'Not Blocked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="help-card user-help">
        <h3>Understanding Simulation Results</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>Attack Detection</h4>
            <p>View how the IDS system detects and responds to various types of cyber attacks in real-time.</p>
          </div>
          <div className="help-item">
            <h4>Performance Metrics</h4>
            <p>Monitor system performance including detection time, response rates, and overall effectiveness.</p>
          </div>
          <div className="help-item">
            <h4>Security Status</h4>
            <p>Track the overall security posture and identify potential areas for improvement.</p>
          </div>
          <div className="help-item">
            <h4>Need More Information?</h4>
            <p>Contact your system administrator for detailed analysis and security recommendations.</p>
          </div>
        </div>
      </Card>

      <Card className="access-restriction user-restriction">
        <div className="restriction-content">
          <span className="restriction-icon">info</span>
          <div className="restriction-info">
            <h4>View-Only Access</h4>
            <p>You have view-only access to simulation results. For running simulations or triggering attacks, please contact your system administrator.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserSimulation;
