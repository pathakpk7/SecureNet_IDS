import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from "../hooks/usePermissions";
import ThreatIntelligence from "../components/security/ThreatIntelligence";
import AttackTimeline from "../components/security/AttackTimeline";
import IncidentPanel from "../components/security/IncidentPanel";
import useRealtimeAlerts from "../hooks/useRealtimeAlerts";
import Card from "../components/ui/Card";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import toast from 'react-hot-toast';
import '../styles/pages/dashboard.css';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

// Overview component connected to live backend metrics
function Overview({ monitoringActive, onToggleMonitoring }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPackets: 0,
    attacksDetected: 0,
    blockedThreats: 0,
    systemHealth: 0
  });

  useEffect(() => {
    let isMounted = true;

    // Fetch initial status & stats from backend
    const fetchStats = async () => {
      try {
        const res = await fetch('${API_BASE}/status');
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const s = data.statistics || {};
          if (isMounted) {
            setStats(prev => ({
              totalPackets: s.packets_captured || s.packets_processed || prev.totalPackets,
              attacksDetected: s.attacks_detected || prev.attacksDetected,
              blockedThreats: s.threat_intel_checks || prev.blockedThreats,
              systemHealth: prev.systemHealth
            }));
          }
        }

        try {
          const healthRes = await fetch('${API_BASE}/health');
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            const h = healthData.data || healthData;
            // Count healthy components
            const components = h.components || {};
            const total = Object.keys(components).length || 1;
            const healthy = Object.values(components).filter(c => c === 'healthy' || c === true || c?.status === 'healthy').length;
            if (isMounted) {
              setStats(prev => ({ ...prev, systemHealth: total > 0 ? Math.round((healthy / total) * 100) : 0 }));
            }
          }
        } catch(e) {}
      } catch (e) {
        // Fallback simulation counter increments
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);

    // Also connect to WebSocket stream for instantaneous packet counters
    let ws = null;
    try {
      ws = new WebSocket('${WS_URL}');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'packet_update' && msg.data) {
            setStats(prev => ({
              ...prev,
              totalPackets: prev.totalPackets + 1,
              attacksDetected: msg.data.prediction ? prev.attacksDetected + 1 : prev.attacksDetected
            }));
          } else if (msg.type === 'status' && msg.data) {
            const s = msg.data.statistics || {};
            setStats(prev => ({
              totalPackets: s.packets_captured || s.packets_processed || prev.totalPackets,
              attacksDetected: s.attacks_detected || prev.attacksDetected,
              blockedThreats: s.threat_intel_checks || prev.blockedThreats,
              systemHealth: prev.systemHealth
            }));
          }
        } catch (err) {}
      };
    } catch (err) {}

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close();
        }
      }
    };
  }, []);

  return (
    <div className="db-overview-section">
      {/* Control Banner */}
      <div className="db-banner">
        <div className="db-banner-info">
          <div className={`db-status-dot ${monitoringActive ? 'active' : 'inactive'}`}></div>
          <div>
            <div className="db-banner-title">
              Live Inspection Engine: <span className={monitoringActive ? 'text-emerald' : 'text-red'}>{monitoringActive ? 'ACTIVE & STREAMING' : 'STOPPED'}</span>
            </div>
            <div className="db-banner-sub">ML Model: CICIDS2017 RandomForest • Threat Intel: 5 APIs Connected</div>
          </div>
        </div>
        <button
          onClick={onToggleMonitoring}
          className={`db-banner-btn ${monitoringActive ? 'btn-stop' : 'btn-start'}`}
        >
          {monitoringActive ? 'Stop Capture' : 'Start Capture'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="db-kpi-grid">
        <div 
          className="db-kpi-card db-card-clickable" 
          onClick={() => navigate('/network-monitor')}
          title="Click to view live network traffic monitor"
        >
          <div className="db-kpi-value text-cyan">
            <AnimatedCounter value={stats.totalPackets} />
          </div>
          <div className="db-kpi-label">Packets Inspected</div>
          <div className="db-kpi-link">Inspect Traffic →</div>
        </div>

        <div 
          className="db-kpi-card db-card-clickable" 
          onClick={() => navigate('/alerts')}
          title="Click to view intrusion detection alerts"
        >
          <div className="db-kpi-value text-red">
            <AnimatedCounter value={stats.attacksDetected} />
          </div>
          <div className="db-kpi-label">Intrusions Detected</div>
          <div className="db-kpi-link">View Alerts →</div>
        </div>

        <div 
          className="db-kpi-card db-card-clickable" 
          onClick={() => navigate('/attack-analysis')}
          title="Click to view threat intelligence verification"
        >
          <div className="db-kpi-value text-yellow">
            <AnimatedCounter value={stats.blockedThreats} />
          </div>
          <div className="db-kpi-label">Threat Intel Checks</div>
          <div className="db-kpi-link">Threat Details →</div>
        </div>

        <div 
          className="db-kpi-card db-card-clickable" 
          onClick={() => navigate('/ai-insights')}
          title="Click to view AI system health telemetry"
        >
          <div className="db-kpi-value text-emerald">{stats.systemHealth}%</div>
          <div className="db-kpi-label">System Health Score</div>
          <div className="db-kpi-link">AI Insights →</div>
        </div>
      </div>
    </div>
  );
}

