import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import LineChart from '../components/charts/LineChart';
import '../styles/pages/network.css';

const AdminNetworkMonitor = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
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

  const [allIPs, setAllIPs] = useState([
    { ip: '192.168.1.100', status: 'active', traffic: '125MB', location: 'Internal', risk: 'low', monitoring: true },
    { ip: '10.0.0.15', status: 'active', traffic: '98MB', location: 'Internal', risk: 'medium', monitoring: true },
    { ip: '172.16.0.22', status: 'monitoring', traffic: '76MB', location: 'DMZ', risk: 'high', monitoring: true },
    { ip: '203.0.113.45', status: 'blocked', traffic: '54MB', location: 'External', risk: 'critical', monitoring: false },
    { ip: '192.168.1.50', status: 'active', traffic: '32MB', location: 'Internal', risk: 'low', monitoring: true },
    { ip: '8.8.8.8', status: 'active', traffic: '28MB', location: 'External', risk: 'low', monitoring: true },
    { ip: '172.16.0.5', status: 'suspicious', traffic: '156MB', location: 'DMZ', risk: 'high', monitoring: true },
    { ip: '192.168.1.200', status: 'active', traffic: '45MB', location: 'Internal', risk: 'medium', monitoring: true }
  ]);

  const [liveTraffic, setLiveTraffic] = useState([
    { id: 1, source: '192.168.1.100', dest: '8.8.8.8', protocol: 'DNS', size: '2KB', time: 'Just now', status: 'allowed' },
    { id: 2, source: '10.0.0.15', dest: '172.16.0.22', protocol: 'HTTP', size: '1.2MB', time: '2 sec ago', status: 'allowed' },
    { id: 3, source: '203.0.113.45', dest: '192.168.1.50', protocol: 'SSH', size: '8KB', time: '5 sec ago', status: 'blocked' },
    { id: 4, source: '172.16.0.5', dest: '192.168.1.100', protocol: 'HTTPS', size: '3.4MB', time: '8 sec ago', status: 'allowed' },
    { id: 5, source: '192.168.1.200', dest: '10.0.0.15', protocol: 'FTP', size: '156KB', time: '12 sec ago', status: 'allowed' }
  ]);

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

      // Update live traffic
      if (Math.random() > 0.6) {
        const newTraffic = {
          id: Date.now(),
          source: ['192.168.1.100', '10.0.0.15', '172.16.0.22', '192.168.1.50'][Math.floor(Math.random() * 4)],
          dest: ['8.8.8.8', '172.16.0.22', '192.168.1.100', '10.0.0.15'][Math.floor(Math.random() * 4)],
          protocol: ['HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP'][Math.floor(Math.random() * 5)],
          size: `${Math.floor(Math.random() * 5000)}KB`,
          time: 'Just now',
          status: Math.random() > 0.8 ? 'blocked' : 'allowed'
        };
        setLiveTraffic(prev => [newTraffic, ...prev.slice(0, 9)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const globalTrafficStats = {
    totalTraffic: '4.2TB',
    activeConnections: 2147,
    blockedConnections: 892,
    suspiciousIPs: 23,
    dataTransferred: '1.8TB',
    peakBandwidth: '2.4Gbps'
  };

  const protocols = [
    { name: 'HTTP/HTTPS', traffic: '45%', connections: 1247, risk: 'low' },
    { name: 'SSH', traffic: '25%', connections: 523, risk: 'medium' },
    { name: 'FTP', traffic: '15%', connections: 156, risk: 'high' },
    { name: 'DNS', traffic: '10%', connections: 892, risk: 'low' },
    { name: 'Other', traffic: '5%', connections: 234, risk: 'unknown' }
  ];

  const handleBlockIP = (ip) => {
    setAllIPs(prev => 
      prev.map(item => 
        item.ip === ip ? { ...item, status: 'blocked', monitoring: false } : item
      )
    );
    console.log(`Blocked IP: ${ip}`);
  };

  const handleToggleMonitor = (ip) => {
    setAllIPs(prev => 
      prev.map(item => 
        item.ip === ip ? { ...item, monitoring: !item.monitoring } : item
      )
    );
    console.log(`Toggled monitoring for IP: ${ip}`);
  };

  const handleGlobalMonitorToggle = () => {
    setMonitoringEnabled(prev => !prev);
    console.log(`Global monitoring ${!monitoringEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="network-monitor-page admin-network-monitor fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Network Monitor</h1>
        <p className="page-subtitle">Full network visibility and control</p>
        <button 
          className={`monitor-toggle-btn ${monitoringEnabled ? 'enabled' : 'disabled'}`}
          onClick={handleGlobalMonitorToggle}
        >
          {monitoringEnabled ? 'Monitoring ON' : 'Monitoring OFF'}
        </button>
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

      {/* Global Stats */}
      <div className="global-stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.totalTraffic}</span>
            <span className="stat-label">Total Traffic</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.activeConnections}</span>
            <span className="stat-label">Active Connections</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.blockedConnections}</span>
            <span className="stat-label">Blocked Connections</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.suspiciousIPs}</span>
            <span className="stat-label">Suspicious IPs</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.peakBandwidth}</span>
            <span className="stat-label">Peak Bandwidth</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{globalTrafficStats.dataTransferred}</span>
            <span className="stat-label">Data Transferred</span>
          </div>
        </Card>
      </div>

      {/* Full Network Graph */}
      <div className="full-network-graph">
        <Card className="network-graph-card">
          <div className="graph-header">
            <h3>Full Network Traffic Analysis</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="dual-charts">
            <div className="chart-section">
              <LineChart 
                data={trafficData.incoming}
                title="Incoming Traffic (Mbps)"
                height={200}
                realTime={true}
              />
            </div>
            <div className="chart-section">
              <LineChart 
                data={trafficData.outgoing}
                title="Outgoing Traffic (Mbps)"
                height={200}
                realTime={true}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* All IPs Section */}
      <div className="all-ips-section">
        <Card className="all-ips-card">
          <div className="card-header">
            <h3>All Network IPs</h3>
            <span className="ip-count">{allIPs.length} IPs</span>
          </div>
          <div className="ips-grid">
            {allIPs.map((ipData, index) => (
              <div key={index} className={`ip-card ${ipData.status} ${ipData.risk}`}>
                <div className="ip-header">
                  <span className="ip-address">{ipData.ip}</span>
                  <span className={`ip-status ${ipData.status}`}>{ipData.status}</span>
                </div>
                <div className="ip-details">
                  <span className="ip-traffic">{ipData.traffic}</span>
                  <span className="ip-location">{ipData.location}</span>
                  <span className={`ip-risk ${ipData.risk}`}>{ipData.risk}</span>
                </div>
                <div className="ip-controls">
                  <button 
                    className={`control-btn monitor-btn ${ipData.monitoring ? 'active' : ''}`}
                    onClick={() => handleToggleMonitor(ipData.ip)}
                  >
                    {ipData.monitoring ? 'Monitoring' : 'Monitor'}
                  </button>
                  <button 
                    className="control-btn block-btn"
                    onClick={() => handleBlockIP(ipData.ip)}
                    disabled={ipData.status === 'blocked'}
                  >
                    {ipData.status === 'blocked' ? 'Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live Traffic Feed */}
      <div className="live-traffic-section">
        <Card className="live-traffic-card">
          <div className="card-header">
            <h3>Live Traffic Feed</h3>
            <span className="live-indicator">LIVE</span>
          </div>
          <div className="traffic-feed">
            {liveTraffic.map((traffic) => (
              <div key={traffic.id} className={`traffic-item ${traffic.status}`}>
                <div className="traffic-flow">
                  <span className="traffic-source">{traffic.source}</span>
                  <span className="traffic-arrow">{'->'}</span>
                  <span className="traffic-dest">{traffic.dest}</span>
                </div>
                <div className="traffic-details">
                  <span className="traffic-protocol">{traffic.protocol}</span>
                  <span className="traffic-size">{traffic.size}</span>
                  <span className="traffic-time">{traffic.time}</span>
                  <span className={`traffic-status ${traffic.status}`}>{traffic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Protocol Analysis */}
      <div className="protocol-analysis">
        <Card className="protocols-card">
          <h3>Protocol Analysis</h3>
          <div className="protocol-grid">
            {protocols.map((protocol, index) => (
              <div key={index} className={`protocol-item ${protocol.risk}`}>
                <div className="protocol-header">
                  <span className="protocol-name">{protocol.name}</span>
                  <span className="protocol-traffic">{protocol.traffic}</span>
                </div>
                <div className="protocol-details">
                  <span className="protocol-connections">{protocol.connections} connections</span>
                  <span className={`protocol-risk ${protocol.risk}`}>{protocol.risk} risk</span>
                </div>
                <div className="protocol-bar">
                  <div 
                    className="protocol-fill" 
                    style={{ width: protocol.traffic }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminNetworkMonitor;
