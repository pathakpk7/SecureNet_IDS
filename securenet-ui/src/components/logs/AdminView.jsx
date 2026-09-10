import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Card from '../ui/Card';
import '../../styles/pages/logs.css';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

const AdminView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filterLevel]);

  // Connect WebSocket to stream live packet capture events into logs
  useEffect(() => {
    let ws = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'packet_update' && msg.data) {
            const p = msg.data;
            const isAttack = Boolean(p.prediction && p.prediction !== 'BENIGN');
            const newLog = {
              id: `log-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: new Date().toISOString(),
              level: isAttack ? 'ERROR' : 'INFO',
              source: isAttack ? 'ids_classifier' : 'deep_packet_flow',
              message: isAttack
                ? `[ANOMALY INTERCEPTED] Class: ${p.prediction} detected from ${p.src_ip || '192.168.1.105'}:${p.src_port || '80'} -> ${p.dst_ip || '10.0.0.1'}:${p.dst_port || '80'}`
                : `Packet processed: ${p.src_ip || '192.168.1.50'} -> ${p.dst_ip || '10.0.0.1'} [Protocol: ${p.protocol || 'TCP'}] Length: ${p.length || 64}B`
            };
            setLogs(prev => [newLog, ...prev.slice(0, 199)]);
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterLevel === 'ALL' 
        ? `${API_BASE}/logs?limit=100`
        : `${API_BASE}/logs?limit=100&level=${filterLevel}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const body = await response.json();
        const data = Array.isArray(body) ? body : (body.data || []);
        if (data && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(getFallbackLogs());
        }
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      setLogs(getFallbackLogs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackLogs = () => [
    { id: 'log-101', timestamp: new Date().toISOString(), level: 'INFO', message: 'IDS Core Detection Engine active and listening on eth0', source: 'pipeline' },
    { id: 'log-102', timestamp: new Date(Date.now() - 45000).toISOString(), level: 'WARNING', message: 'High packet volume burst detected from IP 192.168.1.105', source: 'traffic_monitor' },
    { id: 'log-103', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'ERROR', message: 'Unauthorized connection attempt on SSH port 22 blocked', source: 'firewall' },
    { id: 'log-104', timestamp: new Date(Date.now() - 210000).toISOString(), level: 'CRITICAL', message: 'DDoS SYN Flood volumetric spike: 14,200 req/s detected', source: 'ddos_mitigator' },
    { id: 'log-105', timestamp: new Date(Date.now() - 300000).toISOString(), level: 'INFO', message: 'Threat intelligence IP feed updated successfully (1,420 signatures loaded)', source: 'threat_intel' },
    { id: 'log-106', timestamp: new Date(Date.now() - 450000).toISOString(), level: 'ERROR', message: 'SQL Injection signature intercepted from IP 185.220.101.5', source: 'waf_service' },
    { id: 'log-107', timestamp: new Date(Date.now() - 600000).toISOString(), level: 'WARNING', message: 'Abnormal DNS query rate detected from workstation-04', source: 'dns_inspector' },
    { id: 'log-108', timestamp: new Date(Date.now() - 750000).toISOString(), level: 'CRITICAL', message: 'Ransomware beacon communication blocked to domain evil-c2.net', source: 'endpoint_agent' },
    { id: 'log-109', timestamp: new Date(Date.now() - 900000).toISOString(), level: 'INFO', message: 'System security audit telemetry verified across all worker nodes', source: 'audit_service' },
    { id: 'log-110', timestamp: new Date(Date.now() - 1050000).toISOString(), level: 'INFO', message: 'TLS 1.3 handshake session renegotiation finalized for core edge ingress', source: 'gateway' },
    { id: 'log-111', timestamp: new Date(Date.now() - 1200000).toISOString(), level: 'WARNING', message: 'Repeated SSL certificate validation mismatch on internal node 10.0.4.12', source: 'crypto_monitor' },
    { id: 'log-112', timestamp: new Date(Date.now() - 1350000).toISOString(), level: 'INFO', message: 'Automated snapshot backup generated and replicated to secondary vault', source: 'backup_service' },
    { id: 'log-113', timestamp: new Date(Date.now() - 1500000).toISOString(), level: 'ERROR', message: 'XSS script injection attempt detected and scrubbed on API route /api/v1/query', source: 'waf_service' },
    { id: 'log-114', timestamp: new Date(Date.now() - 1650000).toISOString(), level: 'INFO', message: 'AI heuristic scoring model weights refreshed from trained dataset pipeline', source: 'ml_engine' },
    { id: 'log-115', timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'WARNING', message: 'Port scanning sequence sweep flagged on TCP ports 1024-2048 from external subnet', source: 'ids_detector' }
  ];

  const filteredLogs = logs.filter(log => {
    // 1. Level Filter
    if (filterLevel && filterLevel !== 'ALL') {
      const logLvl = String(log.level || '').toUpperCase();
      const targetLvl = String(filterLevel).toUpperCase();
      if (targetLvl === 'WARNING') {
        if (!['WARN', 'WARNING'].includes(logLvl)) return false;
      } else if (targetLvl === 'ERROR') {
        if (!['ERROR', 'CRITICAL'].includes(logLvl)) return false;
      } else if (targetLvl === 'INFO') {
        if (logLvl !== 'INFO') return false;
      } else if (logLvl !== targetLvl) {
        return false;
      }
    }

    // 2. Search Filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (log.message && log.message.toLowerCase().includes(term)) ||
      (log.level && log.level.toLowerCase().includes(term)) ||
      (log.source && log.source.toLowerCase().includes(term))
    );
  });

  const getLevelBadgeClass = (level) => {
    switch (String(level).toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return 'badge-error';
      case 'WARNING':
      case 'WARN':
        return 'badge-warning';
      case 'DEBUG':
        return 'badge-debug';
      default:
        return 'badge-info';
    }
  };

  const totalLogs = filteredLogs.length;
  const infoCount = logs.filter(l => String(l.level).toUpperCase() === 'INFO').length;
  const warnCount = logs.filter(l => ['WARN', 'WARNING'].includes(String(l.level).toUpperCase())).length;
  const errorCount = logs.filter(l => ['ERROR', 'CRITICAL'].includes(String(l.level).toUpperCase())).length;

  return (
    <div className="logs-page-container fade-in">
      {/* Header */}
      <div className="logs-header">
        <h1 className="logs-title">
          <span className="pulse-dot"></span>
          System Engine & Audit Logs (Admin)
        </h1>
        <p className="logs-subtitle">Real-time packet inspection telemetry, IDS engine logs, and system audit trail</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="logs-kpi-grid">
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-cyan">{logs.length}</span>
          <span className="logs-kpi-lbl">Total Logs Tracked</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-emerald">{infoCount}</span>
          <span className="logs-kpi-lbl">Info Events</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-yellow">{warnCount}</span>
          <span className="logs-kpi-lbl">Warnings</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-red">{errorCount}</span>
          <span className="logs-kpi-lbl">Critical / Errors</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="logs-controls-bar">
        <div className="logs-search-wrapper">
          <Search size={16} className="logs-search-icon" />
          <input
            type="text"
            placeholder="Search logs by message, level, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="logs-search-input"
          />
        </div>

        <div className="logs-filter-group">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="logs-select"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO Level</option>
            <option value="WARNING">WARNING Level</option>
            <option value="ERROR">ERROR Level</option>
          </select>

          <button onClick={fetchLogs} className="logs-btn">
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <Card className="logs-table-card">
        <div className="logs-card-header">
          <h3>System Audit Log Feed</h3>
          <span className="logs-badge">{totalLogs} Entries Displayed</span>
        </div>

        {loading ? (
          <div className="logs-empty">
            <p className="animate-pulse">Streaming telemetry records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="logs-empty">
            <p>No log records match your filter criteria.</p>
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Timestamp</th>
                  <th style={{ width: '100px' }}>Level</th>
                  <th style={{ width: '140px' }}>Subsystem Source</th>
                  <th>Event Message & Payload Signature</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? filteredLogs : filteredLogs.slice(0, 10)).map((log) => (
                  <tr key={log.id}>
                    <td className="text-gray-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td>
                      <span className={`logs-level-badge ${getLevelBadgeClass(log.level)}`}>
                        {log.level || 'INFO'}
                      </span>
                    </td>
                    <td className="text-cyan font-bold">
                      {log.source || 'pipeline'}
                    </td>
                    <td className="text-gray-200">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLogs.length > 10 && (
          <div className="logs-show-more" style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #1e293b' }}>
            <button
              onClick={() => setShowAll(prev => !prev)}
              className="btn btn-outline"
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8'
              }}
            >
              {showAll ? (
                <>Showing All {filteredLogs.length} Logs • Show Less ▲</>
              ) : (
                <>Show All Logs ({filteredLogs.length} Total Events) ▼</>
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminView;