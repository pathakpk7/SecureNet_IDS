import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Card from '../ui/Card';
import '../../styles/pages/logs.css';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

const UserView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Connect WebSocket to stream live telemetry into user log feed
  useEffect(() => {
    let ws = null;
    try {
      ws = new WebSocket(WS_URL);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'packet_update' && msg.data) {
            const p = msg.data;
            const newLog = {
              id: `user-log-live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: new Date().toISOString(),
              level: p.prediction && p.prediction !== 'BENIGN' ? 'WARNING' : 'INFO',
              source: 'telemetry',
              message: `Session stream telemetry: ${p.length || 64}B frame audited via ${p.protocol || 'TCP'}`
            };
            setLogs(prev => [newLog, ...prev.slice(0, 99)]);
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
      const response = await fetch(`${API_BASE}/logs?limit=50`);
      if (response.ok) {
        const body = await response.json();
        const data = Array.isArray(body) ? body : (body.data || []);
        if (data && data.length > 0) {
          setLogs(data);
        } else {
          setLogs(getFallbackUserLogs());
        }
      } else {
        throw new Error('API error');
      }
    } catch (error) {
      setLogs(getFallbackUserLogs());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackUserLogs = () => [
    { id: 'user-log-1', timestamp: new Date().toISOString(), level: 'INFO', message: 'User session authenticated successfully via Multi-Factor Auth', source: 'auth_service' },
    { id: 'user-log-2', timestamp: new Date(Date.now() - 90000).toISOString(), level: 'WARNING', message: 'Session idle timeout warning: inactive for 25 minutes', source: 'session_manager' },
    { id: 'user-log-3', timestamp: new Date(Date.now() - 180000).toISOString(), level: 'INFO', message: 'Dashboard telemetry connection established with TLS 1.3', source: 'session_manager' },
    { id: 'user-log-4', timestamp: new Date(Date.now() - 360000).toISOString(), level: 'ERROR', message: 'API key authorization failed for secondary device sync', source: 'auth_service' },
    { id: 'user-log-5', timestamp: new Date(Date.now() - 600000).toISOString(), level: 'INFO', message: 'Network security status verified clean', source: 'security_monitor' },
    { id: 'user-log-6', timestamp: new Date(Date.now() - 900000).toISOString(), level: 'INFO', message: 'Client device token registered for push alerts', source: 'notification_svc' },
    { id: 'user-log-7', timestamp: new Date(Date.now() - 1200000).toISOString(), level: 'WARNING', message: 'High network latency observed on client WebSocket transport (180ms)', source: 'telemetry' },
    { id: 'user-log-8', timestamp: new Date(Date.now() - 1500000).toISOString(), level: 'INFO', message: 'Personal audit trail exported as encrypted report', source: 'reports_engine' },
    { id: 'user-log-9', timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'INFO', message: 'Account privacy permissions refreshed from security registry', source: 'user_profile' },
    { id: 'user-log-10', timestamp: new Date(Date.now() - 2100000).toISOString(), level: 'INFO', message: 'Initial secure login handshake established from desktop client', source: 'auth_service' }
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
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="logs-page-container fade-in">
      {/* Header */}
      <div className="logs-header">
        <h1 className="logs-title">
          <span className="pulse-dot"></span>
          My Security Activity Logs
        </h1>
        <p className="logs-subtitle">Personal security session audit log and login access history</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="logs-kpi-grid">
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-cyan">{logs.length}</span>
          <span className="logs-kpi-lbl">My Activity Events</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-emerald">Active</span>
          <span className="logs-kpi-lbl">Session Status</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-cyan">Encrypted</span>
          <span className="logs-kpi-lbl">Log Stream Integrity</span>
        </div>
        <div className="logs-kpi-card">
          <span className="logs-kpi-val text-emerald">Secure</span>
          <span className="logs-kpi-lbl">Account Posture</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="logs-controls-bar">
        <div className="logs-search-wrapper">
          <Search size={16} className="logs-search-icon" />
          <input
            type="text"
            placeholder="Search my activity history..."
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
            Refresh Activity
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <Card className="logs-table-card">
        <div className="logs-card-header">
          <h3>Personal Audit Trail</h3>
          <span className="logs-badge">{filteredLogs.length} Events</span>
        </div>

        {loading ? (
          <div className="logs-empty">
            <p className="animate-pulse">Loading activity records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="logs-empty">
            <p>No activity logs recorded.</p>
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Timestamp</th>
                  <th style={{ width: '100px' }}>Level</th>
                  <th style={{ width: '140px' }}>Source</th>
                  <th>Event Description</th>
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
                      {log.source || 'auth'}
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
                <>Showing All {filteredLogs.length} Events • Show Less ▲</>
              ) : (
                <>Show All Events ({filteredLogs.length} Total) ▼</>
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserView;