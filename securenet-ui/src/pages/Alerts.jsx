import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { processAlert } from '../services/securityEngine';
import { getAlerts } from '../services/api/alertsApi';
import useRealtimeAlerts from '../hooks/useRealtimeAlerts';
import ThreatIntelligence from '../components/security/ThreatIntelligence';
import IncidentPanel from '../components/security/IncidentPanel';
import '../styles/pages/alerts.css';

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const realtimeAlerts = useRealtimeAlerts();
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

  useEffect(() => {
    const audio = new Audio("/sounds/alert.mp3");

    // Process new realtime alerts
    realtimeAlerts.forEach(newAlert => {
      const processed = processAlert(newAlert);
      
      // Update UI
      setAlertData(prev => {
        const exists = prev.some(alert => alert.id === processed.id);
        if (!exists) {
          return [processed, ...prev];
        }
        return prev;
      });

      // Toast notification with prediction
      if (processed.threat.level === "CRITICAL") {
        toast.error("CRITICAL ATTACK DETECTED!");
      } else if (processed.prediction.level === "CRITICAL") {
        toast.error("Predicted attack escalation!");
      } else if (processed.prediction.level === "HIGH") {
        toast("Suspicious behavior detected");
      } else {
        toast.error(`\u26a0 ${newAlert.message}`);
      }

      // Sound
      audio.play();

      // Glow effect
      setHighlightedId(newAlert.id);
      setTimeout(() => setHighlightedId(null), 2000);
    });
  }, [realtimeAlerts]);

  const filteredAlerts = selectedSeverity === 'all' 
    ? alertData 
    : alertData.filter(alert => alert.severity === selectedSeverity);

  // Sort by threat level
  filteredAlerts.sort((a, b) => {
    const aThreat = a.threat || { level: "LOW" };
    const bThreat = b.threat || { level: "LOW" };
    return bThreat.level.localeCompare(aThreat.level);
  });

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

      {/* Threat Intelligence Panel */}
      <div className="intelligence-section">
        <ThreatIntelligence alerts={filteredAlerts} />
        <IncidentPanel alert={filteredAlerts[0]} />
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
        {filteredAlerts.map((alert) => {
          const threat = alert.threat || { level: "LOW", color: "#00ffcc" };
          const prediction = alert.prediction || { level: "LOW", message: "Normal activity" };
          
          const borderColor = 
            prediction.level === "CRITICAL"
              ? "red"
              : prediction.level === "HIGH"
              ? "orange"
              : "#00ffcc";
          
          return (
          <Card 
            key={alert.id} 
            className={`alert-card ${alert.id === highlightedId ? "alert-glow" : ""}`}
            style={{ borderColor }}
          >
            <div className="alert-header">
              <div className="alert-title-section">
                <h3 className="alert-title">{alert.threatType}</h3>
                <div className="alert-meta">
                  <span className="alert-time">{alert.time}</span>
                  <span className="alert-source">Source: {alert.sourceIP}</span>
                </div>
              </div>
              <div className="alert-badges">
                <div
                  style={{
                    background: threat.color,
                    color: "#000",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginBottom: "4px"
                  }}
                >
                  {threat.level}
                </div>
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
            <div style={{ fontSize: "11px", color: "orange", marginTop: "8px" }}>
              🤖 {prediction.message}
            </div>
            <div style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
              <strong>AI Reasoning:</strong> {
                threat.level === "CRITICAL" ? "High threat score + critical attack pattern detected" :
                threat.level === "HIGH" ? "High frequency + dangerous attack type" :
                threat.level === "MEDIUM" ? "Moderate threat indicators present" :
                "Low risk activity pattern"
              }
            </div>
            <div className="alert-actions">
              <button className="btn btn-outline">Investigate</button>
              <button className="btn btn-outline">Block IP</button>
              <button className="btn btn-primary">Resolve</button>
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Alerts;
