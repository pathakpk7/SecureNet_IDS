import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import '../../styles/pages/analysis.css';

const AdminAttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [attackFrequencyData, setAttackFrequencyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [45, 52, 38, 65, 48, 32, 28]
  });

  const [attackTypeData, setAttackTypeData] = useState({
    labels: ['SQL Injection', 'DDoS', 'Brute Force', 'Port Scan', 'Malware', 'Phishing'],
    values: [47, 23, 156, 89, 12, 34]
  });

  const [fullAttackData, setFullAttackData] = useState([
    { id: 1, type: 'SQL Injection', source: '192.168.1.105', target: 'Database Server', severity: 'critical', status: 'active', time: 'Just now', blocked: false },
    { id: 2, type: 'DDoS Attack', source: '10.0.0.15', target: 'Web Server', severity: 'high', status: 'mitigated', time: '2 min ago', blocked: true },
    { id: 3, type: 'Brute Force', source: '172.16.0.22', target: 'SSH Server', severity: 'medium', status: 'active', time: '5 min ago', blocked: false },
    { id: 4, type: 'Port Scan', source: '203.0.113.45', target: 'Firewall', severity: 'low', status: 'blocked', time: '8 min ago', blocked: true },
    { id: 5, type: 'Malware', source: '192.168.1.50', target: 'Workstation', severity: 'high', status: 'quarantined', time: '12 min ago', blocked: true },
    { id: 6, type: 'Phishing', source: 'external', target: 'Email Server', severity: 'medium', status: 'filtered', time: '15 min ago', blocked: true },
    { id: 7, type: 'SQL Injection', source: '10.0.0.25', target: 'API Server', severity: 'critical', status: 'active', time: '18 min ago', blocked: false },
    { id: 8, type: 'Ransomware', source: '172.16.0.33', target: 'File Server', severity: 'critical', status: 'isolated', time: '22 min ago', blocked: true }
  ]);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackFrequencyData(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(10, Math.min(100, value + (Math.random() - 0.5) * 10))
        )
      }));

      // Add new attack occasionally
      if (Math.random() > 0.8) {
        const newAttack = {
          id: Date.now(),
          type: ['SQL Injection', 'DDoS', 'Brute Force', 'Port Scan', 'Malware', 'Phishing'][Math.floor(Math.random() * 6)],
          source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          target: ['Database Server', 'Web Server', 'SSH Server', 'Firewall', 'Workstation', 'Email Server'][Math.floor(Math.random() * 6)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          status: 'active',
          time: 'Just now',
          blocked: false
        };
        setFullAttackData(prev => [newAttack, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const globalAttackStats = {
    totalAttacks: 1247,
    blockedAttacks: 892,
    activeAttacks: 45,
    criticalAttacks: 23,
    mitigatedAttacks: 156,
    detectionRate: 94.7
  };

  const attackTypes = [
    { type: 'SQL Injection', count: 347, trend: 'up', severity: 'critical', percentage: 28 },
    { type: 'DDoS Attack', count: 289, trend: 'down', severity: 'high', percentage: 23 },
    { type: 'Brute Force', count: 412, trend: 'up', severity: 'medium', percentage: 33 },
    { type: 'Port Scanning', count: 156, trend: 'stable', severity: 'medium', percentage: 12 },
    { type: 'Malware', count: 89, trend: 'down', severity: 'high', percentage: 7 },
    { type: 'Phishing', count: 234, trend: 'up', severity: 'low', percentage: 19 }
  ];

  const sourceIPs = [
    { ip: '192.168.1.105', country: 'Unknown', attacks: 89, status: 'active', risk: 'critical', blocked: false },
    { ip: '10.0.0.15', country: 'US', attacks: 67, status: 'blocked', risk: 'high', blocked: true },
    { ip: '172.16.0.22', country: 'CN', attacks: 45, status: 'monitoring', risk: 'medium', blocked: false },
    { ip: '203.0.113.45', country: 'RU', attacks: 34, status: 'blocked', risk: 'high', blocked: true },
    { ip: '192.168.1.50', country: 'Unknown', attacks: 23, status: 'active', risk: 'low', blocked: false },
    { ip: '8.8.8.8', country: 'US', attacks: 12, status: 'whitelisted', risk: 'low', blocked: false }
  ];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return ' ';
      case 'down': return ' ';
      case 'stable': return ' ';
      default: return ' ';
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

  const handleBlockIP = (ip) => {
    setFullAttackData(prev => 
      prev.map(attack => 
        attack.source === ip ? { ...attack, blocked: true, status: 'blocked' } : attack
      )
    );
    setSourceIPs(prev => 
      prev.map(ipData => 
        ipData.ip === ip ? { ...ipData, blocked: true, status: 'blocked' } : ipData
      )
    );
    console.log(`Blocked IP: ${ip}`);
  };

  const handleExportReport = () => {
    console.log('Exporting attack analysis report...');
    // Add actual export logic here
  };

  const handleDeployFirewallRule = () => {
    console.log('Deploying firewall rule...');
    // Add actual firewall rule deployment logic here
  };

  return (
    <div className="attack-analysis-page admin-attack-analysis fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Attack Analysis</h1>
        <p className="page-subtitle">Full attack visibility and threat response controls</p>
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

      {/* Global Attack Stats */}
      <div className="global-attack-stats">
        <Card className="stats-overview-card">
          <h3>Global Attack Overview</h3>
          <div className="overview-stats-grid">
            <div className="stat-item critical">
              <span className="stat-value">{globalAttackStats.totalAttacks}</span>
              <span className="stat-label">Total Attacks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{globalAttackStats.blockedAttacks}</span>
              <span className="stat-label">Blocked</span>
            </div>
            <div className="stat-item high">
              <span className="stat-value">{globalAttackStats.activeAttacks}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item critical">
              <span className="stat-value">{globalAttackStats.criticalAttacks}</span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{globalAttackStats.mitigatedAttacks}</span>
              <span className="stat-label">Mitigated</span>
            </div>
            <div className="stat-item success">
              <span className="stat-value">{globalAttackStats.detectionRate}%</span>
              <span className="stat-label">Detection Rate</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Full Attack Data */}
      <div className="full-attack-data">
        <Card className="attack-data-card">
          <div className="card-header">
            <h3>Live Attack Feed</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="attack-feed">
            {fullAttackData.map((attack) => (
              <div key={attack.id} className={`attack-item ${attack.severity} ${attack.status}`}>
                <div className="attack-flow">
                  <span className="attack-source">{attack.source}</span>
                  <span className="attack-arrow">{'->'}</span>
                  <span className="attack-target">{attack.target}</span>
                </div>
                <div className="attack-details">
                  <span className="attack-type">{attack.type}</span>
                  <span className={`severity-badge ${attack.severity}`} style={{ backgroundColor: getSeverityColor(attack.severity) }}>
                    {attack.severity.toUpperCase()}
                  </span>
                  <span className="attack-time">{attack.time}</span>
                  <span className={`attack-status ${attack.status}`}>{attack.status}</span>
                </div>
                <div className="attack-controls">
                  <button 
                    className="control-btn block-btn"
                    onClick={() => handleBlockIP(attack.source)}
                    disabled={attack.blocked}
                  >
                    {attack.blocked ? 'Blocked' : 'Block IP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Attack Analysis Grid */}
      <div className="analysis-grid">
        <Card className="attack-types-card">
          <h3>Attack Types Analysis</h3>
          <div className="attack-types-list">
            {attackTypes.map((attack, index) => (
              <div key={index} className={`attack-type-item ${attack.severity}`}>
                <div className="attack-info">
                  <span className="attack-name">{attack.type}</span>
                  <span className="attack-count">{attack.count}</span>
                  <span className="attack-percentage">{attack.percentage}%</span>
                </div>
                <div className="attack-meta">
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(attack.severity) }}
                  >
                    {attack.severity.toUpperCase()}
                  </span>
                  <span className="trend-indicator" style={{ color: getTrendColor(attack.trend) }}>
                    {getTrendIcon(attack.trend)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="source-ips-card">
          <h3>Source IP Analysis</h3>
          <div className="source-ips-list">
            {sourceIPs.map((ipData, index) => (
              <div key={index} className={`source-ip-item ${ipData.risk} ${ipData.status}`}>
                <div className="ip-info">
                  <span className="ip-address">{ipData.ip}</span>
                  <span className="ip-country">{ipData.country}</span>
                  <span className="ip-attacks">{ipData.attacks} attacks</span>
                </div>
                <div className="ip-meta">
                  <span className={`risk-badge ${ipData.risk}`}>{ipData.risk}</span>
                  <span className={`ip-status ${ipData.status}`}>{ipData.status}</span>
                </div>
                <div className="ip-controls">
                  <button 
                    className="control-btn block-ip-btn"
                    onClick={() => handleBlockIP(ipData.ip)}
                    disabled={ipData.blocked}
                  >
                    {ipData.blocked ? 'Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Attack Charts */}
      <div className="charts-row">
        <Card className="attack-distribution-card">
          <PieChart 
            data={attackTypeData}
            title="Attack Types Distribution"
            height={300}
          />
        </Card>
        <Card className="frequency-card">
          <BarChart 
            data={attackFrequencyData}
            title="Attack Frequency (Daily)"
            height={300}
          />
        </Card>
      </div>

      {/* Admin Control Actions */}
      <div className="admin-control-actions">
        <Card className="control-actions-card">
          <div className="card-header">
            <h3>Threat Response Actions</h3>
            <span className="control-indicator">ADMIN</span>
          </div>
          <div className="control-buttons">
            <button className="control-btn-primary block-ip-btn" onClick={() => handleBlockIP('selected')}>
              <span className="btn-icon">block</span>
              Block IP
            </button>
            <button className="control-btn-primary export-btn" onClick={handleExportReport}>
              <span className="btn-icon">download</span>
              Export Report
            </button>
            <button className="control-btn-primary firewall-btn" onClick={handleDeployFirewallRule}>
              <span className="btn-icon">shield</span>
              Deploy Firewall Rule
            </button>
            <button className="control-btn-secondary quarantine-btn">
              <span className="btn-icon">security</span>
              Quarantine Systems
            </button>
            <button className="control-btn-secondary notify-btn">
              <span className="btn-icon">notifications</span>
              Notify Team
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttackAnalysis;
