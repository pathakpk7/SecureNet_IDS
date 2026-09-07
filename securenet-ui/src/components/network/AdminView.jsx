import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import LineChart from '../Charts/LineChart';
import PieChart from '../Charts/PieChart';
import '../../styles/pages/network.css';

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

      // Update live traffic stream
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
        setLiveTraffic(prev => [newTraffic, ...prev.slice(0, 7)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const globalTrafficStats = {
    totalTraffic: '4.2TB',
    activeConnections: 2147,
    blockedConnections: 892,
    suspiciousIPs: 23,
    peakBandwidth: '2.4Gbps',
    dataTransferred: '1.8TB'
  };

  const protocols = [
    { name: 'HTTP / HTTPS', traffic: '45%', connections: 1247, risk: 'low' },
    { name: 'SSH Protocol', traffic: '25%', connections: 523, risk: 'medium' },
    { name: 'FTP Traffic', traffic: '15%', connections: 156, risk: 'high' },
    { name: 'DNS Queries', traffic: '10%', connections: 892, risk: 'low' },
    { name: 'Other Ports', traffic: '5%', connections: 234, risk: 'low' }
  ];

  const handleBlockIP = (ip) => {
    setAllIPs(prev => 
      prev.map(item => 
        item.ip === ip ? { ...item, status: 'blocked', monitoring: false } : item
      )
    );
  };

  const handleToggleMonitor = (ip) => {
    setAllIPs(prev => 
      prev.map(item => 
        item.ip === ip ? { ...item, monitoring: !item.monitoring } : item
      )
    );
  };

  const handleGlobalMonitorToggle = () => {
    setMonitoringEnabled(prev => !prev);
  };

  const getRiskBadgeColor = (risk) => {
    switch (String(risk).toLowerCase()) {
      case 'critical': return '#ff3366';
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#34d399';
      default: return '#38bdf8';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (String(status).toLowerCase()) {
      case 'active': return '#34d399';
      case 'monitoring': return '#38bdf8';
      case 'suspicious': return '#fbbf24';
      case 'blocked': return '#f87171';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="network-container">
      {/* Header & Subtitle */}
      <div className="network-header">
        <h1 className="network-title">Network Monitor & Visibility</h1>
        <p className="network-sub">Full network visibility and control</p>
      </div>

      {/* Row 1: SINGLE COMPACT TOP BAR (Controls + 6 KPI Stats) */}
      <div className="nm-top-bar">
        <div className="nm-controls-group">
          <button 
            className={`nm-toggle-btn ${monitoringEnabled ? 'active' : 'inactive'}`}
            onClick={handleGlobalMonitorToggle}
          >
            {monitoringEnabled ? 'Monitoring ON' : 'Monitoring OFF'}
          </button>

          <div className="nm-time-selector">
            {['1h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                className={`range-btn ${selectedTimeRange === range ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange(range)}
              >
                {range === '1h' ? '1 Hour' : range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* 6 KPI Stats Pills in ONE ROW */}
        <div className="nm-kpi-row">
          <div className="nm-kpi-pill">
            <span className="val text-cyan">{globalTrafficStats.totalTraffic}</span>
            <span className="lbl">Total Traffic</span>
          </div>
          <div className="nm-kpi-pill">
            <span className="val text-emerald">{globalTrafficStats.activeConnections}</span>
            <span className="lbl">Active Connections</span>
          </div>
          <div className="nm-kpi-pill">
            <span className="val text-red">{globalTrafficStats.blockedConnections}</span>
            <span className="lbl">Blocked Connections</span>
          </div>
          <div className="nm-kpi-pill">
            <span className="val text-yellow">{globalTrafficStats.suspiciousIPs}</span>
            <span className="lbl">Suspicious IPs</span>
          </div>
          <div className="nm-kpi-pill">
            <span className="val text-cyan">{globalTrafficStats.peakBandwidth}</span>
            <span className="lbl">Peak Bandwidth</span>
          </div>
          <div className="nm-kpi-pill">
            <span className="val text-emerald">{globalTrafficStats.dataTransferred}</span>
            <span className="lbl">Data Transferred</span>
          </div>
        </div>
      </div>

      {/* Row 2: Full Network Traffic Analysis (2 GRAPHS IN ONE ROW: PieChart + LineChart) */}
      <div className="nm-charts-row">
        <Card className="nm-chart-card">
          <div className="nm-card-header">
            <h3>Threat Distribution Analysis</h3>
            <span className="nm-badge">Threat Categories</span>
          </div>
          <div className="nm-pie-container">
            <PieChart height={240} />
          </div>
        </Card>

        <Card className="nm-chart-card">
          <div className="nm-card-header">
            <h3>Full Network Traffic Analysis</h3>
            <span className="nm-badge live">LIVE STREAM</span>
          </div>
          <div className="nm-line-container">
            <LineChart 
              data={trafficData}
              title="Incoming vs Outgoing Bandwidth Flow (Mbps)"
              height={240}
              realTime={true}
            />
          </div>
        </Card>
      </div>

      {/* Row 3: All Network IPs (Structured Column Table View) */}
      <div className="nm-section">
        <Card className="nm-ips-card">
          <div className="nm-card-header">
            <h3>All Network IPs</h3>
            <span className="nm-badge">{allIPs.length} IPs Registered</span>
          </div>

          <div className="nm-ip-table">
            {/* Table Header */}
            <div className="nm-ip-table-header">
              <span>IP Address</span>
              <span>Status</span>
              <span>Traffic Volume</span>
              <span>Zone</span>
              <span>Risk Level</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Table Rows */}
            <div className="nm-ip-table-body">
              {allIPs.map((ipData, index) => (
                <div key={index} className="nm-ip-row">
                  <div className="ip-cell font-mono text-cyan font-bold">{ipData.ip}</div>
                  <div className="ip-cell">
                    <span 
                      className="nm-status-badge"
                      style={{ 
                        backgroundColor: `${getStatusBadgeColor(ipData.status)}18`, 
                        color: getStatusBadgeColor(ipData.status),
                        border: `1px solid ${getStatusBadgeColor(ipData.status)}40` 
                      }}
                    >
                      {ipData.status}
                    </span>
                  </div>
                  <div className="ip-cell font-semibold text-gray-200">{ipData.traffic}</div>
                  <div className="ip-cell text-gray-400">{ipData.location}</div>
                  <div className="ip-cell">
                    <span 
                      className="nm-risk-badge"
                      style={{ 
                        backgroundColor: `${getRiskBadgeColor(ipData.risk)}18`, 
                        color: getRiskBadgeColor(ipData.risk),
                        border: `1px solid ${getRiskBadgeColor(ipData.risk)}40` 
                      }}
                    >
                      {ipData.risk}
                    </span>
                  </div>
                  <div className="ip-cell actions-cell text-right">
                    <button 
                      className={`nm-btn-sm ${ipData.monitoring ? 'btn-active-mon' : 'btn-idle-mon'}`}
                      onClick={() => handleToggleMonitor(ipData.ip)}
                    >
                      {ipData.monitoring ? 'Monitoring' : 'Monitor'}
                    </button>
                    <button 
                      className="nm-btn-sm btn-block-action"
                      onClick={() => handleBlockIP(ipData.ip)}
                      disabled={ipData.status === 'blocked'}
                    >
                      {ipData.status === 'blocked' ? 'Blocked' : 'Block'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Live Tracking Feed & Smaller Protocol Analysis */}
      <div className="nm-bottom-row">
        {/* Visually Crisp Live Tracking Feed */}
        <Card className="nm-feed-card">
          <div className="nm-card-header">
            <h3>Live Traffic Feed</h3>
            <span className="nm-badge live">REAL-TIME STREAM</span>
          </div>

          <div className="nm-traffic-stream">
            {liveTraffic.map((traffic) => (
              <div key={traffic.id} className={`nm-stream-item ${traffic.status}`}>
                <div className="stream-flow">
                  <span className="src font-mono">{traffic.source}</span>
                  <span className="arrow">→</span>
                  <span className="dst font-mono">{traffic.dest}</span>
                </div>
                <div className="stream-details">
                  <span className="proto-badge">{traffic.protocol}</span>
                  <span className="size-text">{traffic.size}</span>
                  <span className="time-text">{traffic.time}</span>
                  <span className={`status-pill ${traffic.status}`}>{traffic.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Compact Protocol Analysis Card */}
        <Card className="nm-protocol-card">
          <div className="nm-card-header">
            <h3>Protocol Analysis</h3>
            <span className="nm-badge">5 Protocols</span>
          </div>

          <div className="nm-protocol-list">
            {protocols.map((protocol, index) => (
              <div key={index} className="nm-proto-item">
                <div className="proto-meta">
                  <span className="proto-name">{protocol.name}</span>
                  <span className="proto-pct">{protocol.traffic}</span>
                </div>
                <div className="proto-bar-bg">
                  <div 
                    className="proto-bar-fill" 
                    style={{ width: protocol.traffic }}
                  ></div>
                </div>
                <div className="proto-sub">
                  <span>{protocol.connections} connections</span>
                  <span className={`proto-risk-tag ${protocol.risk}`}>{protocol.risk} risk</span>
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
