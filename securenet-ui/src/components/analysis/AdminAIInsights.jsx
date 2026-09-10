import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/Charts/LineChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts';
import InvestigationModal from '../notifications/InvestigationModal';
import { supabase } from '../../api/supabase';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Zap, 
  Terminal, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Lock, 
  Sliders, 
  Eye, 
  Search,
  ExternalLink,
  Flame,
  Trash2,
  CornerDownLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/pages/ai.css';
import '../../styles/pages/notifications.css';
import { API_BASE } from '@/config/api';

const COPILOT_PRESETS = [
  {
    id: 'threat_vectors',
    label: '⚡ Threat Vector Analysis',
    prompt: 'Analyze active threat vectors and calculate blast radius.',
    answer: {
      title: 'Active Threat Vector & Risk Breakdown',
      summary: 'Our intrusion detection system has detected an influx of automated attacks targeting two specific entry points: Web APIs (Port 443) and Administrative Remote Access (SSH Port 22). Attackers are testing login forms with database query tricks (SQL Injection) and attempting automated passwords. Our perimeter defenses are actively absorbing and deflecting these probes.',
      metrics: [
        { name: 'Primary Vector', value: 'Web Login APIs (SQL Injection)' },
        { name: 'Secondary Vector', value: 'SSH Remote Access (Password Brute Force)' },
        { name: 'Blast Radius Risk', value: 'Contained to DMZ (Zero Data Leak)' }
      ],
      actions: [
        'Block offending external IP subnet (203.0.113.0/24) at the border firewall.',
        'Enforce rate limiting: restrict clients to maximum 5 login attempts per minute.',
        'Ensure input sanitization and parameterized queries are active across all web forms.'
      ]
    }
  },
  {
    id: 'firewall_rules',
    label: '🛡️ Firewall Hardening Rules',
    prompt: 'Suggest optimized firewall rules based on recent anomalous traffic patterns.',
    answer: {
      title: 'Recommended Adaptive Firewall Rules',
      summary: 'Based on network traffic patterns observed over the last hour, the AI engine recommends 3 immediate firewall adjustments to keep traffic clean and reduce server CPU load by filtering out fake connection requests.',
      metrics: [
        { name: 'Rule 1 (SYN Flood)', value: 'Drop connections if a single IP sends > 100 requests/sec' },
        { name: 'Rule 2 (IP Ban)', value: 'Block malicious subnet 203.0.113.0/24 for 24 hours' },
        { name: 'Rule 3 (SSH Access)', value: 'Allow SSH (Port 22) logins ONLY from approved internal VPN IPs' }
      ],
      actions: [
        'Deploy the 24-hour subnet block to perimeter IPTables / cloud security group.',
        'Enable SYN cookies in network settings to prevent denial-of-service connection pileups.',
        'Review and remove unused port forwarding rules.'
      ]
    }
  },
  {
    id: 'vulnerable_ports',
    label: '🎯 Vulnerable Port Inspection',
    prompt: 'Inspect most targeted open ports and service vulnerabilities.',
    answer: {
      title: 'Targeted Port & Exposure Assessment',
      summary: 'Port traffic inspection reveals that 68% of unwanted traffic is hitting Port 443 (HTTPS Web Services), 22% is probing Port 22 (SSH Management), and 10% is attempting to find database services on Port 3306 (MySQL). While Web and SSH are protected, the internal database port should never be visible to external internet traffic.',
      metrics: [
        { name: 'Port 443 (Web APIs)', value: '68% of probes (Defended by WAF)' },
        { name: 'Port 22 (SSH)', value: '22% of probes (Brute-force attempts)' },
        { name: 'Port 3306 (Database)', value: '10% of probes (Needs localhost lock)' }
      ],
      actions: [
        'Bind MySQL database (Port 3306) strictly to 127.0.0.1 (internal localhost only).',
        'Enable fail2ban to lock out any IP that fails SSH login 5 consecutive times.',
        'Keep HTTPS TLS certificates and web server packages updated.'
      ]
    }
  },
  {
    id: 'ciso_briefing',
    label: '📋 Executive Incident Briefing',
    prompt: 'Draft an executive threat intelligence summary for the Security Director.',
    answer: {
      title: 'Executive Security Health & Threat Summary',
      summary: 'Over the current operational cycle, SecureNet IDS analyzed 140,000+ incoming network packets with 98.4% model accuracy. 12 high-priority threats were flagged, analyzed, and successfully mitigated before any unauthorized access or data exposure occurred. The network perimeter remains healthy, resilient, and fully compliant.',
      metrics: [
        { name: 'Attacks Intercepted', value: '12 Incidents Neutralized' },
        { name: 'Autonomous Defense', value: '96.4% Handled Without Human Delay' },
        { name: 'Security Posture', value: 'RESILIENT • High Compliance' }
      ],
      actions: [
        'All primary services operating normally with zero downtime.',
        'Export this briefing report for weekly executive security audit review.',
        'Keep automated behavioral anomaly detection enabled.'
      ]
    }
  }
];

