import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import Card from '../components/ui/Card';
import '../styles/pages/alerts.css';

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [alertData, setAlertData] = useState([
    {
      id: 1,
      threatType: 'SQL Injection Attempt',
      severity: 'high',
      time: '2 minutes ago',
      status: 'active',
      sourceIP: '192.168.1.105',
      description: 'Suspicious SQL injection patterns detected in login endpoint'
    },
    {
      id: 2,
      threatType: 'DDoS Attack',
      severity: 'high',
      time: '5 minutes ago',
      status: 'mitigated',
      sourceIP: '10.0.0.15',
      description: 'Distributed denial of service attack blocked successfully'
    },
    {
      id: 3,
      threatType: 'Port Scanning',
      severity: 'medium',
      time: '15 minutes ago',
      status: 'monitoring',
      sourceIP: '172.16.0.22',
      description: 'Multiple port scans detected from external source'
    },
    {
      id: 4,
      threatType: 'Brute Force Attack',
      severity: 'medium',
      time: '1 hour ago',
      status: 'blocked',
      sourceIP: '203.0.113.45',
      description: 'Multiple failed login attempts detected'
    },
    {
      id: 5,
      threatType: 'Malware Detection',
      severity: 'low',
      time: '2 hours ago',
      status: 'quarantined',
      sourceIP: '192.168.1.50',
      description: 'Suspicious file detected and quarantined'
    },
    {
      id: 6,
      threatType: 'Unusual Traffic Pattern',
      severity: 'low',
      time: '3 hours ago',
      status: 'investigating',
      sourceIP: '10.0.0.8',
      description: 'Anomalous network traffic pattern detected'
    }
  ]);

  const filteredAlerts = selectedSeverity === 'all' 
    ? alertData 
    : alertData.filter(alert => alert.severity === selectedSeverity);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#ff3366';
      case 'mitigated': return '#00f5ff';
      case 'blocked': return '#00f5ff';
      case 'monitoring': return '#ffaa00';
      case 'quarantined': return '#00f5ff';
      case 'investigating': return '#ffaa00';
      default: return '#666';
    }
  };

  return (
    <div className="alerts-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Security Alerts</h1>
        <p className="page-subtitle">Real-time threat detection and security monitoring</p>
      </div>

      <div className="alerts-controls">
        <div className="severity-filter">
          <button 
            className={`filter-btn ${selectedSeverity === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSeverity('all')}
          >
            All Alerts
          </button>
          <button 
            className={`filter-btn ${selectedSeverity === 'high' ? 'active' : ''}`}
            onClick={() => setSelectedSeverity('high')}
          >
            High
          </button>
          <button 
            className={`filter-btn ${selectedSeverity === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedSeverity('medium')}
          >
            Medium
          </button>
          <button 
            className={`filter-btn ${selectedSeverity === 'low' ? 'active' : ''}`}
            onClick={() => setSelectedSeverity('low')}
          >
            Low
          </button>
        </div>
      </div>

      <div className="alerts-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{alertData.length}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{alertData.filter(a => a.severity === 'high').length}</div>
            <div className="stat-label">High Severity</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{alertData.filter(a => a.status === 'active').length}</div>
            <div className="stat-label">Active Threats</div>
          </div>
        </Card>
      </div>

      <div className="alerts-list">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="alert-card">
            <div className="alert-header">
              <div className="alert-title-section">
                <h3 className="alert-title">{alert.threatType}</h3>
                <div className="alert-meta">
                  <span className="alert-time">{alert.time}</span>
                  <span className="alert-source">Source: {alert.sourceIP}</span>
                </div>
              </div>
              <div className="alert-badges">
                <span 
                  className="severity-badge" 
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(alert.status) }}
                >
                  {alert.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="alert-description">
              {alert.description}
            </div>
            <div className="alert-actions">
              <button className="btn btn-outline">Investigate</button>
              <button className="btn btn-outline">Block IP</button>
              <button className="btn btn-primary">Resolve</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
