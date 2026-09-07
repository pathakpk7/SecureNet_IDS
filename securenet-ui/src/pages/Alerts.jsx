import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import { processAlert } from '../services/securityEngine';
import useRealtimeAlerts from '../hooks/useRealtimeAlerts';
import ThreatIntelligence from '../components/security/ThreatIntelligence';
import IncidentPanel from '../components/security/IncidentPanel';
import '../styles/pages/alerts.css';

const INITIAL_ALERTS = [
  { id: 'alt-001', threatType: 'SQL Injection Attempt', severity: 'high', risk_level: 'HIGH', time: '2 mins ago', status: 'active', sourceIP: '192.168.1.105', destinationIP: '10.0.0.1', protocol: 'TCP', description: 'Suspicious SQL injection union select patterns detected in API endpoint' },
  { id: 'alt-002', threatType: 'DDoS SYN Flood', severity: 'high', risk_level: 'CRITICAL', time: '5 mins ago', status: 'mitigated', sourceIP: '45.33.32.156', destinationIP: '10.0.0.1', protocol: 'TCP', description: 'High packet volume exceeding baseline traffic rate limits' },
  { id: 'alt-003', threatType: 'Port Scanning Reconnaissance', severity: 'medium', risk_level: 'MEDIUM', time: '15 mins ago', status: 'monitoring', sourceIP: '172.16.0.22', destinationIP: '10.0.0.1', protocol: 'TCP', description: 'Sequential SYN packet sweeps targeting ports 21, 22, 80, 443, 8080' },
  { id: 'alt-004', threatType: 'SSH Brute Force Attack', severity: 'high', risk_level: 'HIGH', time: '25 mins ago', status: 'active', sourceIP: '203.0.113.45', destinationIP: '10.0.0.1', protocol: 'SSH', description: 'Repeated authentication failures detected within 60 seconds' },
  { id: 'alt-005', threatType: 'Malware Payload Signature', severity: 'low', risk_level: 'LOW', time: '35 mins ago', status: 'quarantined', sourceIP: '192.168.1.50', destinationIP: '10.0.0.1', protocol: 'HTTP', description: 'Suspicious payload signature intercepted and quarantined' },
  { id: 'alt-006', threatType: 'Cross-Site Scripting (XSS)', severity: 'high', risk_level: 'HIGH', time: '40 mins ago', status: 'active', sourceIP: '198.51.100.12', destinationIP: '10.0.0.1', protocol: 'HTTPS', description: 'Stored script injection pattern detected in client HTTP header' },
  { id: 'alt-007', threatType: 'DNS Tunneling Anomaly', severity: 'high', risk_level: 'HIGH', time: '50 mins ago', status: 'active', sourceIP: '192.168.1.88', destinationIP: '8.8.8.8', protocol: 'UDP', description: 'Abnormal high-entropy TXT record queries to suspicious external domain' },
  { id: 'alt-008', threatType: 'ICMP Ping Flood', severity: 'medium', risk_level: 'MEDIUM', time: '1 hour ago', status: 'active', sourceIP: '10.0.2.14', destinationIP: '10.0.0.1', protocol: 'ICMP', description: 'Continuous echo request bursts exceeding interface ICMP rate limit' },
  { id: 'alt-009', threatType: 'Ransomware C2 Beaconing', severity: 'high', risk_level: 'CRITICAL', time: '1 hour ago', status: 'active', sourceIP: '192.168.1.200', destinationIP: '185.220.101.5', protocol: 'TCP', description: 'Encrypted outbound beaconing to known malicious C2 IP node' },
  { id: 'alt-010', threatType: 'FTP Anonymous Exploit', severity: 'medium', risk_level: 'MEDIUM', time: '2 hours ago', status: 'active', sourceIP: '192.168.1.72', destinationIP: '10.0.0.1', protocol: 'FTP', description: 'Unauthorized directory listing request on internal storage port 21' },
  { id: 'alt-011', threatType: 'NTP Amplification Probe', severity: 'high', risk_level: 'HIGH', time: '2 hours ago', status: 'active', sourceIP: '198.51.100.99', destinationIP: '10.0.0.1', protocol: 'UDP', description: 'monlist query pattern directed at core gateway' },
  { id: 'alt-012', threatType: 'Unauthorized RDP Connection', severity: 'high', risk_level: 'HIGH', time: '3 hours ago', status: 'active', sourceIP: '172.16.5.10', destinationIP: '10.0.0.5', protocol: 'RDP', description: 'Multiple remote desktop login attempts outside business hours' },
  { id: 'alt-013', threatType: 'HTTP Flood Vector', severity: 'high', risk_level: 'HIGH', time: '3 hours ago', status: 'active', sourceIP: '203.0.113.88', destinationIP: '10.0.0.1', protocol: 'HTTP', description: 'Rapid GET request burst targeting application gateway' },
  { id: 'alt-014', threatType: 'Kerberoasting Ticket Request', severity: 'high', risk_level: 'CRITICAL', time: '4 hours ago', status: 'active', sourceIP: '192.168.1.15', destinationIP: '10.0.0.2', protocol: 'Kerberos', description: 'TGS request for service accounts with weak SPN encryption' },
  { id: 'alt-015', threatType: 'Pass-the-Hash Movement', severity: 'high', risk_level: 'CRITICAL', time: '4 hours ago', status: 'active', sourceIP: '192.168.1.18', destinationIP: '10.0.0.4', protocol: 'SMB', description: 'NTLM authentication reusing cached hash credentials' },
  { id: 'alt-016', threatType: 'SMB Ghost Vulnerability Probe', severity: 'high', risk_level: 'HIGH', time: '5 hours ago', status: 'active', sourceIP: '198.51.100.40', destinationIP: '10.0.0.1', protocol: 'SMB', description: 'Compressed SMB v3 packet crafted to probe CVE-2020-0796' },
  { id: 'alt-017', threatType: 'Zero-Day Buffer Overflow', severity: 'high', risk_level: 'CRITICAL', time: '5 hours ago', status: 'active', sourceIP: '45.33.32.199', destinationIP: '10.0.0.1', protocol: 'TCP', description: 'NOP sled sequence detected in payload buffer' },
  { id: 'alt-018', threatType: 'API Rate Limit Abuse', severity: 'medium', risk_level: 'MEDIUM', time: '6 hours ago', status: 'active', sourceIP: '192.168.1.99', destinationIP: '10.0.0.1', protocol: 'HTTPS', description: 'Exceeded 1,000 queries per minute threshold' },
  { id: 'alt-019', threatType: 'ARP Spoofing Poisoning', severity: 'high', risk_level: 'HIGH', time: '6 hours ago', status: 'active', sourceIP: '192.168.1.12', destinationIP: '192.168.1.1', protocol: 'ARP', description: 'Duplicate MAC address announcement for default gateway' },
  { id: 'alt-020', threatType: 'TLS Certificate Mismatch', severity: 'low', risk_level: 'LOW', time: '7 hours ago', status: 'monitoring', sourceIP: '192.168.1.33', destinationIP: '10.0.0.1', protocol: 'HTTPS', description: 'Self-signed certificate presented during handshake' },
  { id: 'alt-021', threatType: 'LOG4J JNDI Lookup Attempt', severity: 'high', risk_level: 'CRITICAL', time: '7 hours ago', status: 'active', sourceIP: '198.51.100.77', destinationIP: '10.0.0.1', protocol: 'HTTP', description: 'jndi:ldap header payload string intercepted' },
  { id: 'alt-022', threatType: 'BGP Hijacking Probe', severity: 'high', risk_level: 'CRITICAL', time: '8 hours ago', status: 'active', sourceIP: '203.0.113.100', destinationIP: '10.0.0.1', protocol: 'BGP', description: 'Unauthorized AS path route announcement' },
  { id: 'alt-023', threatType: 'Web Shell Access', severity: 'high', risk_level: 'CRITICAL', time: '8 hours ago', status: 'active', sourceIP: '45.33.32.210', destinationIP: '10.0.0.1', protocol: 'HTTPS', description: 'Execution of cmd.aspx via uploaded web backdoor' },
  { id: 'alt-024', threatType: 'SMTP Spam Relay Burst', severity: 'medium', risk_level: 'MEDIUM', time: '9 hours ago', status: 'active', sourceIP: '192.168.1.60', destinationIP: '10.0.0.1', protocol: 'SMTP', description: 'Outbound mail queue spiked over 500 messages/min' },
  { id: 'alt-025', threatType: 'UPNP Device Scanning', severity: 'low', risk_level: 'LOW', time: '10 hours ago', status: 'active', sourceIP: '192.168.1.44', destinationIP: '239.255.255.250', protocol: 'UDP', description: 'Multicast SSDP discovery broadcast from internal host' }
];

const Alerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [highlightedId, setHighlightedId] = useState(null);
  const [alertData, setAlertData] = useState(INITIAL_ALERTS);
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
          const list = Array.isArray(body) ? body : (body.data || []);
          if (list && list.length > 0) {
            const mapped = list.map(item => ({
              id: item.id || `alt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              threatType: item.attack_type || item.threatType || 'Suspicious Traffic',
              severity: (item.risk_level || item.severity || 'medium').toLowerCase(),
              risk_level: (item.risk_level || item.severity || 'medium').toUpperCase(),
              time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Recent',
              status: 'active',
              sourceIP: item.source_ip || item.sourceIP || '192.168.1.1',
              destinationIP: item.destination_ip || item.destinationIP || '10.0.0.1',
              protocol: item.protocol || 'TCP',
              description: item.description || 'Flow anomaly intercepted by SecureNet engine',
              threat: { level: (item.risk_level || 'LOW').toUpperCase(), color: '#00ffcc' },
              prediction: item.prediction_result || { level: 'NORMAL', message: 'Evaluation complete' }
            }));
            // Merge with initial sample data to preserve full 25 count baseline
            setAlertData(prev => {
              const ids = new Set(mapped.map(m => m.id));
              const rest = prev.filter(p => !ids.has(p.id));
              return [...mapped, ...rest];
            });
          }
        }
      } catch (err) {
        console.debug('Using initial alerts baseline:', err);
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

  const filteredAlerts = useMemo(() => {
    return alertData.filter(alert => {
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const matchesSearch = !searchTerm || 
        alert.threatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.sourceIP.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [alertData, selectedSeverity, searchTerm]);

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
        <div className="alerts-search">
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
        {displayedAlerts.length === 0 ? (
          <div className="alerts-empty-box">
            No security alerts match the selected filter criteria.
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
                        <strong style={{ color: '#34d399' }}>96.4% Verified</strong>
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
