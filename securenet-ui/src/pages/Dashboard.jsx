import React from 'react';
import { usePermissions } from "../hooks/usePermissions";
import ThreatIntelligence from "../components/security/ThreatIntelligence";
import AttackTimeline from "../components/security/AttackTimeline";
import IncidentPanel from "../components/security/IncidentPanel";
import useRealtimeAlerts from "../hooks/useRealtimeAlerts";
import Card from "../components/ui/Card";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import '../styles/pages/dashboard.css';

// Overview component (shared between admin and user)
function Overview() {
  const [stats, setStats] = React.useState({
    totalAlerts: 156,
    blockedThreats: 89,
    systemHealth: 97.3,
    activeUsers: 23
  });

  return (
    <div className="overview-grid">
      <Card className="stat-card">
        <div className="stat-content">
          <div className="stat-value">
            <AnimatedCounter value={stats.totalAlerts} />
          </div>
          <div className="stat-label">Total Alerts</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="stat-content">
          <div className="stat-value">
            <AnimatedCounter value={stats.blockedThreats} />
          </div>
          <div className="stat-label">Blocked Threats</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="stat-content">
          <div className="stat-value">{stats.systemHealth}%</div>
          <div className="stat-label">System Health</div>
        </div>
      </Card>
      <Card className="stat-card">
        <div className="stat-content">
          <div className="stat-value">
            <AnimatedCounter value={stats.activeUsers} />
          </div>
          <div className="stat-label">Active Users</div>
        </div>
      </Card>
    </div>
  );
}

// Advanced Analytics (admin only)
function AdvancedStats() {
  return (
    <Card className="analytics-card">
      <h3>Advanced Analytics</h3>
      <div className="analytics-content">
        <div className="metric">
          <span>Average Response Time:</span>
          <span>1.2s</span>
        </div>
        <div className="metric">
          <span>Threat Detection Rate:</span>
          <span>94.7%</span>
        </div>
        <div className="metric">
          <span>False Positive Rate:</span>
          <span>2.3%</span>
        </div>
      </div>
    </Card>
  );
}

// User Activity (admin only)
function UserActivity() {
  const [userActivity, setUserActivity] = React.useState([
    { id: 1, user: 'john.doe', action: 'Blocked IP 192.168.1.100', time: '2 min ago', severity: 'high' },
    { id: 2, user: 'jane.smith', action: 'Login from new device', time: '5 min ago', severity: 'medium' },
    { id: 3, user: 'mike.wilson', action: 'Accessed sensitive files', time: '12 min ago', severity: 'medium' }
  ]);

  return (
    <Card className="activity-card">
      <h3>User Activity</h3>
      <div className="activity-list">
        {userActivity.map(activity => (
          <div key={activity.id} className="activity-item">
            <span className="activity-user">{activity.user}</span>
            <span className="activity-action">{activity.action}</span>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { can } = usePermissions();
  const alerts = useRealtimeAlerts();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Security Dashboard</h1>
        <p>Real-time security monitoring and threat intelligence</p>
      </div>

      {/* Shared Overview */}
      <Overview />

      {/* Permission-based components */}
      <div className="dashboard-grid">
        <div className="security-section">
          <ThreatIntelligence alerts={alerts} />
          <AttackTimeline alerts={alerts.slice(0, 10)} />
          <IncidentPanel alert={alerts[0]} />
        </div>

        <div className="admin-section">
          {can("VIEW_ADVANCED_ANALYTICS") && <AdvancedStats />}
          {can("VIEW_USERS") && <UserActivity />}
        </div>
      </div>
    </div>
  );
}
