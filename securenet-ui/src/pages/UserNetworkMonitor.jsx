import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import '../styles/pages/network.css';

const UserNetworkMonitor = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [personalTrafficData, setPersonalTrafficData] = useState({
    incoming: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      values: [12, 15, 18, 22, 19, 16]
    },
    outgoing: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      values: [8, 12, 14, 18, 16, 13]
    }
  });

  const [personalSessions, setPersonalSessions] = useState([
    { id: 1, device: 'Laptop-Work', ip: '192.168.1.100', status: 'active', duration: '2h 34m', traffic: '125MB' },
    { id: 2, device: 'Mobile-Phone', ip: '192.168.1.101', status: 'active', duration: '45m', traffic: '32MB' },
    { id: 3, device: 'Desktop-Home', ip: '192.168.1.102', status: 'inactive', duration: '0m', traffic: '0MB' }
  ]);

  const [personalConnections, setPersonalConnections] = useState([
    { id: 1, service: 'Email Server', address: 'mail.company.com', status: 'connected', duration: '1h 12m' },
    { id: 2, service: 'VPN Gateway', address: 'vpn.company.com', status: 'connected', duration: '2h 34m' },
    { id: 3, service: 'File Server', address: 'files.company.com', status: 'disconnected', duration: '0m' },
    { id: 4, service: 'Web Application', address: 'app.company.com', status: 'connected', duration: '45m' }
  ]);

  // Simulate personal data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalTrafficData(prev => ({
        incoming: {
          ...prev.incoming,
          values: prev.incoming.values.map(value => 
            Math.max(5, Math.min(50, value + (Math.random() - 0.5) * 5))
          )
        },
        outgoing: {
          ...prev.outgoing,
          values: prev.outgoing.values.map(value => 
            Math.max(3, Math.min(30, value + (Math.random() - 0.5) * 4))
          )
        }
      }));

      // Update session durations
      setPersonalSessions(prev => 
        prev.map(session => 
          session.status === 'active' 
            ? { ...session, duration: incrementDuration(session.duration) }
            : session
        )
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const incrementDuration = (duration) => {
    const parts = duration.split(' ');
    let hours = parseInt(parts[0]) || 0;
    let minutes = parseInt(parts[1]?.replace('m', '')) || 0;
    
    minutes += 1;
    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const personalStats = {
    totalTraffic: '157MB',
    activeSessions: 2,
    connectedServices: 3,
    sessionDuration: '2h 34m',
    bandwidthUsage: '2.4Mbps'
  };

  const personalProtocols = [
    { name: 'HTTPS', traffic: '45%', usage: 'Web browsing' },
    { name: 'SMTP', traffic: '25%', usage: 'Email' },
    { name: 'VPN', traffic: '20%', usage: 'Secure connection' },
    { name: 'DNS', traffic: '10%', usage: 'Domain resolution' }
  ];

  return (
    <div className="network-monitor-page user-network-monitor fade-in">
      <div className="page-header">
        <h1 className="page-title">My Network Activity</h1>
        <p className="page-subtitle">Personal network monitoring and session management</p>
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
      </div>

      {/* Personal Stats Cards */}
      <div className="personal-stats-grid">
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalStats.totalTraffic}</span>
            <span className="stat-label">My Traffic</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalStats.activeSessions}</span>
            <span className="stat-label">Active Sessions</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalStats.connectedServices}</span>
            <span className="stat-label">Connected Services</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalStats.sessionDuration}</span>
            <span className="stat-label">Session Duration</span>
          </div>
        </Card>
      </div>

      {/* Personal Network Activity */}
      <div className="personal-activity-section">
        <Card className="personal-activity-card">
          <div className="card-header">
            <h3>My Network Activity</h3>
            <span className="activity-indicator">Active</span>
          </div>
          <div className="personal-charts">
            <div className="chart-container">
              <LineChart 
                data={personalTrafficData.incoming}
                title="My Incoming Traffic (Mbps)"
                height={250}
                realTime={true}
              />
            </div>
            <div className="chart-container">
              <LineChart 
                data={personalTrafficData.outgoing}
                title="My Outgoing Traffic (Mbps)"
                height={250}
                realTime={true}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* My Sessions */}
      <div className="my-sessions-section">
        <Card className="my-sessions-card">
          <div className="card-header">
            <h3>My Active Sessions</h3>
            <span className="session-count">{personalSessions.filter(s => s.status === 'active').length} active</span>
          </div>
          <div className="sessions-list">
            {personalSessions.map((session) => (
              <div key={session.id} className={`session-card ${session.status}`}>
                <div className="session-header">
                  <span className="session-device">{session.device}</span>
                  <span className={`session-status ${session.status}`}>{session.status}</span>
                </div>
                <div className="session-details">
                  <span className="session-ip">{session.ip}</span>
                  <span className="session-duration">{session.duration}</span>
                  <span className="session-traffic">{session.traffic}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* My Connections */}
      <div className="my-connections-section">
        <Card className="my-connections-card">
          <div className="card-header">
            <h3>My Service Connections</h3>
            <span className="connection-count">{personalConnections.filter(c => c.status === 'connected').length} connected</span>
          </div>
          <div className="connections-grid">
            {personalConnections.map((connection) => (
              <div key={connection.id} className={`connection-card ${connection.status}`}>
                <div className="connection-icon">
                  <span className="service-icon">{connection.service.charAt(0)}</span>
                </div>
                <div className="connection-info">
                  <span className="connection-service">{connection.service}</span>
                  <span className="connection-address">{connection.address}</span>
                  <span className="connection-duration">{connection.duration}</span>
                </div>
                <div className="connection-status-indicator">
                  <span className={`status-dot ${connection.status}`}></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Protocol Usage */}
      <div className="protocol-usage-section">
        <Card className="protocol-usage-card">
          <div className="card-header">
            <h3>My Protocol Usage</h3>
            <span className="usage-indicator">Last 24h</span>
          </div>
          <div className="protocol-usage-list">
            {personalProtocols.map((protocol, index) => (
              <div key={index} className="protocol-usage-item">
                <div className="protocol-usage-info">
                  <span className="protocol-name">{protocol.name}</span>
                  <span className="protocol-usage-desc">{protocol.usage}</span>
                </div>
                <div className="protocol-usage-traffic">
                  <span className="traffic-percentage">{protocol.traffic}</span>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ width: protocol.traffic }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Info */}
      <div className="quick-info-section">
        <Card className="quick-info-card">
          <div className="info-item">
            <span className="info-label">Current Bandwidth</span>
            <span className="info-value">{personalStats.bandwidthUsage}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Security Status</span>
            <span className="info-value secure">Secure</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Activity</span>
            <span className="info-value">Just now</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserNetworkMonitor;
