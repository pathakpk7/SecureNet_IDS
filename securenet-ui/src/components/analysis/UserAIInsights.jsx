import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import LineChart from '../../components/Charts/LineChart';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import useRealtimeAlerts from '../../hooks/useRealtimeAlerts';
import '../../styles/pages/ai.css';
import { API_BASE, API_V1, WS_URL } from '@/config/api';

const UserAIInsights = () => {
  const realtimeAlerts = useRealtimeAlerts();
  const [stats, setStats] = useState({ totalAttacks: 0, packets: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('${API_BASE}/stats');
        if (res.ok) {
          const body = await res.json();
          const s = body.data || body;
          setStats({
            totalAttacks: s.attacks_detected || s.alerts_generated || 0,
            packets: s.packets_processed || 0
          });
        }
      } catch (e) {}
    };
    fetchStats();
    const int = setInterval(fetchStats, 5000);
    return () => clearInterval(int);
  }, []);

  const threatsPredicted = stats.totalAttacks || realtimeAlerts.length;

  const threatTrends = useMemo(() => {
    if (realtimeAlerts.length === 0) return { labels: ['No Data'], values: [0] };
    const counts = {};
    realtimeAlerts.forEach(a => {
      const d = a.timestamp ? new Date(a.timestamp).toLocaleDateString() : new Date().toLocaleDateString();
      counts[d] = (counts[d] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      values: Object.values(counts)
    };
  }, [realtimeAlerts]);

  const aiRecommendations = useMemo(() => {
    if (threatsPredicted === 0) return [
      { id: 1, type: 'System', priority: 'Low', description: 'Your personal session is secure. No actions required.' }
    ];
    return [
      { id: 1, type: 'Security', priority: 'High', description: 'We intercepted a threat targeted at your session.' }
    ];
  }, [threatsPredicted]);

  return (
    <div className="ai-insights-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal AI Insights (Realtime)</h1>
        <p className="page-subtitle">Machine learning analysis applied to your active connection</p>
      </div>

      <div className="ai-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">
              <AnimatedCounter value={threatsPredicted} />
            </div>
            <div className="metric-label">Threats Blocked</div>
            <div className="metric-trend positive">Realtime sync</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">100%</div>
            <div className="metric-label">Protection Status</div>
            <div className="metric-trend positive">Fully Secure</div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-value">{stats.packets}</div>
            <div className="metric-label">Session Packets Scanned</div>
            <div className="metric-trend positive">Live Monitoring</div>
          </div>
        </Card>
      </div>

      <Card className="insights-card" style={{ marginBottom: '24px' }}>
        <div className="aa-card-header">
          <h3>Personal Threat Trends (Realtime)</h3>
          <span className="aa-badge">LIVE FORECAST</span>
        </div>
        <div className="chart-container" style={{ height: '260px', position: 'relative' }}>
          <LineChart data={threatTrends} height="100%" />
        </div>
      </Card>

      <Card className="insights-card">
        <div className="aa-card-header">
          <h3>AI Security Recommendations</h3>
          <span className="aa-badge">AUTONOMOUS</span>
        </div>
        <div className="recommendations-list">
          {aiRecommendations.map(rec => (
            <div key={rec.id} className={`recommendation-item ${rec.priority.toLowerCase()}`}>
              <div className="rec-header">
                <span className="rec-type">{rec.type}</span>
                <span className={`rec-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
              </div>
              <div className="rec-description">{rec.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserAIInsights;
