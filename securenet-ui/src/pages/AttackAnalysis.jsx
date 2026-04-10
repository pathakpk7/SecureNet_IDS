import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import '../styles/pages/analysis.css';

const AttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [attackFrequencyData, setAttackFrequencyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [45, 52, 38, 65, 48, 32, 28]
  });

  const [attackTypeData, setAttackTypeData] = useState({
    labels: ['SQL Injection', 'DDoS', 'Brute Force', 'Port Scan', 'Malware', 'Phishing'],
    values: [47, 23, 156, 89, 12, 34]
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackFrequencyData(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(10, Math.min(100, value + (Math.random() - 0.5) * 10))
        )
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const attackTypes = [
    { type: 'SQL Injection', count: 47, trend: 'up', severity: 'high' },
    { type: 'DDoS Attack', count: 23, trend: 'down', severity: 'high' },
    { type: 'Brute Force', count: 156, trend: 'up', severity: 'medium' },
    { type: 'Port Scanning', count: 89, trend: 'stable', severity: 'medium' },
    { type: 'Malware', count: 12, trend: 'down', severity: 'high' },
    { type: 'Phishing', count: 34, trend: 'up', severity: 'low' }
  ];

  const sourceIPs = [
    { ip: '192.168.1.105', country: 'Unknown', attacks: 23, status: 'active' },
    { ip: '10.0.0.15', country: 'US', attacks: 18, status: 'blocked' },
    { ip: '172.16.0.22', country: 'CN', attacks: 15, status: 'monitoring' },
    { ip: '203.0.113.45', country: 'RU', attacks: 12, status: 'blocked' },
    { ip: '192.168.1.50', country: 'Unknown', attacks: 8, status: 'active' }
  ];

  const attackFrequency = [
    { hour: '00:00', attacks: 12 },
    { hour: '04:00', attacks: 8 },
    { hour: '08:00', attacks: 23 },
    { hour: '12:00', attacks: 45 },
    { hour: '16:00', attacks: 38 },
    { hour: '20:00', attacks: 28 }
  ];

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return 'arrow_upward';
      case 'down': return 'arrow_downward';
      case 'stable': return 'remove';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up': return '#ff3366';
      case 'down': return '#00f5ff';
      case 'stable': return '#ffaa00';
      default: return '#666';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00f5ff';
      default: return '#666';
    }
  };

  return (
    <div className="attack-analysis-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Attack Analysis</h1>
        <p className="page-subtitle">Comprehensive attack pattern analysis and threat intelligence</p>
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

      <div className="attack-overview">
        <Card className="overview-card">
          <h3>Attack Overview</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-value">369</span>
              <span className="stat-label">Total Attacks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">47</span>
              <span className="stat-label">Blocked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">23</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">89%</span>
              <span className="stat-label">Detection Rate</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="analysis-grid">
        <Card className="attack-types-card">
          <h3>Top Attack Types</h3>
          <div className="attack-types-list">
            {attackTypes.map((attack, index) => (
              <div key={index} className="attack-type-item">
                <div className="attack-info">
                  <span className="attack-name">{attack.type}</span>
                  <span className="attack-count">{attack.count}</span>
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

        <Card className="frequency-card">
          <BarChart 
            data={attackFrequencyData}
            title="Attack Frequency (Daily)"
            height={300}
          />
        </Card>
      </div>

      <div className="charts-row">
        <Card className="attack-distribution-card">
          <PieChart 
            data={attackTypeData}
            title="Attack Types Distribution"
            height={300}
          />
        </Card>
      </div>

      <Card className="source-ips-card">
        <h3>Top Source IPs</h3>
        <div className="source-ips-list">
          {sourceIPs.map((source, index) => (
            <div key={index} className="source-ip-item">
              <div className="ip-info">
                <span className="ip-address">{source.ip}</span>
                <span className="ip-country">{source.country}</span>
              </div>
              <div className="ip-stats">
                <span className="attack-count">{source.attacks} attacks</span>
                <span className={`ip-status ${source.status}`}>
                  {source.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="analysis-actions">
        <Card className="actions-card">
          <h3>Analysis Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-primary">Generate Report</button>
            <button className="btn btn-outline">Export Data</button>
            <button className="btn btn-outline">Block IPs</button>
            <button className="btn btn-outline">Configure Rules</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AttackAnalysis;