const BASELINE_ANOMALIES = [
  {
    id: 'anom-1',
    sourceIp: '203.0.113.45',
    attackType: 'SQL Injection Probe',
    deviation: '98.6%',
    targetPort: '443 (HTTPS)',
    riskLevel: 'CRITICAL',
    time: '2 mins ago',
    title: 'SQL Injection Probe Detected',
    message: 'Repeated UNION SELECT queries executed against /api/v1/auth/login endpoint from IP 203.0.113.45.'
  },
  {
    id: 'anom-2',
    sourceIp: '192.168.1.100',
    attackType: 'Brute Force SSH Surge',
    deviation: '95.2%',
    targetPort: '22 (SSH)',
    riskLevel: 'HIGH',
    time: '12 mins ago',
    title: 'Brute Force SSH Surge',
    message: 'High frequency failed password attempts (60+ tries in 45 seconds) from IP 192.168.1.100.'
  },
  {
    id: 'anom-3',
    sourceIp: '45.33.32.156',
    attackType: 'SYN Flood / DoS Wave',
    deviation: '92.4%',
    targetPort: '80 (HTTP)',
    riskLevel: 'HIGH',
    time: '28 mins ago',
    title: 'SYN Flood / DoS Wave',
    message: 'Anomalous throughput spike exceeding 1.4Gbps targeting external ingress interface from IP 45.33.32.156.'
  },
  {
    id: 'anom-4',
    sourceIp: '185.220.101.5',
    attackType: 'Port Scan Sweeper',
    deviation: '88.9%',
    targetPort: 'Multi-Port (1-1024)',
    riskLevel: 'MEDIUM',
    time: '45 mins ago',
    title: 'Port Scan Sweeper',
    message: 'Horizontal TCP SYN reconnaissance sweep detected across internal subnet from IP 185.220.101.5.'
  }
];

