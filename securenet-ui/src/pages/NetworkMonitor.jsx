import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import '../styles/pages/network.css';

const NetworkMonitor = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [trafficData, setTrafficData] = useState({
    incoming: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      values: [120, 150, 180, 220, 190, 160]
    },
    outgoing: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      values: [80, 120, 140, 180, 160, 130]
    }
  });

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => ({
        incoming: {
          ...prev.incoming,
          values: prev.incoming.values.map(value => 
            Math.max(50, Math.min(300, value + (Math.random() - 0.5) * 20))
          )
        },
        outgoing: {
          ...prev.outgoing,
          values: prev.outgoing.values.map(value => 
            Math.max(30, Math.min(200, value + (Math.random() - 0.5) * 15))
          )
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trafficStats = {
    incoming: {
      total: '2.4TB',
      peak: '450Mbps',
      average: '125Mbps',
      connections: 1247
    },
    outgoing: {
      total: '1.8TB',
      peak: '380Mbps',
      average: '95Mbps',
      connections: 892
    }
  };

  const protocols = [
    { name: 'HTTP/HTTPS', traffic: '45%', color: '#00f5ff' },
    { name: 'SSH', traffic: '25%', color: '#ff3366' },
    { name: 'FTP', traffic: '15%', color: '#ffaa00' },
    { name: 'Other', traffic: '15%', color: '#666' }
  ];

  const topConnections = [
    { ip: '192.168.1.100', traffic: '125MB', status: 'active' },
    { ip: '10.0.0.15', traffic: '98MB', status: 'active' },
    { ip: '172.16.0.22', traffic: '76MB', status: 'monitoring' },
    { ip: '203.0.113.45', traffic: '54MB', status: 'blocked' },
    { ip: '192.168.1.50', traffic: '32MB', status: 'active' }
  ];

  return (
    <div className="network-monitor-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Network Monitor</h1>
        <p className="page-subtitle">Real-time network traffic analysis and monitoring</p>
      </div>

      <div className="time-range-selector">
        <button 
          className={`range-btn ${selectedTimeRange === '1h' ? 'active' : ''}`}
          onClick={() => setSelectedTimeRange('1h')}
        >
          1 Hour
        </button>
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

      <div className="traffic-overview">
        <Card className="traffic-card incoming">
          <div className="traffic-header">
            <h3>Incoming Traffic</h3>
            <span className="traffic-indicator incoming"></span>
          </div>
          <LineChart 
            data={trafficData.incoming}
            title="Incoming Traffic (Mbps)"
            height={250}
          />
          <div className="traffic-stats">
            <div className="stat-item">
              <span className="stat-value">{trafficStats.incoming.total}</span>
              <span className="stat-label">Total Traffic</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.incoming.peak}</span>
              <span className="stat-label">Peak Speed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.incoming.average}</span>
              <span className="stat-label">Average Speed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.incoming.connections}</span>
              <span className="stat-label">Active Connections</span>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-title">Traffic Flow</div>
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '45%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '70%' }}></div>
              <div className="chart-bar" style={{ height: '85%' }}></div>
              <div className="chart-bar" style={{ height: '55%' }}></div>
              <div className="chart-bar" style={{ height: '75%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="traffic-card outgoing">
          <div className="traffic-header">
            <h3>Outgoing Traffic</h3>
            <span className="traffic-indicator outgoing"></span>
          </div>
          <div className="traffic-stats">
            <div className="stat-item">
              <span className="stat-value">{trafficStats.outgoing.total}</span>
              <span className="stat-label">Total Traffic</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.outgoing.peak}</span>
              <span className="stat-label">Peak Speed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.outgoing.average}</span>
              <span className="stat-label">Average Speed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{trafficStats.outgoing.connections}</span>
              <span className="stat-label">Active Connections</span>
            </div>
          </div>
          <LineChart 
            data={trafficData.outgoing}
            title="Outgoing Traffic (Mbps)"
            height={250}
          />
        </Card>
      </div>

      <div className="network-details">
        <Card className="protocols-card">
          <h3>Protocol Distribution</h3>
          <div className="protocol-list">
            {protocols.map((protocol, index) => (
              <div key={index} className="protocol-item">
                <div className="protocol-info">
                  <span className="protocol-name">{protocol.name}</span>
                  <span className="protocol-traffic">{protocol.traffic}</span>
                </div>
                <div className="protocol-bar">
                  <div 
                    className="protocol-fill" 
                    style={{ 
                      width: protocol.traffic,
                      backgroundColor: protocol.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="connections-card">
          <h3>Top Connections</h3>
          <div className="connections-list">
            {topConnections.map((connection, index) => (
              <div key={index} className="connection-item">
                <div className="connection-info">
                  <span className="connection-ip">{connection.ip}</span>
                  <span className="connection-traffic">{connection.traffic}</span>
                </div>
                <span className={`connection-status ${connection.status}`}>
                  {connection.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="network-actions">
        <Card className="actions-card">
          <h3>Network Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-primary">Scan Network</button>
            <button className="btn btn-outline">Block Suspicious IPs</button>
            <button className="btn btn-outline">Export Report</button>
            <button className="btn btn-outline">Configure Alerts</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitor;
