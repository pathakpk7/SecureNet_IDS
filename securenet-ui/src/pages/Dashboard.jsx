import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import '../styles/pages/dashboard.css';

const Dashboard = () => {
  // Debug safety check - remove this after testing
  console.log('Dashboard rendering - mobile working');
  
  const [trafficData, setTrafficData] = useState({
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    values: [120, 150, 180, 220, 190, 160]
  });

  const [threatData, setThreatData] = useState({
    labels: ['Malware', 'Phishing', 'DDoS', 'SQL Injection', 'Unknown'],
    values: [45, 28, 15, 8, 4]
  });

  const [stats, setStats] = useState({
    totalThreats: 2847,
    activeAlerts: 23,
    networkTraffic: 1200,
    systemStatus: 99.9
  });

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalThreats: prev.totalThreats + Math.floor(Math.random() * 3),
        activeAlerts: Math.max(0, prev.activeAlerts + Math.floor(Math.random() * 5) - 2),
        networkTraffic: Math.max(800, Math.min(2000, prev.networkTraffic + Math.floor(Math.random() * 100) - 50)),
        systemStatus: Math.max(95, Math.min(100, prev.systemStatus + (Math.random() - 0.5) * 0.5))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData(prev => ({
        ...prev,
        values: prev.values.map(value => 
          Math.max(50, Math.min(300, value + (Math.random() - 0.5) * 20))
        )
      }));
      
      // Add alert flash animation occasionally
      if (Math.random() > 0.7) {
        const alertCards = document.querySelectorAll('.recent-alerts');
        alertCards.forEach(card => {
          card.classList.add('alert-flash');
          setTimeout(() => card.classList.remove('alert-flash'), 500);
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Threats',
      value: stats.totalThreats,
      change: '+12%',
      trend: 'up',
      icon: 'warning',
      formatValue: (val) => val.toLocaleString()
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      change: '+5%',
      trend: 'up',
      icon: 'notifications',
      className: 'warning'
    },
    {
      title: 'Network Traffic',
      value: stats.networkTraffic,
      change: '-8%',
      trend: 'down',
      icon: 'network',
      suffix: 'GB',
      formatValue: (val) => (val / 1000).toFixed(1)
    },
    {
      title: 'System Status',
      value: stats.systemStatus,
      change: 'Stable',
      trend: 'stable',
      icon: 'check_circle',
      suffix: '%',
      className: 'success',
      formatValue: (val) => val.toFixed(1)
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="page-title">Security Dashboard</h1>
        <p className="page-subtitle">Real-time monitoring and threat analysis</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <Card key={index} className="stat-card">
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
                  {stat.trend === 'up' && 'arrow_upward'}
                  {stat.trend === 'down' && 'arrow_downward'}
                  {stat.trend === 'stable' && 'remove'}
                </span>
                <span className="change-text">{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="dashboard-charts">
        <Card className="traffic-chart">
          <LineChart 
            data={trafficData} 
            title="Network Traffic (GB/s)"
            height={300}
            realTime={true}
          />
        </Card>

        <Card className="threat-chart">
          <PieChart 
            data={threatData}
            title="Threat Distribution"
            height={300}
          />
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card className="recent-alerts">
          <div className="card-header">
            <h3>Recent Alerts</h3>
            <span className="badge badge-primary">View All</span>
          </div>
          <div className="alert-list">
            <div className="alert-item">
              <span className="alert-severity high">High</span>
              <span className="alert-message">Suspicious login attempt detected</span>
              <span className="alert-time">2 min ago</span>
            </div>
            <div className="alert-item">
              <span className="alert-severity medium">Medium</span>
              <span className="alert-message">Unusual network traffic pattern</span>
              <span className="alert-time">15 min ago</span>
            </div>
            <div className="alert-item">
              <span className="alert-severity low">Low</span>
              <span className="alert-message">Port scan detected</span>
              <span className="alert-time">1 hour ago</span>
            </div>
          </div>
        </Card>

        <Card className="system-status">
          <div className="card-header">
            <h3>System Status</h3>
            <span className="status-indicator online"></span>
          </div>
          <div className="status-metrics">
            <div className="status-item">
              <span className="status-label">CPU Usage</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <span className="status-value">45%</span>
            </div>
            <div className="status-item">
              <span className="status-label">Memory</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '62%' }}></div>
              </div>
              <span className="status-value">62%</span>
            </div>
            <div className="status-item">
              <span className="status-label">Storage</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '38%' }}></div>
              </div>
              <span className="status-value">38%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