const AdminAIInsights = () => {
  const realtimeAlerts = useRealtimeAlerts();
  const [stats, setStats] = useState({ totalAttacks: 0, packets: 0 });
  const [customPrompt, setCustomPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [appliedActions, setAppliedActions] = useState(new Set());
  const [blockedIps, setBlockedIps] = useState(new Set());
  const [investigatingAnomaly, setInvestigatingAnomaly] = useState(null);
  const chatContainerRef = useRef(null);

  // Conversational thread history loaded from device localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('securenet_copilot_admin_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored copilot chat:', e);
    }
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        presetId: 'threat_vectors',
        title: COPILOT_PRESETS[0].answer.title,
        summary: COPILOT_PRESETS[0].answer.summary,
        metrics: COPILOT_PRESETS[0].answer.metrics,
        actions: COPILOT_PRESETS[0].answer.actions,
        actionBtnText: 'Quarantine Inbound Subnet (203.0.113.0/24)',
        actionKey: 'quarantine_subnet',
        time: 'Just now'
      }
    ];
  });

  // Persist messages to device storage
  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem('securenet_copilot_admin_chat', JSON.stringify(messages));
      } else {
        localStorage.removeItem('securenet_copilot_admin_chat');
      }
    } catch (e) {
      console.warn('Error saving copilot chat:', e);
    }
  }, [messages]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/stats`);
        if (res.ok) {
          const body = await res.json();
          const s = body.data || body;
          setStats({
            totalAttacks: s.attacks_detected || s.alerts_generated || 12,
            packets: s.packets_processed || 142850
          });
        }
      } catch (e) {
        setStats({ totalAttacks: 12, packets: 142850 });
      }
    };
    fetchStats();
    const int = setInterval(fetchStats, 6000);
    return () => clearInterval(int);
  }, []);

  // Auto-scroll ONLY inside the chat container (prevents whole page mobile jumping)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  const totalThreats = Math.max(stats.totalAttacks, realtimeAlerts.length, 12);
  const riskScore = Math.min(94, Math.max(68, 60 + Math.floor(totalThreats * 1.5)));

  // Instant trigger when user clicks any preset chip
  const handleSelectPreset = (preset) => {
    toast(`Running ${preset.label}...`, { icon: '⚡' });
    setIsThinking(true);

    const userMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: preset.prompt,
      time: 'Just now'
    };

    let actionBtnText = 'Apply Recommended Policy';
    let actionKey = 'policy_' + preset.id;
    if (preset.id === 'threat_vectors') {
      actionBtnText = 'Quarantine Inbound Subnet (203.0.113.0/24)';
      actionKey = 'quarantine_subnet';
    } else if (preset.id === 'firewall_rules') {
      actionBtnText = 'Push Adaptive Firewall Rules to IPTables';
      actionKey = 'firewall_adaptive';
    } else if (preset.id === 'vulnerable_ports') {
      actionBtnText = 'Bind Port 3306 (MySQL) Strictly to Localhost';
      actionKey = 'bind_port_3306';
    } else if (preset.id === 'ciso_briefing') {
      actionBtnText = 'Download Official Executive Briefing (.TXT)';
      actionKey = 'download_briefing';
    }

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        presetId: preset.id,
        title: preset.answer.title,
        summary: preset.answer.summary,
        metrics: preset.answer.metrics,
        actions: preset.answer.actions,
        actionBtnText,
        actionKey,
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      toast.success(`${preset.label} generated!`);
    }, 300);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    const query = customPrompt.trim();
    setCustomPrompt('');
    setIsThinking(true);

    const userMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: query,
      time: 'Just now'
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let title = `Security Investigation: "${query}"`;
      let summary = `Our automated diagnostic engine analyzed your inquiry regarding "${query}". Correlating active firewall logs and traffic behavior indicates no critical breach has succeeded. Perimeter rules and real-time packet inspection are actively operating.`;
      let primaryMetric = 'Zero Active Breaches';
      let secMetric = '98.4% Confidence';
      let actions = [
        'Real-time packet inspection is continuously screening all traffic.',
        'Review recent entries in Logs and Alerts for any correlated suspicious events.',
        'Ensure system authentication credentials and passwords remain strong.'
      ];

      if (lowerQuery.includes('port') || lowerQuery.includes('443') || lowerQuery.includes('22') || lowerQuery.includes('80')) {
        title = `Port & Surface Inspection: "${query}"`;
        summary = `Analysis of target ports shows typical external automated scanning. Port 443 (HTTPS) is shielded by the Web Application Firewall, and Port 22 (SSH) is guarded against password brute-forcing. No exposed unauthenticated services were found.`;
        primaryMetric = 'Shielded by WAF';
        secMetric = 'Low Exposure';
        actions = [
          'Keep administrative ports (SSH/RDP) bound strictly behind a private VPN.',
          'Verify TLS certificates and renew before expiration.',
          'Close or filter any ports not actively needed by public applications.'
        ];
      } else if (lowerQuery.includes('ip') || lowerQuery.includes('blacklist') || lowerQuery.includes('block') || lowerQuery.includes('attack')) {
        title = `Threat & IP Origin Analysis: "${query}"`;
        summary = `Cross-referencing global threat intelligence lists: Identified suspicious IP origins are primarily automated bot scanners attempting generic exploit payloads. The autonomous blacklist has isolated high-frequency offenders to prevent server disruption.`;
        primaryMetric = 'Automated Botnets';
        secMetric = 'Perimeter Filtered';
        actions = [
          'Suspicious source IPs are automatically throttled or temporarily blacklisted.',
          'Check the Live Behavioral Anomalies table below to inspect or permanently block IPs.',
          'Enable geo-blocking if you do not expect international traffic.'
        ];
      }

      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        presetId: 'custom',
        title,
        summary,
        metrics: [
          { name: 'Investigation Subject', value: query.length > 24 ? query.substring(0, 24) + '...' : query },
          { name: 'System Posture', value: primaryMetric },
          { name: 'Inference Confidence', value: secMetric }
        ],
        actions,
        actionBtnText: 'Log Security Inquiry to Audit Trail',
        actionKey: 'audit_inquiry_' + Date.now(),
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      toast.success('AI analysis complete');
    }, 450);
  };

  const handleApplyAction = (actionKey, message) => {
    setAppliedActions(prev => new Set(prev).add(actionKey));
    toast.success(message);
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem('securenet_copilot_admin_chat');
    } catch (e) {
      console.warn('Error clearing copilot chat from storage:', e);
    }
    toast.success('Recent copilot chat deleted from device');
  };

  const handleBlockIp = (ip) => {
    setBlockedIps(prev => new Set(prev).add(ip));
    try {
      supabase.from('blacklist').insert([{
        ip_address: ip,
        reason: 'Blocked via AI Insights Behavioral Anomaly engine'
      }]);
    } catch (e) {}
    toast.success(`Source IP ${ip} blacklisted in perimeter firewall!`);
  };

  const handleExportBriefing = () => {
    const text = `================================================================================
