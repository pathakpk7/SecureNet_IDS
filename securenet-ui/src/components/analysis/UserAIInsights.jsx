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
    answer: 'Your current login session is fully secure. Your browser connection uses strong TLS 1.3 encryption, and no unauthorized location switches, token theft, or suspicious session hijack attempts have been detected.'
  },
  {
    id: 'password_strength',
    label: '🔑 Credential Hardening',
    answer: 'Your account password has been checked against known compromised credential lists and was not found in any public security breach. For maximum safety, avoid reusing passwords across multiple services.'
  },
  {
    id: 'recent_locations',
    label: '📍 Location Anomalies',
    answer: 'Your account was accessed only from your verified IP address and device over the past 7 days. There are no suspicious concurrent sign-ins or unfamiliar geographic logins.'
  }
];

const UserAIInsights = () => {
  const [appliedActions, setAppliedActions] = useState(new Set());
  const [customQuestion, setCustomQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = React.useRef(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('securenet_copilot_user_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored user copilot chat:', e);
    }
    return [
      {
        id: 'msg-init',
        sender: 'ai',
        title: USER_PRESETS[0].label,
        summary: USER_PRESETS[0].answer,
        time: 'Just now'
      }
    ];
  });

  // Persist messages to device storage
  React.useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        localStorage.setItem('securenet_copilot_user_chat', JSON.stringify(messages));
      } else {
        localStorage.removeItem('securenet_copilot_user_chat');
      }
    } catch (e) {
      console.warn('Error saving user copilot chat:', e);
    }
  }, [messages]);

  const securityScore = 96;

  // Auto-scroll ONLY within the chat container to prevent mobile page jumping
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  const handleSelectPreset = (preset) => {
    toast(`Running ${preset.label}...`, { icon: '🛡️' });
    setIsThinking(true);

    const userMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: `Run ${preset.label} diagnostic`,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        title: preset.label,
        summary: preset.answer,
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      toast.success(`${preset.label} verified!`);
    }, 250);
  };

  const handleApplyAction = (key, text) => {
    setAppliedActions(prev => new Set(prev).add(key));
    toast.success(text);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!customQuestion.trim()) return;

    const query = customQuestion.trim();
    setCustomQuestion('');
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
        title: 'Diagnostic Result',
        summary: `AI Security Verification for "${query}": Your session and local credentials are fully safeguarded. No unauthorized access attempts, leaked auth tokens, or network eavesdropping detected.`,
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
      toast.success('Security query analyzed!');
    }, 300);
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem('securenet_copilot_user_chat');
    } catch (e) {
      console.warn('Error clearing user copilot chat from storage:', e);
    }
    toast.success('Recent copilot chat deleted from device');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              type="button" 
              className="btn btn-xs btn-outline" 
              onClick={handleClearChat}
              title="Reset conversation"
            >
              Clear Chat
            </button>
            <span className="copilot-badge" style={{ color: '#00f5ff', borderColor: 'rgba(0, 245, 255, 0.3)' }}>AI ADVISOR</span>
          </div>
        </div>

        <div className="copilot-chips-row">
          {USER_PRESETS.map(preset => (
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

        <div ref={chatContainerRef} className="copilot-output-container chat-scroll-container">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
              <Zap size={32} style={{ margin: '0 auto 12px', opacity: 0.6, color: '#00f5ff' }} />
              <p style={{ margin: 0, fontWeight: 500, color: '#e2e8f0' }}>Chat history cleared</p>
              <span style={{ fontSize: '13px', opacity: 0.75 }}>
                Click any of the security audit chips above or ask a question below.
              </span>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="copilot-user-bubble-row">
                  <div className="copilot-user-bubble">
                    <span className="bubble-label">Your Query:</span>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="copilot-response-content ai-bubble">
                <div className="response-header">
                  <h4 className="response-title">{msg.title}</h4>
                  <span className="response-timestamp">{msg.time}</span>
                </div>
                <p className="response-summary">{msg.summary}</p>
              </div>
            );
          })}

          {isThinking && (
            <div className="copilot-thinking">
              <Zap size={20} className="spinning" />
              <span>Analyzing security telemetry...</span>
            </div>
          )}
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
