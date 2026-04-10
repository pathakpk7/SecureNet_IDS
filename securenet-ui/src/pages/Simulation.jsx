import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/simulation.css';

const Simulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedAttack, setSelectedAttack] = useState('ddos');
  const [simulationHistory, setSimulationHistory] = useState([]);

  const attackTypes = [
    {
      id: 'ddos',
      name: 'DDoS Attack',
      description: 'Simulate distributed denial of service attack',
      severity: 'high',
      duration: '30 seconds'
    },
    {
      id: 'sql',
      name: 'SQL Injection',
      description: 'Simulate SQL injection attempt on login endpoint',
      severity: 'high',
      duration: '15 seconds'
    },
    {
      id: 'portscan',
      name: 'Port Scan',
      description: 'Simulate network port scanning activity',
      severity: 'medium',
      duration: '20 seconds'
    },
    {
      id: 'bruteforce',
      name: 'Brute Force',
      description: 'Simulate brute force login attempt',
      severity: 'medium',
      duration: '25 seconds'
    },
    {
      id: 'malware',
      name: 'Malware Upload',
      description: 'Simulate malicious file upload attempt',
      severity: 'high',
      duration: '10 seconds'
    },
    {
      id: 'phishing',
      name: 'Phishing Attack',
      description: 'Simulate phishing email attack',
      severity: 'low',
      duration: '35 seconds'
    }
  ];

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const attack = attackTypes.find(a => a.id === selectedAttack);
    
    // Simulate attack processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      attackType: attack.name,
      status: 'detected',
      severity: attack.severity,
      timestamp: new Date().toLocaleString(),
      sourceIP: '192.168.1.' + Math.floor(Math.random() * 255),
      blocked: true,
      details: {
        packetsDropped: Math.floor(Math.random() * 1000) + 100,
        alertsTriggered: Math.floor(Math.random() * 5) + 1,
        responseTime: Math.floor(Math.random() * 100) + 50 + 'ms',
        impact: 'minimal'
      }
    };

    setSimulationResult(result);
    setSimulationHistory([result, ...simulationHistory.slice(0, 4)]);
    setIsSimulating(false);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    return status === 'detected' ? '#ff3366' : '#00f5ff';
  };

  return (
    <div className="simulation-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Attack Simulation</h1>
        <p className="page-subtitle">Test your IDS with simulated cyber attacks</p>
      </div>

      <div className="simulation-controls">
        <Card className="attack-selector-card">
          <h3>Select Attack Type</h3>
          <div className="attack-types">
            {attackTypes.map((attack) => (
              <div 
                key={attack.id}
                className={`attack-type ${selectedAttack === attack.id ? 'selected' : ''}`}
                onClick={() => setSelectedAttack(attack.id)}
              >
                <div className="attack-header">
                  <h4>{attack.name}</h4>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(attack.severity) }}
                  >
                    {attack.severity.toUpperCase()}
                  </span>
                </div>
                <p className="attack-description">{attack.description}</p>
                <div className="attack-meta">
                  <span className="duration">Duration: {attack.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="simulation-action">
        <Card className="action-card">
          <div className="action-content">
            <div className="action-info">
              <h3>Ready to Simulate</h3>
              <p>Click the button below to start the {attackTypes.find(a => a.id === selectedAttack).name} simulation</p>
              <div className="simulation-warning">
                <span className="warning-icon">warning</span>
                <span>This is a simulation only - no real systems will be affected</span>
              </div>
            </div>
            <button 
              className={`simulate-btn ${isSimulating ? 'simulating' : ''}`}
              onClick={handleSimulateAttack}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <span className="spinner"></span>
                  Simulating Attack...
                </>
              ) : (
                <>
                  <span className="attack-icon">security</span>
                  Simulate Attack
                </>
              )}
            </button>
          </div>
        </Card>
      </div>

      {simulationResult && (
        <Card className="result-card">
          <div className="result-header">
            <h3>Attack Detected!</h3>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(simulationResult.status) }}
            >
              {simulationResult.status.toUpperCase()}
            </span>
          </div>
          <div className="result-content">
            <div className="result-overview">
              <div className="overview-item">
                <span className="overview-label">Attack Type:</span>
                <span className="overview-value">{simulationResult.attackType}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Source IP:</span>
                <span className="overview-value">{simulationResult.sourceIP}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Timestamp:</span>
                <span className="overview-value">{simulationResult.timestamp}</span>
              </div>
              <div className="overview-item">
                <span className="overview-label">Status:</span>
                <span className="overview-value" style={{ color: getStatusColor(simulationResult.status) }}>
                  {simulationResult.blocked ? 'Blocked Successfully' : 'Not Blocked'}
                </span>
              </div>
            </div>
            
            <div className="result-details">
              <h4>Detailed Metrics</h4>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.packetsDropped}</span>
                  <span className="metric-label">Packets Dropped</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.alertsTriggered}</span>
                  <span className="metric-label">Alerts Triggered</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.responseTime}</span>
                  <span className="metric-label">Response Time</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.impact}</span>
                  <span className="metric-label">Impact Level</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {simulationHistory.length > 0 && (
        <Card className="history-card">
          <h3>Simulation History</h3>
          <div className="history-list">
            {simulationHistory.map((result, index) => (
              <div key={index} className="history-item">
                <div className="history-info">
                  <span className="history-attack">{result.attackType}</span>
                  <span className="history-time">{result.timestamp}</span>
                </div>
                <div className="history-meta">
                  <span 
                    className="history-status"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.status}
                  </span>
                  <span className="history-source">{result.sourceIP}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="settings-card">
        <h3>Simulation Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Real-time Alerts</span>
              <span className="setting-description">Show alerts during simulation</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Log Results</span>
              <span className="setting-description">Save simulation results to logs</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Auto Block</span>
              <span className="setting-description">Automatically block attack sources</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Simulation;
