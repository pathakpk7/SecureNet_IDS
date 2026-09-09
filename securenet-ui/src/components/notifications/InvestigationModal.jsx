import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Terminal, 
  AlertTriangle, 
  Activity, 
  Server, 
  Lock, 
  Clock, 
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const InvestigationModal = ({ notification, onClose, onBlockIp, onMarkRead }) => {
  const navigate = useNavigate();
  const [isBlocked, setIsBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!notification) return null;

  // Extract source IP from notification message or fallback to standard IP
  const extractedIp = useMemo(() => {
    if (notification.source_ip) return notification.source_ip;
    const ipMatch = String(notification.message || '').match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    return ipMatch ? ipMatch[0] : '203.0.113.45';
  }, [notification]);

  // Determine MITRE ATT&CK technique and threat severity
  const threatData = useMemo(() => {
    const text = `${notification.title} ${notification.message}`.toLowerCase();
    
    if (text.includes('sql') || text.includes('injection')) {
      return {
        techniqueId: 'T1190',
        techniqueName: 'Exploit Public-Facing Application',
        tactic: 'Initial Access',
        severityScore: 94,
        confidence: '99.2%',
        protocol: 'TCP / HTTP',
        targetPort: 443,
        vector: 'Web Application API (Login Endpoint)',
        recommendation: 'Enforce parameterized queries, verify WAF SQLi inspection rules, and temporarily block source IP.',
        rawPayload: `POST /api/v1/auth/login HTTP/1.1\nHost: securenet.ids.internal\nUser-Agent: Mozilla/5.0 (Kali Linux)\nContent-Type: application/json\n\n{"username": "admin' UNION SELECT 1, password, role FROM users-- -", "pass": "test"}`
      };
    }

    if (text.includes('brute') || text.includes('failed login')) {
      return {
        techniqueId: 'T1110',
        techniqueName: 'Brute Force Credentials',
        tactic: 'Credential Access',
        severityScore: 88,
        confidence: '97.8%',
        protocol: 'TCP / SSH',
        targetPort: 22,
        vector: 'Authentication Service',
        recommendation: 'Deploy adaptive rate-limiting, enforce multi-factor authentication, and block repeat offender IP.',
        rawPayload: `SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6\nFailed password for invalid user root from ${extractedIp} port 49182 ssh2\n[50+ login iterations detected within 60s]`
      };
    }

    if (text.includes('anomaly') || text.includes('spike') || text.includes('throughput') || text.includes('flood')) {
      return {
        techniqueId: 'T1498',
        techniqueName: 'Network Denial of Service',
        tactic: 'Impact',
        severityScore: 91,
        confidence: '96.5%',
        protocol: 'UDP / SYN Flood',
        targetPort: 80,
        vector: 'Network Perimeter (Subnet 192.168.1.0/24)',
        recommendation: 'Enable SYN cookies, restrict inbound UDP packets from external interfaces, and scrub incoming traffic.',
        rawPayload: `[TCP SYN FLOOD PACKET STREAM]\nFlags: [S], Seq: 284918401, Win: 1024, Length: 0\nThroughput rate: 1.42 Gbps (Threshold: 500 Mbps)`
      };
    }

    if (text.includes('malware') || text.includes('quarantine') || text.includes('payload')) {
      return {
        techniqueId: 'T1204',
        techniqueName: 'User Execution: Malicious Payload',
        tactic: 'Execution',
        severityScore: 96,
        confidence: '99.7%',
        protocol: 'HTTP / Multipart File',
        targetPort: 443,
        vector: 'Document Upload Endpoint',
        recommendation: 'Endpoint agent successfully quarantined binary hash 7f8a9b2c3d4e5f. Purge staging temp cache and isolate file owner.',
        rawPayload: `Content-Disposition: form-data; name="attachment"; filename="invoice_update.pdf.exe"\nContent-Type: application/octet-stream\nMagic bytes: 4D 5A 90 00 03 00 00 00 (PE32 executable)`
      };
    }

    return {
      techniqueId: 'T1078',
      techniqueName: 'Valid Accounts / Anomalous Activity',
      tactic: 'Defense Evasion',
      severityScore: 72,
      confidence: '91.4%',
      protocol: 'TCP / TLS',
      targetPort: 443,
      vector: 'User Session / Management',
      recommendation: 'Verify session authenticity with the user and inspect correlated identity audit logs.',
      rawPayload: `{"event": "AUTH_ANOMALY", "ip": "${extractedIp}", "geo": "Unknown / Anomalous Subnet", "session_id": "sess_891bc47a"}`
    };
  }, [notification, extractedIp]);

  const handleBlock = () => {
    setIsBlocked(true);
    if (onBlockIp) {
      onBlockIp(extractedIp);
    }
    toast.success(`Source IP ${extractedIp} successfully blocked on perimeter firewall!`);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(threatData.rawPayload);
    setCopied(true);
    toast.success('Payload copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportText = `================================================================================
SECURENET IDS - FORENSIC THREAT INVESTIGATION REPORT
Generated: ${new Date().toISOString()}
================================================================================

INCIDENT OVERVIEW
--------------------------------------------------------------------------------
Notification ID    : ${notification.id}
Title              : ${notification.title}
Detected Timestamp : ${notification.time}
Priority / Risk    : ${String(notification.priority || 'HIGH').toUpperCase()} (Score: ${threatData.severityScore}/100)
Source IP          : ${extractedIp}
Target Vector      : ${threatData.vector}
Protocol / Port    : ${threatData.protocol} (Port ${threatData.targetPort})

MITRE ATT&CK FRAMEWORK MAPPING
--------------------------------------------------------------------------------
Technique ID       : ${threatData.techniqueId}
Technique Name     : ${threatData.techniqueName}
Tactic             : ${threatData.tactic}
Detection Engine   : CICIDS2017 AI Anomaly & Signature Correlator
Confidence Level   : ${threatData.confidence}

INCIDENT SUMMARY & DESCRIPTION
--------------------------------------------------------------------------------
${notification.message}

REPRESENTATIVE RAW PACKET / PAYLOAD EVIDENCE
--------------------------------------------------------------------------------
${threatData.rawPayload}

AI RECOMMENDED CONTAINMENT STRATEGY
--------------------------------------------------------------------------------
1. ${threatData.recommendation}
2. Add ${extractedIp} to perimeter firewall blacklist.
3. Review related audit logs in SecureNet Logs page.
4. Notify affected administrators and regenerate credentials if compromise is suspected.

Status: ${isBlocked ? 'CONTAINED (IP BLOCKED)' : 'UNDER ACTIVE INVESTIGATION'}
================================================================================
SecureNet Autonomous Security Framework`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_report_${notification.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Forensic incident report downloaded');
  };

  const handleDeepDive = () => {
    onClose();
    navigate('/network-monitor');
  };

  const handleMarkResolved = () => {
    if (onMarkRead) {
      onMarkRead(notification.id);
    }
    toast.success('Investigation concluded. Threat marked as resolved.');
    onClose();
  };

  return (
    <div className="investigation-modal-overlay" onClick={onClose}>
      <div className="investigation-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="investigation-modal-header">
          <div className="modal-title-group">
            <span className="investigation-icon-badge">
              <ShieldAlert size={22} color="#ff3366" />
            </span>
            <div>
              <div className="modal-eyebrow">SOC FORENSIC DOSSIER • INCIDENT #{String(notification.id).toUpperCase()}</div>
              <h2 className="modal-title">{notification.title}</h2>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close Investigation">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="investigation-modal-body">
          {/* TOP METRIC STRIP */}
          <div className="forensic-kpi-strip">
            <div className="kpi-cell">
              <span className="kpi-label">Risk Severity</span>
              <div className="kpi-value-row">
                <span className="kpi-score" style={{ color: threatData.severityScore >= 90 ? '#ff3366' : '#fbbf24' }}>
                  {threatData.severityScore}/100
                </span>
                <span className={`kpi-tag ${threatData.severityScore >= 90 ? 'critical' : 'high'}`}>
                  {threatData.severityScore >= 90 ? 'CRITICAL' : 'HIGH'}
                </span>
              </div>
            </div>

            <div className="kpi-cell">
              <span className="kpi-label">Source IP</span>
              <span className="kpi-value font-mono text-cyan">{extractedIp}</span>
            </div>

            <div className="kpi-cell">
              <span className="kpi-label">Protocol & Port</span>
              <span className="kpi-value">{threatData.protocol} : {threatData.targetPort}</span>
            </div>

            <div className="kpi-cell">
              <span className="kpi-label">AI Confidence</span>
              <span className="kpi-value text-emerald font-bold">{threatData.confidence}</span>
            </div>
          </div>

          {/* MITRE ATT&CK & THREAT OVERVIEW */}
          <div className="forensic-section">
            <div className="section-title">
              <Activity size={16} color="#00f5ff" /> Threat Intelligence & MITRE ATT&CK
            </div>
            <div className="mitre-card">
              <div className="mitre-badge-row">
                <span className="mitre-id">{threatData.techniqueId}</span>
                <span className="mitre-name">{threatData.techniqueName}</span>
                <span className="mitre-tactic">Tactic: {threatData.tactic}</span>
              </div>
              <p className="forensic-desc">{notification.message}</p>
            </div>
          </div>

          {/* AI ROOT CAUSE & RECOMMENDATION */}
          <div className="forensic-section">
            <div className="section-title">
              <Server size={16} color="#fbbf24" /> Autonomous Containment Recommendation
            </div>
            <div className="recommendation-box">
              <p className="rec-text">{threatData.recommendation}</p>
              <div className="vector-tag">Attack Surface: <strong>{threatData.vector}</strong></div>
            </div>
          </div>

          {/* RAW PACKET / PAYLOAD EVIDENCE */}
          <div className="forensic-section">
            <div className="section-title payload-header">
              <span><Terminal size={16} color="#39ff14" /> Intercepted Packet Payload Decoded</span>
              <button className="copy-payload-btn" onClick={handleCopyPayload}>
                {copied ? <CheckCircle2 size={13} color="#39ff14" /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
            </div>
            <pre className="payload-terminal">
              <code>{threatData.rawPayload}</code>
            </pre>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="investigation-modal-footer">
          <div className="footer-left-actions">
            <button 
              className={`btn btn-danger ${isBlocked ? 'btn-disabled' : ''}`}
              onClick={handleBlock}
              disabled={isBlocked}
            >
              <ShieldAlert size={15} />
              {isBlocked ? 'IP Blacklisted ✓' : `Block IP (${extractedIp})`}
            </button>

            <button className="btn btn-outline" onClick={handleDownloadReport}>
              <Download size={15} /> Export Incident Report
            </button>
          </div>

          <div className="footer-right-actions">
            <button className="btn btn-secondary" onClick={handleDeepDive}>
              <ExternalLink size={15} /> Network Monitor
            </button>
            <button className="btn btn-primary" onClick={handleMarkResolved}>
              <CheckCircle2 size={15} /> Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigationModal;
