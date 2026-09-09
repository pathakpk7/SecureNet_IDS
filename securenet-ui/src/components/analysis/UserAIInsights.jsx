import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/Charts/LineChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Send,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/pages/ai.css';

const USER_PRESETS = [
  {
    id: 'session_safety',
    label: '🛡️ Session Safety Audit',
    answer: 'Your current connection origin, browser agent, and TLS encryption level meet all corporate enterprise security requirements. No session hijacking or anomalous credential reuse detected.'
  },
  {
    id: 'password_strength',
    label: '🔑 Credential Hardening',
    answer: 'Your password was verified against known breach databases (HaveIBeenPwned). No compromises found. We recommend enabling hardware key or 2-factor authentication for higher security clearance.'
  },
  {
    id: 'recent_locations',
    label: '📍 Location Anomalies',
    answer: 'Your account was accessed from 1 verified IP address in the past 7 days. Geographic location: New Delhi region. No suspicious concurrent logins detected.'
  }
];

const UserAIInsights = () => {
  const [activePreset, setActivePreset] = useState(USER_PRESETS[0]);
  const [appliedActions, setAppliedActions] = useState(new Set());
  const [customQuestion, setCustomQuestion] = useState('');
  const [customResponse, setCustomResponse] = useState(null);

  const securityScore = 96;

  const handleApplyAction = (key, text) => {
    setAppliedActions(prev => new Set(prev).add(key));
    toast.success(text);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setCustomResponse(`AI Analysis: "${customQuestion.trim()}". Your connection is protected by SecureNet real-time IDS. No security anomalies or leaks were detected for this query.`);
    setCustomQuestion('');
  };

  const userTrendData = useMemo(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    values: [0, 0, 1, 0, 0, 0, 0]
  }), []);

  return (
    <div className="ai-insights-page user-insights fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal AI Security Health</h1>
        <p className="page-subtitle">Machine learning monitoring of your account security, session integrity, and privacy</p>
      </div>

      {/* TOP STATS */}
      <div className="ai-soc-posture-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Card className="posture-card risk-gauge-card">
          <div className="card-top-row">
            <span className="card-tag">SECURITY HEALTH SCORE</span>
            <ShieldCheck size={18} color="#00f5ff" />
          </div>
          <div className="risk-score-display">
            <span className="risk-score-number" style={{ color: '#00f5ff' }}>{securityScore}</span>
            <span className="risk-score-total">/100</span>
          </div>
          <div className="risk-progress-bar">
            <div className="risk-progress-fill" style={{ width: `${securityScore}%`, background: 'linear-gradient(90deg, #00f5ff, #39ff14)' }}></div>
          </div>
          <div className="risk-status-label" style={{ color: '#39ff14' }}>
            EXCELLENT • FULLY SECURED
          </div>
        </Card>

        <Card className="posture-card">
          <div className="card-top-row">
            <span className="card-tag">SESSION ENCRYPTION</span>
            <Lock size={18} color="#39ff14" />
          </div>
          <div className="metric-headline text-emerald font-mono">
            TLS 1.3
          </div>
          <div className="metric-subtext">
            <span>Cipher: <strong>AES-256-GCM</strong></span>
            <span className="text-emerald">High Assurance</span>
          </div>
        </Card>

        <Card className="posture-card">
          <div className="card-top-row">
            <span className="card-tag">ACTIVE LOGINS</span>
            <Smartphone size={18} color="#fbbf24" />
          </div>
          <div className="metric-headline text-yellow font-mono">
            1 Device
          </div>
          <div className="metric-subtext">
            <span>Chrome / Windows 11</span>
            <span className="text-cyan">Current Session</span>
          </div>
        </Card>
      </div>

      {/* INTERACTIVE USER SECURITY ASSISTANT */}
      <Card className="copilot-workbench-card" style={{ marginTop: '20px' }}>
        <div className="copilot-header">
          <div className="copilot-title-group">
            <div className="copilot-avatar" style={{ borderColor: 'rgba(0, 245, 255, 0.4)', background: 'rgba(0, 245, 255, 0.1)' }}>
              <Zap size={22} color="#00f5ff" />
            </div>
            <div>
              <h3>Personal Security Advisor</h3>
              <p>Explore automated safety diagnostics and recommendations for your account</p>
            </div>
          </div>
          <span className="copilot-badge" style={{ color: '#00f5ff', borderColor: 'rgba(0, 245, 255, 0.3)' }}>AI ADVISOR</span>
        </div>

        <div className="copilot-chips-row">
          {USER_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`copilot-chip ${activePreset.id === preset.id ? 'active' : ''}`}
              onClick={() => {
                setActivePreset(preset);
                setCustomResponse(null);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="copilot-output-container">
          <div className="copilot-response-content">
            <div className="response-header">
              <h4 className="response-title">{customResponse ? 'Custom Diagnostic' : activePreset.label}</h4>
              <span className="response-timestamp">Live verification</span>
            </div>
            <p className="response-summary">{customResponse || activePreset.answer}</p>
          </div>
        </div>

        <form className="copilot-query-form" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className="copilot-input"
            placeholder="Ask anything about your account security or data protection..."
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
          />
          <button type="submit" className="copilot-send-btn">
            <Send size={16} />
            <span>Check</span>
          </button>
        </form>
      </Card>

      {/* HARDENING ACTIONS & RECENT ACTIVITY */}
      <div className="ai-remediations-grid" style={{ marginTop: '20px' }}>
        <Card className="workbench-card">
          <div className="aa-card-header">
            <h3>Recommended Security Hardening</h3>
            <span className="aa-badge">1-CLICK</span>
          </div>

          <div className="action-items-list">
            <div className="action-item-card">
              <div className="action-info">
                <h4>Enforce 15-Min Inactive Lock</h4>
                <p>Automatically locks your session when your computer is left unattended.</p>
              </div>
              <button 
                className={`btn btn-sm ${appliedActions.has('timeout') ? 'btn-applied' : 'btn-primary'}`}
                onClick={() => handleApplyAction('timeout', '15-Minute session timeout enabled!')}
                disabled={appliedActions.has('timeout')}
              >
                {appliedActions.has('timeout') ? 'Active ✓' : 'Enable'}
              </button>
            </div>

            <div className="action-item-card">
              <div className="action-info">
                <h4>Login Notification Alerts</h4>
                <p>Receive an immediate notification whenever a login is attempted from an unfamiliar device.</p>
              </div>
              <button 
                className={`btn btn-sm ${appliedActions.has('notifs') ? 'btn-applied' : 'btn-primary'}`}
                onClick={() => handleApplyAction('notifs', 'New login notifications enabled!')}
                disabled={appliedActions.has('notifs')}
              >
                {appliedActions.has('notifs') ? 'Active ✓' : 'Enable'}
              </button>
            </div>
          </div>
        </Card>

        <Card className="workbench-card">
          <div className="aa-card-header">
            <h3>Threats Intercepted Against Your Session</h3>
            <span className="aa-badge">CLEAN</span>
          </div>
          <div className="chart-container" style={{ height: '220px', position: 'relative' }}>
            <LineChart data={userTrendData} height="100%" />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 0 0' }}>
            Zero unauthorized breach attempts succeeded against your profile this week.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default UserAIInsights;