// Advanced Analytics (admin only)
function AdvancedStats() {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('${API_BASE}/stats');
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setTelemetry(data);
        }
      } catch (e) {}
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const avgLatency = telemetry?.performance_metrics?.avg_prediction_time;
  const accuracy = telemetry?.model_info?.accuracy || telemetry?.accuracy;
  const falsePositiveRate = telemetry?.performance_metrics?.false_positive_rate;

  return (
    <Card 
      className="db-card-clickable" 
      onClick={() => navigate('/ai-insights')}
    >
      <div className="db-card-header">
        <h3 className="db-card-title">AI Engine Telemetry</h3>
        <span className="db-card-link-badge">Open AI Insights →</span>
      </div>
      <div className="db-telemetry-list">
        <div className="db-telemetry-row">
          <span className="label">Classification Latency:</span>
          <span className="val text-cyan">{avgLatency != null ? `${(avgLatency * 1000).toFixed(1)}ms` : '—'}</span>
        </div>
        <div className="db-telemetry-row">
          <span className="label">Detection Accuracy:</span>
          <span className="val text-emerald">{accuracy != null ? `${(accuracy * 100).toFixed(1)}%` : '—'}</span>
        </div>
        <div className="db-telemetry-row">
          <span className="label">False Positive Rate:</span>
          <span className="val text-yellow">{falsePositiveRate != null ? `${(falsePositiveRate * 100).toFixed(1)}%` : '—'}</span>
        </div>
      </div>
    </Card>
  );
}

// User Activity
function UserActivity() {
  const navigate = useNavigate();
  const [userActivity, setUserActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch('${API_BASE}/logs?limit=5');
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json) ? json : (json.data || []);
          const mapped = list.map((log, i) => ({
            id: log.id || i,
            user: log.source || 'System',
            action: log.message || 'Activity logged',
            time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'
          }));
          setUserActivity(mapped);
        }
      } catch (e) {}
      setLoadingActivity(false);
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="db-activity-card">
      <div className="db-card-header">
        <h3 className="db-card-title">Recent Security Activity</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); navigate('/audit-logs'); }}
          className="db-card-link-btn"
        >
          Audit Logs →
        </button>
      </div>
      <div className="db-activity-list">
        {loadingActivity ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>Loading activity...</div>
        ) : userActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '13px' }}>No recent activity — start monitoring to begin</div>
        ) : (
          userActivity.map(activity => (
            <div 
              key={activity.id} 
              className="db-activity-item db-card-clickable"
              onClick={() => navigate('/audit-logs')}
            >
              <span className="user">{activity.user}</span>
              <span className="action">{activity.action}</span>
              <span className="time">{activity.time}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { can } = usePermissions();
  const alerts = useRealtimeAlerts();
  const [monitoringActive, setMonitoringActive] = useState(true);

  useEffect(() => {
    // Check initial monitoring state
    fetch('${API_BASE}/status')
      .then(res => res.json())
      .then(json => {
        const data = json.data || json;
        if (typeof data.monitoring_active === 'boolean') {
          setMonitoringActive(data.monitoring_active);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleMonitoring = async () => {
    const endpoint = monitoringActive ? '${API_BASE}/stop-monitoring' : '${API_BASE}/start-monitoring';
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        setMonitoringActive(!monitoringActive);
        toast.success(monitoringActive ? 'Packet capture stopped' : 'Live packet capture started!');
      } else {
        toast.error('Failed to change monitoring state');
      }
    } catch {
      toast.error('Error connecting to IDS backend');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Security Dashboard</h1>
        <p className="dashboard-sub">Real-time network packet inspection, ML anomaly detection, and threat intelligence</p>
      </div>

      {/* Shared Live Overview */}
      <Overview 
        monitoringActive={monitoringActive}
        onToggleMonitoring={handleToggleMonitoring}
      />

      {/* Security Threat Grid */}
      <div className="db-main-grid">
        <ThreatIntelligence alerts={alerts} />
        <IncidentPanel alert={alerts[0]} />
      </div>

      {/* Timeline & Secondary Analytics */}
      <div className="db-bottom-grid">
        <div className="db-timeline-col">
          <AttackTimeline alerts={alerts.slice(0, 8)} />
        </div>

        <div className="db-side-stack">
          {can("VIEW_ADVANCED_ANALYTICS") && <AdvancedStats />}
          <UserActivity />
        </div>
      </div>
    </div>
  );
}
