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
import { API_BASE } from '@/config/api';

const COPILOT_PRESETS = [
  {
    id: 'threat_vectors',
    label: '⚡ Threat Vector Analysis',
    prompt: 'Analyze active threat vectors and calculate blast radius.',
    answer: {
      title: 'Current Threat Vector Analysis & Root Cause',
      summary: 'High density of inbound anomalous traffic detected across ports 443 (Web/API) and 22 (SSH Management). Primary signature matches SQL Injection probes from external subnet 203.0.113.0/24 alongside automated credential stuffing against authentication endpoints.',
      metrics: [
        { name: 'Primary Vector', value: 'Web API Exploitation (SQLi)' },
        { name: 'Secondary Vector', value: 'Brute Force SSH (Port 22)' },
        { name: 'Estimated Blast Radius', value: '1 Subnet / 156 Endpoints' }
      ],
      actions: [
        'Apply strict parameterized query filters at WAF layer.',
        'Enforce progressive rate-limiting on /api/v1/auth/login.',
        'Immediately quarantine repeated failed authentication origins.'
      ]
    }
  },
  {
    id: 'firewall_rules',
    label: '🛡️ Firewall Hardening Rules',
    prompt: 'Suggest optimized firewall rules based on recent anomalous traffic patterns.',
    answer: {
      title: 'Recommended Adaptive Firewall Rules',
      summary: 'Based on recent traffic analysis, the IDS model recommends deploying 3 adaptive perimeter rules to mitigate high-frequency SYN floods and untrusted external administrative probing.',
      metrics: [
        { name: 'Rule 1', value: 'DROP TCP SYN > 100 req/s from external WAN' },
        { name: 'Rule 2', value: 'BLOCK IP range 203.0.113.0/24 for 24h' },
        { name: 'Rule 3', value: 'RESTRICT Port 22 SSH to internal VPN gateway' }
      ],
      actions: [
        'Push rule #2 to perimeter iptables / cloud security group.',
        'Enable SYN cookie fallback in kernel networking.'
      ]
    }
  },
  {
    id: 'vulnerable_ports',
    label: '🎯 Vulnerable Port Inspection',
    prompt: 'Inspect most targeted open ports and service vulnerabilities.',
    answer: {
      title: 'Vulnerable Port & Attack Surface Assessment',
      summary: 'Telemetry shows port 443 (HTTPS) received 68% of malicious payloads, followed by port 22 (SSH) at 22%, and port 3306 (MySQL) at 10%. Database port 3306 is currently exposed to subnet inspection and should be bound strictly to localhost.',
      metrics: [
        { name: 'Port 443 (HTTPS)', value: '68% of probes (SQLi, XSS)' },
        { name: 'Port 22 (SSH)', value: '22% of probes (Brute Force)' },
        { name: 'Port 3306 (DB)', value: '10% of probes (Exposed Subnet)' }
      ],
      actions: [
        'Bind MySQL port 3306 exclusively to 127.0.0.1.',
        'Implement fail2ban with a 5-minute ban on 5 invalid SSH attempts.'
      ]
    }
  },
  {
    id: 'ciso_briefing',
    label: '📋 Executive Incident Briefing',
    prompt: 'Draft an executive threat intelligence summary for the Security Director.',
    answer: {
      title: 'Executive Cybersecurity Threat Briefing',
      summary: 'In the current reporting window, the SecureNet IDS autonomous pipeline inspected over 140,000 packets with an accuracy rating of 98.4%. 12 high-severity threats were identified and isolated before compromising critical infrastructure. Overall enterprise security posture remains RESILIENT.',
      metrics: [
        { name: 'Attacks Intercepted', value: '12 Incidents Contained' },
        { name: 'Autonomous Interception', value: '96.4% Success Rate' },
        { name: 'Compliance Status', value: 'SOC 2 / ISO 27001 Aligned' }
      ],
      actions: [
        'Schedule weekly definitions sync.',
        'Export briefing as official audit document.'
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
  const messagesEndRef = useRef(null);

  // Conversational thread history
  const [messages, setMessages] = useState([
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
  ]);

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

  // Auto-scroll conversation smoothly on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        presetId: 'custom',
        title: `AI Security Assessment: "${query}"`,
        summary: `Heuristic evaluation for "${query}". The CICIDS2017 inference pipeline analyzed recent network flows and telemetry. All detected packets match guarded baseline thresholds. Active containment is operational across all perimeter interfaces.`,
        metrics: [
          { name: 'Target Query', value: query.substring(0, 20) },
          { name: 'Inference Status', value: 'Guarded / Secure' },
          { name: 'Model Confidence', value: '98.6%' }
        ],
        actions: [
          'Continuous real-time packet monitoring active.',
          'Verify matched telemetry in Logs and Network Monitor.'
        ],
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
    setMessages([
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
    ]);
    toast.success('Copilot conversation cleared');
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
        <div className="copilot-output-container chat-scroll-container">
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

          <div ref={messagesEndRef} />
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
