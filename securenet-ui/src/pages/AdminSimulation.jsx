import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/simulation.css';

const AdminSimulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [selectedAttack, setSelectedAttack] = useState('ddos');
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [testMode, setTestMode] = useState('single');
  const [targetSystem, setTargetSystem] = useState('production');

  const attackTypes = [
    {
      id: 'ddos',
      name: 'DDoS Attack',
      description: 'Simulate distributed denial of service attack',
      severity: 'high',
      duration: '30 seconds',
      impact: 'network',
      complexity: 'advanced'
    },
    {
      id: 'sql',
      name: 'SQL Injection',
      description: 'Simulate SQL injection attempt on login endpoint',
      severity: 'high',
      duration: '15 seconds',
      impact: 'database',
      complexity: 'intermediate'
    },
    {
      id: 'portscan',
      name: 'Port Scan',
      description: 'Simulate network port scanning activity',
      severity: 'medium',
      duration: '20 seconds',
      impact: 'network',
      complexity: 'basic'
    },
    {
      id: 'bruteforce',
      name: 'Brute Force',
      description: 'Simulate brute force login attempt',
      severity: 'medium',
      duration: '25 seconds',
      impact: 'authentication',
      complexity: 'intermediate'
    },
    {
      id: 'malware',
      name: 'Malware Upload',
      description: 'Simulate malicious file upload attempt',
      severity: 'high',
      duration: '10 seconds',
      impact: 'endpoint',
      complexity: 'advanced'
    },
    {
      id: 'phishing',
      name: 'Phishing Attack',
      description: 'Simulate phishing email attack',
      severity: 'low',
      duration: '35 seconds',
      impact: 'user',
      complexity: 'basic'
    },
    {
      id: 'ransomware',
      name: 'Ransomware Simulation',
      description: 'Simulate ransomware encryption attempt',
      severity: 'critical',
      duration: '45 seconds',
      impact: 'filesystem',
      complexity: 'expert'
    },
    {
      id: 'apt',
      name: 'APT Attack',
      description: 'Simulate advanced persistent threat attack',
      severity: 'critical',
      duration: '60 seconds',
      impact: 'system',
      complexity: 'expert'
    }
  ];

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    const attack = attackTypes.find(a => a.id === selectedAttack);
    
    // Simulate attack processing with realistic timing
    const processingTime = attack.duration.includes('seconds') 
      ? parseInt(attack.duration) * 1000 
      : 3000;
    
    await new Promise(resolve => setTimeout(resolve, Math.min(processingTime, 5000)));

    const result = {
      attackType: attack.name,
      attackId: attack.id,
      status: 'detected',
      severity: attack.severity,
      timestamp: new Date().toLocaleString(),
      sourceIP: '192.168.1.' + Math.floor(Math.random() * 255),
      targetSystem: targetSystem,
      blocked: Math.random() > 0.2, // 80% success rate
      details: {
        packetsDropped: Math.floor(Math.random() * 1000) + 100,
        alertsTriggered: Math.floor(Math.random() * 5) + 1,
        responseTime: Math.floor(Math.random() * 100) + 50 + 'ms',
        impact: attack.impact,
        complexity: attack.complexity,
        blockedIPs: Math.floor(Math.random() * 10) + 1,
        systemsAffected: Math.floor(Math.random() * 5) + 1
      },
      idsResponse: {
        detectionTime: Math.floor(Math.random() * 500) + 100 + 'ms',
        rulesTriggered: Math.floor(Math.random() * 3) + 1,
        confidence: Math.floor(Math.random() * 30) + 70 + '%',
        mitigation: attack.severity === 'critical' ? 'automatic' : 'manual'
      }
    };

    setSimulationResult(result);
    setSimulationHistory([result, ...simulationHistory.slice(0, 9)]);
    setIsSimulating(false);
  };

  const handleBatchSimulation = async () => {
    setIsSimulating(true);
    const results = [];
    
    for (const attack of attackTypes.slice(0, 3)) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        attackType: attack.name,
        attackId: attack.id,
        status: 'detected',
        severity: attack.severity,
        timestamp: new Date().toLocaleString(),
        sourceIP: '192.168.1.' + Math.floor(Math.random() * 255),
        targetSystem: targetSystem,
        blocked: Math.random() > 0.2,
        details: {
          packetsDropped: Math.floor(Math.random() * 1000) + 100,
          alertsTriggered: Math.floor(Math.random() * 5) + 1,
          responseTime: Math.floor(Math.random() * 100) + 50 + 'ms',
          impact: attack.impact,
          complexity: attack.complexity
        }
      };
      
      results.push(result);
    }
    
    setSimulationHistory([...results, ...simulationHistory.slice(0, 7)]);
    setIsSimulating(false);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all simulation history?')) {
      setSimulationHistory([]);
      setSimulationResult(null);
    }
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

  const getStatusColor = (status) => {
    return status === 'detected' ? '#ff3366' : '#00f5ff';
  };

  const getComplexityColor = (complexity) => {
    switch(complexity) {
      case 'expert': return '#ff0000';
      case 'advanced': return '#ff3366';
      case 'intermediate': return '#ffaa00';
      case 'basic': return '#00f5ff';
      default: return '#666';
    }
  };

  return (
    <div className="admin-simulation-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Attack Simulation Control</h1>
        <p className="page-subtitle">Advanced IDS testing with comprehensive attack simulation</p>
      </div>

      <div className="simulation-controls admin-controls">
        <Card className="attack-selector-card admin-selector">
          <h3>Select Attack Type</h3>
          <div className="attack-types-grid">
            {attackTypes.map((attack) => (
              <div 
                key={attack.id}
                className={`attack-type admin-attack ${selectedAttack === attack.id ? 'selected' : ''}`}
                onClick={() => setSelectedAttack(attack.id)}
              >
                <div className="attack-header">
                  <h4>{attack.name}</h4>
                  <div className="attack-badges">
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(attack.severity) }}
                    >
                      {attack.severity.toUpperCase()}
                    </span>
                    <span 
                      className="complexity-badge"
                      style={{ backgroundColor: getComplexityColor(attack.complexity) }}
                    >
                      {attack.complexity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <p className="attack-description">{attack.description}</p>
                <div className="attack-meta">
                  <span className="duration">Duration: {attack.duration}</span>
                  <span className="impact">Impact: {attack.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="simulation-config admin-config">
          <h3>Simulation Configuration</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Test Mode</label>
              <select 
                value={testMode} 
                onChange={(e) => setTestMode(e.target.value)}
                className="config-select"
              >
                <option value="single">Single Attack</option>
                <option value="batch">Batch Testing</option>
                <option value="stress">Stress Testing</option>
              </select>
            </div>
            <div className="config-item">
              <label>Target System</label>
              <select 
                value={targetSystem} 
                onChange={(e) => setTargetSystem(e.target.value)}
                className="config-select"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
                <option value="test">Test Environment</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <div className="simulation-action admin-action">
        <Card className="action-card admin-action-card">
          <div className="action-content">
            <div className="action-info">
              <h3>Ready to Simulate</h3>
              <p>Click the button below to start the {attackTypes.find(a => a.id === selectedAttack).name} simulation</p>
              <div className="simulation-warning admin-warning">
                <span className="warning-icon">warning</span>
                <span>This is a simulation only - no real systems will be affected</span>
              </div>
              <div className="simulation-details">
                <span>Target: {targetSystem}</span>
                <span>Mode: {testMode}</span>
              </div>
            </div>
            <div className="action-buttons">
              {testMode === 'single' ? (
                <button 
                  className={`simulate-btn admin-simulate ${isSimulating ? 'simulating' : ''}`}
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
                      Simulate Attack
                    </>
                  )}
                </button>
              ) : (
                <button 
                  className={`simulate-btn admin-simulate ${isSimulating ? 'simulating' : ''}`}
                  onClick={handleBatchSimulation}
                  disabled={isSimulating}
                >
                  {isSimulating ? (
                    <>
                      <span className="spinner"></span>
                      Running Batch Test...
                    </>
                  ) : (
                    <>
                      Run Batch Simulation
                    </>
                  )}
                </button>
              )}
              <button 
                className="btn btn-outline"
                onClick={clearHistory}
                disabled={simulationHistory.length === 0}
              >
                Clear History
              </button>
            </div>
          </div>
        </Card>
      </div>

      {simulationResult && (
        <Card className="result-card admin-result">
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
                <span className="overview-label">Target System:</span>
                <span className="overview-value">{simulationResult.targetSystem}</span>
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
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.blockedIPs}</span>
                  <span className="metric-label">IPs Blocked</span>
                </div>
                <div className="metric-item">
                  <span className="metric-value">{simulationResult.details.systemsAffected}</span>
                  <span className="metric-label">Systems Affected</span>
                </div>
              </div>
            </div>

            <div className="ids-response">
              <h4>IDS Response Analysis</h4>
              <div className="ids-metrics">
                <div className="ids-metric">
                  <span className="ids-label">Detection Time:</span>
                  <span className="ids-value">{simulationResult.idsResponse.detectionTime}</span>
                </div>
                <div className="ids-metric">
                  <span className="ids-label">Rules Triggered:</span>
                  <span className="ids-value">{simulationResult.idsResponse.rulesTriggered}</span>
                </div>
                <div className="ids-metric">
                  <span className="ids-label">Confidence:</span>
                  <span className="ids-value">{simulationResult.idsResponse.confidence}</span>
                </div>
                <div className="ids-metric">
                  <span className="ids-label">Mitigation:</span>
                  <span className="ids-value">{simulationResult.idsResponse.mitigation}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {simulationHistory.length > 0 && (
        <Card className="history-card admin-history">
          <div className="history-header">
            <h3>Simulation History</h3>
            <span className="history-count">{simulationHistory.length} simulations</span>
          </div>
          <div className="history-list">
            {simulationHistory.map((result, index) => (
              <div key={index} className="history-item admin-history-item">
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
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="settings-card admin-settings">
        <h3>Advanced Simulation Settings</h3>
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
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Advanced Analytics</span>
              <span className="setting-description">Generate detailed analytics reports</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">System Impact</span>
              <span className="setting-description">Allow simulation to affect system metrics</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Performance Testing</span>
              <span className="setting-description">Test IDS performance under load</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSimulation;
