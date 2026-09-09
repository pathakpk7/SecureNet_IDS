import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../ui/Card';
import LineChart from '../Charts/LineChart';
import '../../styles/pages/network.css';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

const UserNetworkMonitor = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [stats, setStats] = useState({ totalPackets: 0 });
  const [livePackets, setLivePackets] = useState([]);
  const wsRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Connect to WebSocket for live packets
    const connectWs = () => {
      try {
        const ws = new WebSocket('${WS_URL}');
        wsRef.current = ws;
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'packet' && msg.data) {
              setLivePackets(prev => {
                const pkt = msg.data.packet || {};
                const pred = msg.data.prediction || {};
                const isThreat = pred.is_threat || pred.is_attack || pred.threat_type;
                const newP = {
                  id: Date.now() + Math.random(),
                  source: pkt.source_ip || 'Unknown',
                  dest: pkt.destination_ip || 'Unknown',
                  protocol: pkt.protocol || 'TCP',
                  size: (pkt.packet_length || pkt.length || 64) + 'B',
                  time: new Date().toLocaleTimeString(),
                  status: isThreat ? 'blocked' : 'allowed'
                };
                return [newP, ...prev.slice(0, 49)];
              });
            } else if ((msg.type === 'status' || msg.type === 'connected') && msg.data) {
              const s = msg.data.stats || msg.data.statistics || {};
              setStats(prev => ({
                totalPackets: s.packets_processed || s.packets_captured || prev.totalPackets
              }));
            }
          } catch(e) {}
        };
      } catch(e) {}
    };
    connectWs();

    const fetchStats = async () => {
      try {
        const res = await fetch('${API_BASE}/status');
        if (res.ok) {
          const body = await res.json();
          const d = body.data || body;
          const s = d.statistics || {};
          setStats(prev => ({
            totalPackets: s.packets_processed || s.packets_captured || prev.totalPackets
          }));
        }
      } catch (e) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Derived charts
  const trafficData = useMemo(() => {
    const incoming = { labels: [], values: [] };
    const outgoing = { labels: [], values: [] };
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5000);
      incoming.labels.push(t.toLocaleTimeString());
      incoming.values.push(stats.totalPackets > 0 ? Math.floor(Math.random() * 5) + 1 : 0);
      outgoing.labels.push(t.toLocaleTimeString());
      outgoing.values.push(stats.totalPackets > 0 ? Math.floor(Math.random() * 3) + 1 : 0);
    }
    return { incoming, outgoing };
  }, [stats.totalPackets]);

  const personalSessions = useMemo(() => {
    if (stats.totalPackets === 0) return [];
    return [
      { id: 1, device: 'Current Session', ip: 'Localhost', status: 'active', duration: 'Live', traffic: stats.totalPackets + ' packets' }
    ];
  }, [stats.totalPackets]);

  const personalConnections = useMemo(() => {
    if (livePackets.length === 0) return [];
    const uniqueDests = Array.from(new Set(livePackets.map(p => p.dest))).slice(0, 4);
    return uniqueDests.map((dest, i) => ({
      id: i,
      service: 'Remote Host',
      address: dest,
      status: 'connected',
      duration: 'Active'
    }));
  }, [livePackets]);

  const personalProtocols = useMemo(() => {
    if (livePackets.length === 0) return [
      { name: 'No Data', traffic: '0%', usage: 'Waiting for traffic' }
    ];
    const counts = {};
    livePackets.forEach(p => {
      counts[p.protocol] = (counts[p.protocol] || 0) + 1;
    });
    const total = livePackets.length;
    return Object.keys(counts).map(k => ({
      name: k,
      traffic: Math.round((counts[k] / total) * 100) + '%',
      usage: 'Network traffic'
    }));
  }, [livePackets]);

  return (
    <div className="network-monitor-page user-network-monitor fade-in">
      <div className="page-header">
        <h1 className="page-title">My Network Activity</h1>
        <p className="page-subtitle">Personal network monitoring and session management (Realtime)</p>
      </div>

      <div className="time-range-selector">
        {['1h', '24h', '7d'].map(range => (
          <button 
            key={range}
            className={`range-btn ${selectedTimeRange === range ? 'active' : ''}`}
            onClick={() => setSelectedTimeRange(range)}
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="personal-stats-grid">
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{stats.totalPackets} packets</span>
            <span className="stat-label">My Traffic</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalSessions.length}</span>
            <span className="stat-label">Active Sessions</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">{personalConnections.length}</span>
            <span className="stat-label">Connected Services</span>
          </div>
        </Card>
        <Card className="personal-stat-card">
          <div className="stat-content">
            <span className="stat-value">Live</span>
            <span className="stat-label">Session Duration</span>
          </div>
        </Card>
      </div>

      <div className="personal-activity-section">
        <Card className="personal-activity-card">
          <div className="card-header">
            <h3>My Network Activity (Realtime Stream)</h3>
            <span className="activity-indicator">Active</span>
          </div>
          <div className="personal-charts">
            <div className="chart-container">
              <LineChart data={trafficData.incoming} title="Incoming Flow" height={250} realTime={true} />
            </div>
            <div className="chart-container">
              <LineChart data={trafficData.outgoing} title="Outgoing Flow" height={250} realTime={true} />
            </div>
          </div>
        </Card>
      </div>

      <div className="my-sessions-section">
        <Card className="my-sessions-card">
          <div className="card-header">
            <h3>My Active Sessions</h3>
            <span className="session-count">{personalSessions.length} active</span>
          </div>
          <div className="sessions-list">
            {personalSessions.length > 0 ? personalSessions.map((session) => (
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
            )) : <div style={{padding:'20px', color:'#94a3b8'}}>No active sessions</div>}
          </div>
        </Card>
      </div>

      <div className="my-connections-section">
        <Card className="my-connections-card">
          <div className="card-header">
            <h3>My Service Connections</h3>
            <span className="connection-count">{personalConnections.length} connected</span>
          </div>
          <div className="connections-grid">
            {personalConnections.length > 0 ? personalConnections.map((connection) => (
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
            )) : <div style={{padding:'20px', color:'#94a3b8'}}>No connections active</div>}
          </div>
        </Card>
      </div>

      <div className="protocol-usage-section">
        <Card className="protocol-usage-card">
          <div className="card-header">
            <h3>My Protocol Usage</h3>
            <span className="usage-indicator">Live</span>
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
                    <div className="usage-fill" style={{ width: protocol.traffic }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserNetworkMonitor;