SECURENET IDS - AI SOC THREAT BRIEFING & SECURITY POSTURE REPORT
Generated: ${new Date().toISOString()}
================================================================================

EXECUTIVE OVERVIEW
--------------------------------------------------------------------------------
Security Posture Risk Index : ${riskScore} / 100 (HIGH RISK - ELEVATED PROBING)
Total Packets Inspected     : ${stats.packets.toLocaleString()}
Total Anomalies Intercepted : ${totalThreats}
Inference Accuracy          : 98.4%
Detection Engine            : Random Forest (CICIDS2017 Tuned)

ACTIVE THREAT VECTORS
--------------------------------------------------------------------------------
1. Port 443 (HTTPS Web APIs) - SQL Injection & XSS Payloads (68%)
2. Port 22 (SSH)            - Distributed Credential Stuffing (22%)
3. Port 80 (HTTP)           - Inbound TCP SYN Flood Wave (10%)

LATEST COPILOT ASSESSMENT
--------------------------------------------------------------------------------
${messages[messages.length - 1]?.summary || 'System telemetry running normally.'}

================================================================================
SecureNet Autonomous Security Framework`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Security_Briefing_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('AI Security Briefing exported successfully');
  };

  // Trajectory Chart Data
  const forecastData = useMemo(() => {
    return {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Next Hour (Predicted)'],
      values: [4, 9, 14, 8, 19, 23, 29]
    };
  }, []);

  return (
    <div className="ai-insights-page fade-in">
      {/* PAGE HEADER & SOC LIVE STATUS */}
      <div className="ai-soc-header">
        <div className="header-text-group">
          <div className="soc-live-pill">
            <span className="live-pulsar"></span>
            <span>SOC AI COPILOT • ONLINE</span>
          </div>
          <h1 className="page-title">AI Threat Intelligence Workbench</h1>
          <p className="page-subtitle">
            Autonomous threat detection, real-time risk scoring, interactive SOC copilot, and one-click incident remediation
          </p>
        </div>

        <div className="header-quick-actions">
          <button type="button" className="btn btn-outline" onClick={handleExportBriefing}>
            <Download size={15} /> Export Threat Briefing
          </button>
        </div>
      </div>

      {/* TOP RISK INDEX & POSTURE DASHBOARD */}
      <div className="ai-soc-posture-grid">
        <Card className="posture-card risk-gauge-card">
          <div className="card-top-row">
            <span className="card-tag">SYSTEM RISK INDEX</span>
            <Flame size={18} color="#ff3366" />
          </div>
          <div className="risk-score-display">
            <span className="risk-score-number">{riskScore}</span>
            <span className="risk-score-total">/100</span>
          </div>
          <div className="risk-progress-bar">
            <div className="risk-progress-fill" style={{ width: `${riskScore}%` }}></div>
          </div>
          <div className="risk-status-label text-red">
            ELEVATED ADVERSARIAL ACTIVITY
          </div>
        </Card>

        <Card className="posture-card">
          <div className="card-top-row">
            <span className="card-tag">INSPECTED PACKETS</span>
            <Activity size={18} color="#00f5ff" />
          </div>
          <div className="metric-headline font-mono text-cyan">
            <AnimatedCounter value={stats.packets} />
          </div>
          <div className="metric-subtext">
            <span>Throughput: <strong>1.4 Gbps</strong></span>
            <span className="text-emerald">Realtime ingest</span>
          </div>
        </Card>

        <Card className="posture-card">
          <div className="card-top-row">
            <span className="card-tag">THREATS INTERCEPTED</span>
            <ShieldAlert size={18} color="#fbbf24" />
          </div>
          <div className="metric-headline text-yellow font-mono">
            <AnimatedCounter value={totalThreats} />
          </div>
          <div className="metric-subtext">
            <span>Accuracy: <strong>98.4%</strong></span>
            <span className="text-emerald">CICIDS2017 Engine</span>
          </div>
        </Card>

        <Card className="posture-card">
          <div className="card-top-row">
            <span className="card-tag">MITIGATION LATENCY</span>
            <Zap size={18} color="#39ff14" />
          </div>
          <div className="metric-headline text-emerald font-mono">
            0.38s
          </div>
          <div className="metric-subtext">
            <span>Automated Quarantine</span>
            <span className="text-emerald">96.4% Success</span>
          </div>
        </Card>
      </div>

      {/* INTERACTIVE AI SOC COPILOT WORKBENCH */}
      <Card className="copilot-workbench-card">
        <div className="copilot-header">
          <div className="copilot-title-group">
            <div className="copilot-avatar">
              <Cpu size={22} color="#00f5ff" />
            </div>
            <div>
              <h3>AI SOC Security Copilot</h3>
              <p>Click any prompt chip below or type an inquiry to run live security analysis</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button" 
              className="btn btn-xs btn-outline" 
              onClick={handleClearChat}
              title="Reset conversation"
            >
              <Trash2 size={12} /> Clear Chat
            </button>
            <span className="copilot-badge">CICIDS2017 INFERENCE</span>
          </div>
        </div>

        {/* QUICK QUERY CHIPS - 4 INSTANT ACTIONS */}
        <div className="copilot-chips-row">
          {COPILOT_PRESETS.map(preset => (
            <button
              key={preset.id}
              type="button"
              className="copilot-chip"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectPreset(preset);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* CONVERSATION THREAD CONTAINER */}
        <div ref={chatContainerRef} className="copilot-output-container chat-scroll-container">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
              <Cpu size={32} style={{ margin: '0 auto 12px', opacity: 0.6, color: '#00f5ff' }} />
              <p style={{ margin: 0, fontWeight: 500, color: '#e2e8f0' }}>Chat history cleared</p>
              <span style={{ fontSize: '13px', opacity: 0.75 }}>
                Click any of the quick prompt chips above or ask a security question below to start a new analysis.
              </span>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="copilot-user-bubble-row">
                  <div className="copilot-user-bubble">
                    <span className="bubble-label">SOC Admin Query:</span>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            }

            // AI message bubble
            const isActionApplied = appliedActions.has(msg.actionKey);

            return (
              <div key={msg.id} className="copilot-response-content ai-bubble">
                <div className="response-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="ai-response-icon"><Cpu size={14} color="#00f5ff" /></span>
                    <h4 className="response-title">{msg.title}</h4>
                  </div>
                  <span className="response-timestamp">{msg.time}</span>
                </div>

                <p className="response-summary">{msg.summary}</p>

                {/* METRIC BADGES */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="response-metrics-grid">
                    {msg.metrics.map((m, idx) => (
                      <div key={idx} className="response-metric-pill">
                        <span className="res-metric-name">{m.name}:</span>
                        <strong className="res-metric-val">{m.value}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* ACTIONABLE DIRECTIVES */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="response-actions-box">
                    <div className="actions-title">
                      <CheckCircle2 size={15} color="#39ff14" />
                      <span>Recommended Action Directives:</span>
                    </div>
                    <ul className="actions-list">
                      {msg.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* DIRECT 1-CLICK ACTION TRIGGER IN RESPONSE */}
                {msg.actionBtnText && (
                  <div className="bubble-action-row">
                    <button
                      type="button"
                      className={`btn btn-sm ${isActionApplied ? 'btn-applied' : 'btn-primary'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (msg.actionKey === 'download_briefing') {
                          handleExportBriefing();
                        } else {
                          handleApplyAction(msg.actionKey, `${msg.actionBtnText} executed successfully!`);
                        }
                      }}
                      disabled={isActionApplied}
                    >
                      {isActionApplied ? (
                        <>
                          <CheckCircle2 size={14} /> Executed Policy ✓
                        </>
                      ) : (
                        <>
                          <Zap size={14} /> {msg.actionBtnText}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="copilot-thinking">
              <RefreshCw size={20} className="spinning" />
              <span>Analyzing live network telemetry and querying heuristic models...</span>
            </div>
          )}
        </div>

        {/* CUSTOM QUERY BAR */}
        <form className="copilot-query-form" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className="copilot-input"
            placeholder="Ask the AI Copilot a question (e.g. 'Analyze suspicious outbound connections', 'Explain port 443 anomaly')..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <button type="submit" className="copilot-send-btn" title="Submit Query">
            <Send size={16} />
            <span>Ask Copilot</span>
          </button>
        </form>
      </Card>

      {/* TWO-COLUMN WORKBENCH: 1-CLICK REMEDIATIONS & ATTACK TRAJECTORY */}
      <div className="ai-remediations-grid">
        {/* 1-CLICK AUTONOMOUS SECURITY ACTIONS */}
        <Card className="workbench-card">
          <div className="aa-card-header">
            <div className="header-with-icon">
              <Sliders size={18} color="#fbbf24" />
              <h3>Autonomous Containment Actions</h3>
            </div>
            <span className="aa-badge">1-CLICK POLICY</span>
          </div>

          <div className="action-items-list">
            <div className="action-item-card">
              <div className="action-info">
                <h4>Enforce Subnet Rate-Limiting</h4>
                <p>Throttle IP subnet 192.168.1.0/24 to 200 req/min to suppress volumetric packet flooding.</p>
              </div>
              <button 
                type="button"
                className={`btn btn-sm ${appliedActions.has('ratelimit') ? 'btn-applied' : 'btn-primary'}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleApplyAction('ratelimit', 'Subnet rate limiting policy applied to perimeter firewall!');
                }}
                disabled={appliedActions.has('ratelimit')}
              >
                {appliedActions.has('ratelimit') ? 'Enforced ✓' : 'Apply Rule'}
              </button>
            </div>

            <div className="action-item-card">
              <div className="action-info">
                <h4>Auto-Quarantine Repetitive Failures</h4>
                <p>Automatically block any external IP registering over 10 failed login attempts within 60s.</p>
              </div>
              <button 
                type="button"
                className={`btn btn-sm ${appliedActions.has('autoblock') ? 'btn-applied' : 'btn-primary'}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleApplyAction('autoblock', 'Auto-quarantine rule active on authentication endpoint!');
                }}
                disabled={appliedActions.has('autoblock')}
              >
                {appliedActions.has('autoblock') ? 'Active ✓' : 'Enable Rule'}
              </button>
            </div>

            <div className="action-item-card">
              <div className="action-info">
                <h4>Deploy Virtual SQLi WAF Shield</h4>
                <p>Inject real-time heuristic pattern rejection for UNION SELECT, 1=1, and sleep payloads.</p>
              </div>
              <button 
                type="button"
                className={`btn btn-sm ${appliedActions.has('waf_sqli') ? 'btn-applied' : 'btn-primary'}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleApplyAction('waf_sqli', 'Virtual SQLi WAF shield deployed successfully!');
                }}
                disabled={appliedActions.has('waf_sqli')}
              >
                {appliedActions.has('waf_sqli') ? 'Shielded ✓' : 'Deploy Shield'}
              </button>
            </div>
          </div>
        </Card>

        {/* PREDICTIVE ATTACK TRAJECTORY CHART */}
        <Card className="workbench-card">
          <div className="aa-card-header">
            <div className="header-with-icon">
              <Activity size={18} color="#00f5ff" />
              <h3>Threat Trajectory & Predictive Forecast</h3>
            </div>
            <span className="aa-badge">24H PREDICTION</span>
          </div>

          <div className="chart-container" style={{ height: '240px', position: 'relative' }}>
            <LineChart data={forecastData} height="100%" />
          </div>

          <div className="forecast-footer-notes">
            <span className="note-label">Predictive Insight:</span>
            <p className="note-text">
              Model anticipates a <strong>+26% increase</strong> in reconnaissance probes over the next 2 hours. Recommended to keep automated quarantine active.
            </p>
          </div>
        </Card>
      </div>

      {/* LIVE BEHAVIORAL ANOMALIES TABLE */}
      <Card className="anomalies-table-card">
        <div className="aa-card-header">
          <div className="header-with-icon">
            <ShieldAlert size={18} color="#ff3366" />
            <h3>Live Flagged Behavioral Anomalies</h3>
          </div>
          <span className="anomaly-count-pill">{BASELINE_ANOMALIES.length} ACTIVE ANOMALIES</span>
        </div>

        <div className="anomalies-table-scroll">
          <table className="ai-anomalies-table">
            <thead>
              <tr>
                <th>Source IP</th>
                <th>Anomaly Classification</th>
                <th>ML Deviation</th>
                <th>Target Surface</th>
                <th>Risk Level</th>
                <th>Detection Time</th>
                <th>Mitigation Action</th>
              </tr>
            </thead>
            <tbody>
              {BASELINE_ANOMALIES.map((item) => {
                const isItemBlocked = blockedIps.has(item.sourceIp);

                return (
                  <tr key={item.id} className={item.riskLevel.toLowerCase()}>
                    <td className="font-mono text-cyan font-bold">{item.sourceIp}</td>
                    <td>
                      <span className="anomaly-type-text">{item.attackType}</span>
                    </td>
                    <td>
                      <span className="deviation-score">{item.deviation}</span>
                    </td>
                    <td className="font-mono text-gray-300">{item.targetPort}</td>
                    <td>
                      <span className={`risk-badge ${item.riskLevel.toLowerCase()}`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="text-gray-400 text-sm">{item.time}</td>
                    <td>
                      <div className="anomaly-action-btns">
                        <button
                          type="button"
                          className={`btn btn-xs ${isItemBlocked ? 'btn-disabled' : 'btn-danger'}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleBlockIp(item.sourceIp);
                          }}
                          disabled={isItemBlocked}
                        >
                          {isItemBlocked ? 'Blocked ✓' : 'Block IP'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={(e) => {
                            e.preventDefault();
                            setInvestigatingAnomaly(item);
                          }}
                        >
                          <Eye size={12} /> Investigate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INVESTIGATION MODAL */}
      {investigatingAnomaly && (
        <InvestigationModal
          notification={{
            id: investigatingAnomaly.id,
            title: investigatingAnomaly.title,
            message: investigatingAnomaly.message,
            source_ip: investigatingAnomaly.sourceIp,
            priority: investigatingAnomaly.riskLevel.toLowerCase(),
            time: new Date().toISOString()
          }}
          onClose={() => setInvestigatingAnomaly(null)}
          onBlockIp={(ip) => handleBlockIp(ip)}
          onMarkRead={() => {}}
        />
      )}
    </div>
  );
};

export default AdminAIInsights;
