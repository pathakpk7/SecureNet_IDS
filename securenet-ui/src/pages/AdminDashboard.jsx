import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import '../styles/pages/dashboard.css';

const AdminDashboard = () => {
  const [trafficData, setTrafficData] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [120, 150, 180, 220, 190, 160]
  });

  const [threatData, setThreatData] = useState({
    labels: ['Malware', 'Phishing', 'DDoS', 'SQL Injection', 'Unknown'],
    values: [45, 28, 15, 8, 4]
  });

  const [globalStats, setGlobalStats] = useState({
    totalAttacks: 52847,
    systemHealth: 99.7,
    activeUsers: 127,
    blockedIPs: 892,
    deployedRules: 156,
    activeSessions: 342
  });

  const [userActivity, setUserActivity] = useState([
    { id: 1, user: 'admin', action: 'Blocked IP 192.168.1.100', time: '2 min ago', severity: 'high' },
    { id: 2, user: 'john.doe', action: 'Login from new device', time: '5 min ago', severity: 'medium' },
    { id: 3, user: 'jane.smith', action: 'Accessed sensitive files', time: '12 min ago', severity: 'medium' },
    { id: 4, user: 'admin', action: 'Deployed new firewall rule', time: '18 min ago', severity: 'low' },
    { id: 5, user: 'mike.wilson', action: 'Failed login attempt', time: '25 min ago', severity: 'high' }
  ]);

  const [liveThreatFeed, setLiveThreatFeed] = useState([
    { id: 1, type: 'DDoS Attack', source: '185.220.101.182', target: 'Main Server', severity: 'critical', time: 'Just now' },
    { id: 2, type: 'SQL Injection', source: '192.168.1.50', target: 'Database', severity: 'high', time: '1 min ago' },
    { id: 3, type: 'Port Scan', source: '10.0.0.15', target: 'Network', severity: 'medium', time: '3 min ago' },
    { id: 4, type: 'Malware', source: '172.16.0.5', target: 'Workstation', severity: 'high', time: '5 min ago' },
    { id: 5, type: 'Phishing', source: 'external', target: 'Email Server', severity: 'medium', time: '8 min ago' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        totalAttacks: prev.totalAttacks + Math.floor(Math.random() * 5),
        systemHealth: Math.max(95, Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 0.3)),
        activeUsers: Math.max(100, Math.min(200, prev.activeUsers + Math.floor(Math.random() * 3) - 1)),
        blockedIPs: prev.blockedIPs + (Math.random() > 0.8 ? 1 : 0),
        deployedRules: prev.deployedRules + (Math.random() > 0.9 ? 1 : 0),
        activeSessions: Math.max(200, Math.min(500, prev.activeSessions + Math.floor(Math.random() * 10) - 5))
      }));

      // Update live threat feed
      if (Math.random() > 0.7) {
        const newThreat = {
          id: Date.now(),
          type: ['DDoS Attack', 'SQL Injection', 'Port Scan', 'Malware', 'Phishing'][Math.floor(Math.random() * 5)],
          source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          target: ['Main Server', 'Database', 'Network', 'Workstation', 'Email Server'][Math.floor(Math.random() * 5)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          time: 'Just now'
        };
        setLiveThreatFeed(prev => [newThreat, ...prev.slice(0, 4)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const globalStatCards = [
    {
      title: 'Total Attacks',
      value: globalStats.totalAttacks,
      change: '+18%',
      trend: 'up',
      icon: 'warning',
      formatValue: (val) => val.toLocaleString(),
      className: 'critical'
    },
    {
      title: 'System Health',
      value: globalStats.systemHealth,
      change: 'Stable',
      trend: 'stable',
      icon: 'health',
      suffix: '%',
      className: 'success',
      formatValue: (val) => val.toFixed(1)
    },
    {
      title: 'Active Users',
      value: globalStats.activeUsers,
      change: '+5%',
      trend: 'up',
      icon: 'people',
      className: 'info'
    },
    {
      title: 'Blocked IPs',
      value: globalStats.blockedIPs,
      change: '+12%',
      trend: 'up',
      icon: 'block',
      className: 'warning'
    },
    {
      title: 'Deployed Rules',
      value: globalStats.deployedRules,
      change: '+3',
      trend: 'up',
      icon: 'shield',
      className: 'success'
    },
    {
      title: 'Active Sessions',
      value: globalStats.activeSessions,
      change: '-2%',
      trend: 'down',
      icon: 'session',
      className: 'info'
    }
  ];

  const handleBlockIP = () => {
    const ip = prompt('Enter IP address to block:');
    if (ip) {
      console.log(`Blocking IP: ${ip}`);
      // Add actual blocking logic here
    }
  };

  const handleDeployRule = () => {
    const rule = prompt('Enter rule description:');
    if (rule) {
      console.log(`Deploying rule: ${rule}`);
      // Add actual rule deployment logic here
    }
  };

  const handleKillSession = () => {
    const sessionId = prompt('Enter session ID to kill:');
    if (sessionId) {
      console.log(`Killing session: ${sessionId}`);
      // Add actual session killing logic here
    }
  };

  return (
    <div className="dashboard-page admin-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Admin Security Dashboard</h1>
        <p className="page-subtitle">Global system monitoring and threat management</p>
      </div>

      {/* Admin Control Buttons */}
      <div className="admin-controls">
        <button className="control-button block-ip" onClick={handleBlockIP}>
          <span className="button-icon">block</span>
          Block IP
        </button>
        <button className="control-button deploy-rule" onClick={handleDeployRule}>
          <span className="button-icon">shield</span>
          Deploy Rule
        </button>
        <button className="control-button kill-session" onClick={handleKillSession}>
          <span className="button-icon">close</span>
          Kill Session
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="stats-grid admin-stats">
        {globalStatCards.map((stat, index) => (
          <Card key={index} className={`stat-card admin-stat ${stat.className || ''}`}>
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

      {/* Charts Section */}
      <div className="dashboard-charts admin-charts">
        <Card className="traffic-chart admin-chart">
          <LineChart 
            data={trafficData} 
            title="Global Network Traffic (GB/s)"
            height={250}
            realTime={true}
          />
        </Card>

        <Card className="threat-chart admin-chart">
          <PieChart 
            data={threatData}
            title="Global Threat Distribution"
            height={250}
          />
        </Card>
      </div>

      {/* User Activity and Live Threat Feed */}
      <div className="dashboard-grid admin-grid">
        <Card className="user-activity">
          <div className="card-header">
            <h3>All Users Activity</h3>
            <span className="badge badge-primary">Live</span>
          </div>
          <div className="activity-list">
            {userActivity.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.severity}`}>
                <div className="activity-user">{activity.user}</div>
                <div className="activity-action">{activity.action}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="live-threat-feed">
          <div className="card-header">
            <h3>Live Threat Feed</h3>
            <span className="badge badge-danger live-indicator">LIVE</span>
          </div>
          <div className="threat-list">
            {liveThreatFeed.map((threat) => (
              <div key={threat.id} className={`threat-item ${threat.severity}`}>
                <div className="threat-type">{threat.type}</div>
                <div className="threat-details">
                  <div className="threat-source">Source: {threat.source}</div>
                  <div className="threat-target">Target: {threat.target}</div>
                </div>
                <div className="threat-time">{threat.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
