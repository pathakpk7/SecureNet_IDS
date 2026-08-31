import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import '../../styles/pages/dashboard.css';

const UserDashboard = () => {
  const [personalTrafficData, setPersonalTrafficData] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [12, 15, 18, 22, 19, 16]
  });

  const [personalThreatData, setPersonalThreatData] = useState({
    labels: ['Phishing', 'Malware', 'Suspicious', 'Safe', 'Unknown'],
    values: [2, 1, 3, 45, 2]
  });

  const [personalStats, setPersonalStats] = useState({
    personalAlerts: 3,
    loginAttempts: 24,
    securityScore: 92,
    dataAccess: 156,
    lastLogin: '2 hours ago',
    devicesConnected: 2
  });

  const [myAlerts, setMyAlerts] = useState([
    { id: 1, type: 'Security Alert', message: 'New login from unrecognized device', severity: 'medium', time: '2 hours ago', status: 'unread' },
    { id: 2, type: 'System Update', message: 'Security patches available for your device', severity: 'low', time: '5 hours ago', status: 'read' },
    { id: 3, type: 'Activity Alert', message: 'Unusual access pattern detected', severity: 'high', time: '1 day ago', status: 'read' },
    { id: 4, type: 'Security Alert', message: 'Password expiration in 7 days', severity: 'medium', time: '2 days ago', status: 'read' },
    { id: 5, type: 'System Update', message: 'Your security settings have been updated', severity: 'low', time: '3 days ago', status: 'read' }
  ]);

  const [myLogs, setMyLogs] = useState([
    { id: 1, action: 'Login', details: 'Successful login from 192.168.1.100', time: '2 hours ago', status: 'success' },
    { id: 2, action: 'File Access', details: 'Accessed project documents', time: '3 hours ago', status: 'success' },
    { id: 3, action: 'Login Attempt', details: 'Failed login from unknown device', time: '5 hours ago', status: 'warning' },
    { id: 4, action: 'Settings Change', details: 'Updated security preferences', time: '1 day ago', status: 'success' },
    { id: 5, action: 'Logout', details: 'Normal logout', time: '1 day ago', status: 'success' }
  ]);

  // Simulate personal stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalStats(prev => ({
        personalAlerts: Math.max(0, prev.personalAlerts + Math.floor(Math.random() * 3) - 1),
        loginAttempts: prev.loginAttempts + (Math.random() > 0.8 ? 1 : 0),
        securityScore: Math.max(85, Math.min(100, prev.securityScore + (Math.random() - 0.5) * 2)),
        dataAccess: prev.dataAccess + Math.floor(Math.random() * 5),
        devicesConnected: prev.devicesConnected
      }));

      setPersonalTrafficData(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(5, Math.min(50, value + (Math.random() - 0.5) * 5))
        )
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const personalStatCards = [
    {
      title: 'My Alerts',
      value: personalStats.personalAlerts,
      change: '-2',
      trend: 'down',
      icon: 'notifications',
      className: 'info'
    },
    {
      title: 'Login Attempts',
      value: personalStats.loginAttempts,
      change: '+1',
      trend: 'up',
      icon: 'login',
      className: 'success'
    },
    {
      title: 'Security Score',
      value: personalStats.securityScore,
      change: 'Good',
      trend: 'stable',
      icon: 'security',
      suffix: '%',
      className: 'success',
      formatValue: (val) => val.toFixed(0)
    },
    {
      title: 'Data Access',
      value: personalStats.dataAccess,
      change: '+5',
      trend: 'up',
      icon: 'folder',
      className: 'info'
    }
  ];

  const handleMarkAsRead = (alertId) => {
    setMyAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'read' } : alert
      )
    );
  };

  return (
    <div className="dashboard-page user-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">My Security Dashboard</h1>
        <p className="page-subtitle">Personal security monitoring and activity</p>
      </div>

      {/* Personal Stats Grid */}
      <div className="stats-grid user-stats">
        {personalStatCards.map((stat, index) => (
          <Card key={index} className={`stat-card user-stat ${stat.className || ''}`}>
            <div className="stat-content">
              <div className="stat-header">
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-title">{stat.title}</span>
              </div>
              <div className="stat-value">
                <AnimatedCounter 
                  value={stat.value}
                  className={`large ${stat.className || ''}`}
                  suffix={stat.suffix || ''}
                  formatValue={stat.formatValue || ((val) => val)}
                />
              </div>
              <div className="stat-change">
                <span className={`trend ${stat.trend}`}>
                  {stat.trend === 'up' && ' '}
                  {stat.trend === 'down' && ' '}
                  {stat.trend === 'stable' && ' '}
                </span>
                <span className="change-text">{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Personal Charts */}
      <div className="dashboard-charts user-charts">
        <Card className="traffic-chart user-chart">
          <LineChart 
            data={personalTrafficData} 
            title="My Network Activity (MB/s)"
            height={200}
            realTime={true}
          />
        </Card>

        <Card className="threat-chart user-chart">
          <PieChart 
            data={personalThreatData}
            title="My Security Events"
            height={200}
          />
        </Card>
      </div>

      {/* My Alerts and Logs */}
      <div className="dashboard-grid user-grid">
        <Card className="my-alerts">
          <div className="card-header">
            <h3>My Alerts</h3>
            <span className="badge badge-info">
              {myAlerts.filter(a => a.status === 'unread').length} unread
            </span>
          </div>
          <div className="alert-list">
            {myAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.severity} ${alert.status}`}
                onClick={() => alert.status === 'unread' && handleMarkAsRead(alert.id)}
              >
                <span className="alert-severity">{alert.severity}</span>
                <div className="alert-content">
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-message">{alert.message}</span>
                </div>
                <span className="alert-time">{alert.time}</span>
                {alert.status === 'unread' && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="my-logs">
          <div className="card-header">
            <h3>My Activity Logs</h3>
            <span className="badge badge-secondary">Last 7 days</span>
          </div>
          <div className="log-list">
            {myLogs.map((log) => (
              <div key={log.id} className={`log-item ${log.status}`}>
                <div className="log-action">{log.action}</div>
                <div className="log-details">{log.details}</div>
                <div className="log-time">{log.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <Card className="quick-stat-card">
          <div className="quick-stat-content">
            <span className="quick-stat-label">Last Login</span>
            <span className="quick-stat-value">{personalStats.lastLogin}</span>
          </div>
        </Card>
        <Card className="quick-stat-card">
          <div className="quick-stat-content">
            <span className="quick-stat-label">Connected Devices</span>
            <span className="quick-stat-value">{personalStats.devicesConnected}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
