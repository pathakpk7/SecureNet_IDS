import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import '../styles/pages/analysis.css';

const UserAttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [personalAttackData, setPersonalAttackData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [4, 5, 3, 6, 4, 2, 2]
  });

  const [personalAttackTypeData, setPersonalAttackTypeData] = useState({
    labels: ['Phishing', 'Malware', 'Suspicious', 'Safe'],
    values: [2, 1, 3, 45]
  });

  // Simulate personal data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalAttackData(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(0, Math.min(10, value + (Math.random() - 0.5) * 2))
        )
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const personalStats = {
    totalThreats: 26,
    blockedThreats: 23,
    safeConnections: 156,
    securityScore: 94,
    lastScan: '2 hours ago'
  };

  const personalThreatSummary = [
    { type: 'Phishing Attempts', count: 2, severity: 'medium', description: 'Email security alerts' },
    { type: 'Malware Detected', count: 1, severity: 'high', description: 'File scan results' },
    { type: 'Suspicious Activity', count: 3, severity: 'low', description: 'Unusual login patterns' },
    { type: 'Safe Connections', count: 156, severity: 'safe', description: 'Verified secure connections' }
  ];

  const personalSecurityTimeline = [
    { time: '2 hours ago', event: 'Security scan completed', status: 'success' },
    { time: '5 hours ago', event: 'Phishing email blocked', status: 'warning' },
    { time: '1 day ago', event: 'Password updated', status: 'success' },
    { time: '2 days ago', event: 'Suspicious login detected', status: 'warning' },
    { time: '3 days ago', event: 'Security training completed', status: 'success' }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ffaa00';
      case 'medium': return '#00f5ff';
      case 'low': return '#666';
      case 'safe': return '#00ff00';
      default: return '#666';
    }
  };

  return (
    <div className="attack-analysis-page user-attack-analysis fade-in">
      <div className="page-header">
        <h1 className="page-title">My Security Summary</h1>
        <p className="page-subtitle">Personal security overview and threat analysis</p>
      </div>

      <div className="analysis-controls">
        <div className="time-range-selector">
          <button 
            className={`range-btn ${selectedTimeRange === '24h' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('24h')}
          >
            24 Hours
          </button>
          <button 
            className={`range-btn ${selectedTimeRange === '7d' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`range-btn ${selectedTimeRange === '30d' ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange('30d')}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Personal Security Stats */}
      <div className="personal-security-stats">
        <Card className="personal-stats-card">
          <h3>My Security Overview</h3>
          <div className="personal-stats-grid">
            <div className="stat-item">
              <span className="stat-value">{personalStats.totalThreats}</span>
              <span className="stat-label">Total Threats</span>
            </div>
            <div className="stat-item success">
              <span className="stat-value">{personalStats.blockedThreats}</span>
              <span className="stat-label">Blocked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.safeConnections}</span>
              <span className="stat-label">Safe Connections</span>
            </div>
            <div className="stat-item success">
              <span className="stat-value">{personalStats.securityScore}%</span>
              <span className="stat-label">Security Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.lastScan}</span>
              <span className="stat-label">Last Scan</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Personal Threat Summary */}
      <div className="personal-threat-summary">
        <Card className="threat-summary-card">
          <h3>My Threat Summary</h3>
          <div className="threat-summary-list">
            {personalThreatSummary.map((threat, index) => (
              <div key={index} className={`threat-summary-item ${threat.severity}`}>
                <div className="threat-info">
                  <span className="threat-type">{threat.type}</span>
                  <span className="threat-count">{threat.count}</span>
                </div>
                <div className="threat-meta">
                  <span className="threat-description">{threat.description}</span>
                  <span 
                    className="severity-indicator"
                    style={{ backgroundColor: getSeverityColor(threat.severity) }}
                  >
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Personal Security Charts */}
      <div className="personal-charts">
        <Card className="personal-chart-card">
          <h3>My Threat Activity</h3>
          <BarChart 
            data={personalAttackData}
            title="Personal Threat Frequency"
            height={250}
          />
        </Card>
        <Card className="personal-chart-card">
          <h3>My Security Events</h3>
          <PieChart 
            data={personalAttackTypeData}
            title="Personal Security Events Distribution"
            height={250}
          />
        </Card>
      </div>

      {/* Security Timeline */}
      <div className="security-timeline">
        <Card className="timeline-card">
          <h3>My Security Timeline</h3>
          <div className="timeline-list">
            {personalSecurityTimeline.map((event, index) => (
              <div key={index} className={`timeline-item ${event.status}`}>
                <div className="timeline-time">{event.time}</div>
                <div className="timeline-event">{event.event}</div>
                <div className="timeline-status">
                  <span className={`status-indicator ${event.status}`}></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Security Recommendations */}
      <div className="security-recommendations">
        <Card className="recommendations-card">
          <h3>Security Recommendations</h3>
          <div className="recommendations-list">
            <div className="recommendation-item">
              <span className="recommendation-icon"></span>
              <div className="recommendation-content">
                <span className="recommendation-title">Enable Two-Factor Authentication</span>
                <span className="recommendation-description">Add an extra layer of security to your account</span>
              </div>
            </div>
            <div className="recommendation-item">
              <span className="recommendation-icon"></span>
              <div className="recommendation-content">
                <span className="recommendation-title">Update Security Questions</span>
                <span className="recommendation-description">Review and update your recovery questions</span>
              </div>
            </div>
            <div className="recommendation-item">
              <span className="recommendation-icon"></span>
              <div className="recommendation-content">
                <span className="recommendation-title">Review Connected Devices</span>
                <span className="recommendation-description">Check devices that have access to your account</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Security Info */}
      <div className="quick-security-info">
        <Card className="info-card">
          <div className="info-item">
            <span className="info-label">Account Status</span>
            <span className="info-value secure">Secure</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Login</span>
            <span className="info-value">2 hours ago</span>
          </div>
          <div className="info-item">
            <span className="info-label">Active Sessions</span>
            <span className="info-value">2</span>
          </div>
          <div className="info-item">
            <span className="info-label">Security Level</span>
            <span className="info-value high">High</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAttackAnalysis;
