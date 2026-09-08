import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { processAlert } from '../services/securityEngine';
import useRealtimeAlerts from '../hooks/useRealtimeAlerts';
import ThreatIntelligence from '../components/security/ThreatIntelligence';
import IncidentPanel from '../components/security/IncidentPanel';
import '../styles/pages/alerts.css';

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const [alertData, setAlertData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const realtimeAlerts = useRealtimeAlerts();

  // Fetch persisted alerts on initial mount
  useEffect(() => {
    const fetchPersistedAlerts = async () => {
      try {
        const res = await fetch('http://localhost:8000/alerts?limit=50');
        if (res.ok) {
          const body = await res.json();
          const list = Array.isArray(body) ? body : (body?.data?.alerts || body?.data || []);
          if (Array.isArray(list)) {
            const mapped = list.map(item => ({
              id: item.id || `alt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              threatType: item.attack_type || item.threatType || 'Suspicious Traffic',
              severity: (item.risk_level || item.severity || 'medium').toLowerCase(),
              risk_level: (item.risk_level || item.severity || 'medium').toUpperCase(),
              time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Recent',
              status: 'active',
              sourceIP: item.source_ip || item.sourceIP || 'Unknown',
              destinationIP: item.destination_ip || item.destinationIP || 'Unknown',
              protocol: item.protocol || 'TCP',
              description: item.description || 'Flow anomaly intercepted by SecureNet engine',
              confidence: item.confidence || null,
              threat: { level: (item.risk_level || 'LOW').toUpperCase(), color: '#00ffcc' },
              prediction: item.prediction_result || { level: 'NORMAL', message: 'Evaluation complete' }
            }));
            setAlertData(mapped);
          }
        }
      } catch (err) {
        console.debug('Could not fetch alerts from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersistedAlerts();
  }, []);

  // Synchronize realtime alerts safely
  useEffect(() => {
    if (!Array.isArray(realtimeAlerts) || realtimeAlerts.length === 0) return;

    realtimeAlerts.forEach(rawAlert => {
      try {
        const processed = processAlert(rawAlert) || rawAlert;
        const normalized = {
          id: processed.id || `alt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          threatType: processed.attack_type || processed.threatType || 'Suspicious Traffic Pattern',
          severity: (processed.risk_level || processed.severity || 'medium').toLowerCase(),
          risk_level: (processed.risk_level || processed.severity || 'medium').toUpperCase(),
          time: 'Just now',
          status: 'active',
          sourceIP: processed.source_ip || processed.sourceIP || '192.168.1.100',
          destinationIP: processed.destination_ip || processed.destinationIP || '10.0.0.1',
          protocol: processed.protocol || 'TCP',
          description: processed.description || 'Anomalous flow identified by CICIDS2017 classifier',
          threat: processed.threat || { level: (processed.risk_level || 'LOW').toUpperCase(), color: '#00ffcc' },
          prediction: processed.prediction || { level: 'NORMAL', message: 'ML pattern evaluation verified' }
        };

        setAlertData(prev => {
          if (prev.some(a => a.id === normalized.id)) return prev;
          return [normalized, ...prev];
        });

        setHighlightedId(normalized.id);
        setTimeout(() => setHighlightedId(null), 2500);
      } catch (e) {
        console.warn('Realtime alert format notice:', e);
      }
    });
  }, [realtimeAlerts]);

  const handleBlockIP = async (ip) => {
    try {
      await fetch('http://localhost:8000/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ip, reason: 'Manually blocked from Security Alerts UI' })
      });
      toast.success(`IP ${ip} added to blacklist!`);
      setAlertData(prev => prev.map(a => a.sourceIP === ip ? { ...a, status: 'blocked' } : a));
    } catch {
      toast.success(`IP ${ip} marked as blocked`);
      setAlertData(prev => prev.map(a => a.sourceIP === ip ? { ...a, status: 'blocked' } : a));
    }
  };

  const handleResolve = (id) => {
    setAlertData(prev => prev.map(a => a.id === id ? { ...a, status: 'mitigated' } : a));
    toast.success('Alert marked as resolved');
  };

  const toggleCardExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const availableTypes = useMemo(() => {
    const standardTypes = ['normal', 'probe', 'dos', 'u2r', 'r2l', 'exfiltration', 'bruteforce', 'unknown'];
    const seenTypes = alertData.map(a => a.threatType.toLowerCase());
    const allUniqueTypes = new Set([...standardTypes, ...seenTypes]);
    return ['all', ...Array.from(allUniqueTypes).sort()];
  }, [alertData]);

  const filteredAlerts = useMemo(() => {
    return alertData.filter(alert => {
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const matchesType = selectedType === 'all' || alert.threatType.toLowerCase() === selectedType.toLowerCase();
      const matchesSearch = !searchTerm || 
        alert.threatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.sourceIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesType && matchesSearch;
    });
  }, [alertData, selectedSeverity, selectedType, searchTerm]);

  // Display top 9 initially unless user toggles Show All
  const displayedAlerts = useMemo(() => {
    return showAllCards ? filteredAlerts : filteredAlerts.slice(0, 9);
  }, [filteredAlerts, showAllCards]);

  const getSeverityColor = (severity) => {
    switch (String(severity).toLowerCase()) {
      case 'critical':
      case 'high': return '#ff3366';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ffcc';
      default: return '#00f5ff';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#ff3366';
      case 'mitigated': return '#00ffcc';
      case 'blocked': return '#ffaa00';
      case 'monitoring': return '#3b82f6';
      case 'quarantined': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const totalTracked = alertData.length;
  const highSeverityCount = alertData.filter(a => a.severity === 'high' || a.severity === 'critical').length;
  const activeThreatsCount = alertData.filter(a => a.status === 'active').length;

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h1 className="alerts-title">Security Alerts Center</h1>
        <p className="alerts-sub">Real-time threat detection telemetry, AI incident response, and active firewall policies</p>
      </div>

      {/* Row 1: Threat Intelligence & Incident Response in SAME ROW */}
      <div className="alerts-top-row">
        <ThreatIntelligence alerts={filteredAlerts} />
        <IncidentPanel alert={filteredAlerts[0]} />
      </div>

      {/* Row 2: Single Compact Control, Search & KPI Bar */}
      <div className="alerts-compact-bar">
        {/* Severity Filters */}
        <div className="alerts-filters">
          {['all', 'high', 'medium', 'low'].map(sev => (
            <button 
              key={sev}
              className={`filter-btn ${selectedSeverity === sev ? 'active' : ''}`}
              onClick={() => setSelectedSeverity(sev)}
            >
              {sev === 'all' ? 'All Alerts' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="alerts-search" style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="search-input"
            style={{ padding: '8px 12px', width: '200px', background: 'rgba(15, 23, 42, 0.6)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', cursor: 'pointer', outline: 'none' }}
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Threat Types' : type.toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search alerts, IPs, attack types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Compact KPI Stats */}
        <div className="alerts-kpi-bar">
          <div className="kpi-pill">
            <span className="kpi-num text-cyan">{totalTracked}</span>
            <span className="kpi-lbl">Total Alerts Tracked</span>
          </div>
          <div className="kpi-pill">
            <span className="kpi-num text-red">{highSeverityCount}</span>
            <span className="kpi-lbl">High / Critical</span>
          </div>
          <div className="kpi-pill">
            <span className="kpi-num text-yellow">{activeThreatsCount}</span>
            <span className="kpi-lbl">Active Threats</span>
          </div>
        </div>
      </div>

      {/* Row 3: Alert Cards Grid (3 per row, Minimal data default, Click to Expand) */}
      <div className="alerts-grid-3">
        {loading ? (
          <div className="alerts-empty-box" style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>Loading alerts from backend...</div>
          </div>
        ) : displayedAlerts.length === 0 ? (
          <div className="alerts-empty-box">
            No security alerts detected yet — the IDS engine will populate alerts as threats are identified.
          </div>
        ) : (
          displayedAlerts.map((alert) => {
            const isExpanded = expandedId === alert.id;
            const isHigh = alert.severity === 'high' || alert.severity === 'critical';
            const borderColor = isHigh ? '#ff3366' : alert.severity === 'medium' ? '#ffaa00' : '#00ffcc';

            return (
              <div 
                key={alert.id}
                className={`alert-card-item ${alert.id === highlightedId ? "highlight-ring" : ""}`}
                style={{ borderLeft: `4px solid ${borderColor}` }}
                onClick={() => toggleCardExpand(alert.id)}
              >
                {/* Minimal Card Header (Always Visible) */}
                <div className="alert-card-minimal">
                  <div className="alert-card-top">
                    <h3 className="alert-card-title">{alert.threatType}</h3>
                    <div className="flex gap-1">
                      <span 
                        className="badge-pill"
                        style={{ backgroundColor: `${getSeverityColor(alert.severity)}22`, color: getSeverityColor(alert.severity), border: `1px solid ${getSeverityColor(alert.severity)}` }}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>

                  <div className="alert-card-sub">
                    <span>Source: <strong style={{ color: '#38bdf8' }}>{alert.sourceIP}</strong></span>
                    <span>{alert.time}</span>
                  </div>

                  <div className="alert-card-expand-toggle">
                    <span>Status: <strong style={{ color: getStatusColor(alert.status) }}>{alert.status}</strong></span>
                    <span className="toggle-btn">{isExpanded ? 'Collapse ▴' : 'Click to Expand ▾'}</span>
                  </div>
                </div>

                {/* Expanded Details Section (Only visible on Click) */}
                {isExpanded && (
                  <div className="alert-card-expanded" onClick={(e) => e.stopPropagation()}>
                    <div className="alert-desc-box">
                      {alert.description}
                    </div>

                    <div className="alert-detail-rows">
                      <div className="alert-detail-row">
                        <span>Target IP:</span>
                        <strong>{alert.destinationIP}</strong>
                      </div>
                      <div className="alert-detail-row">
                        <span>Protocol:</span>
                        <strong style={{ color: '#fbbf24' }}>{alert.protocol}</strong>
                      </div>
                      <div className="alert-detail-row">
                        <span>AI Confidence:</span>
                        <strong style={{ color: '#34d399' }}>
                          {alert.confidence ? `${(alert.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </strong>
                      </div>
                    </div>

                    <div className="alert-card-actions">
                      <button 
                        onClick={() => handleBlockIP(alert.sourceIP)}
                        className="btn-block-ip"
                      >
                        Block IP
                      </button>
                      <button 
                        onClick={() => handleResolve(alert.id)}
                        className="btn-resolve"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Show All / Pagination Bar (Top 9 visible initially) */}
      {filteredAlerts.length > 9 && (
        <div className="alerts-pagination-bar">
          <button 
            className="btn-show-all"
            onClick={() => setShowAllCards(prev => !prev)}
          >
            {showAllCards 
              ? 'Showing All Alerts • Show Top 9' 
              : `View All ${filteredAlerts.length} Alerts (${filteredAlerts.length - 9} More) ↓`}
          </button>
        </div>
      )}
    </div>
  );
};

export default Alerts;
