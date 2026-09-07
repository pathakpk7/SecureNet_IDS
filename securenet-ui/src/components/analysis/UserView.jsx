import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import BarChart from '../Charts/BarChart';
import PieChart from '../Charts/PieChart';
import '../../styles/pages/analysis.css';

const UserAttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [personalAttackData, setPersonalAttackData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [4, 5, 3, 6, 4, 2, 2]
  });

  const [personalAttackTypeData, setPersonalAttackTypeData] = useState({
    labels: ['Phishing Attempt', 'Malware Payload', 'Suspicious Probe', 'Clean Traffic'],
    values: [2, 1, 3, 45]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalAttackData(prev => ({
        ...prev,
        values: prev.values.map(v => Math.max(0, v + Math.floor(Math.random() * 3) - 1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const timeRanges = ['24h', '7d', '30d', '90d'];

  return (
    <div className="attack-analysis-page fade-in">
      {/* Top Box: Header, Range Controls, and KPI Pills */}
      <Card className="aa-header-kpi-card">
        <div className="aa-header-content">
          <div className="page-header-text">
            <h1 className="page-title">Personal Attack Analysis</h1>
            <p className="page-subtitle">Security threat breakdown targeting your account, active sessions, and personal devices</p>
          </div>
          <div className="aa-controls-group">
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px' }}>Range:</span>
            {timeRanges.map(range => (
              <button
                key={range}
                className={`range-btn ${selectedTimeRange === range ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="aa-kpi-row">
          <div className="aa-kpi-pill">
            <span className="val text-cyan">26</span>
            <span className="lbl">Threats Evaluated</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-emerald">26</span>
            <span className="lbl">Blocked Attempts</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-emerald">99.2%</span>
            <span className="lbl">Protection Score</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-cyan">Low</span>
            <span className="lbl">Risk Rating</span>
          </div>
        </div>
      </Card>

      {/* Row 2: CHARTS ROW */}
      <div className="aa-charts-row">
        <Card className="aa-chart-card">
          <div className="aa-card-header">
            <h3>Personal Threat Frequency</h3>
            <span className="aa-badge">7-DAY TIMELINE</span>
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            <BarChart data={personalAttackData} height="100%" />
          </div>
        </Card>

        <Card className="aa-chart-card">
          <div className="aa-card-header">
            <h3>Threat Category Breakdown</h3>
            <span className="aa-badge">CATEGORIES</span>
          </div>
          <div style={{ height: '220px', position: 'relative' }}>
            <PieChart data={personalAttackTypeData} height="100%" />
          </div>
        </Card>
      </div>

      {/* Row 3: RECENT THREATS TABLE */}
      <Card className="aa-table-card">
        <div className="aa-card-header">
          <h3>Recent Intercepted Threats</h3>
          <span className="aa-badge">SECURE</span>
        </div>

        <div className="aa-table-wrapper">
          <table className="aa-table">
            <thead>
              <tr>
                <th>Threat Vector</th>
                <th>Time Intercepted</th>
                <th>Target Session</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-white">Phishing Email Vector</td>
                <td className="text-gray-400">2 hours ago</td>
                <td className="text-gray-300">Email Gateway</td>
                <td><span className="nm-status-badge btn-active-mon">Blocked</span></td>
              </tr>
              <tr>
                <td className="font-bold text-white">Suspicious Login Attempt</td>
                <td className="text-gray-400">5 hours ago</td>
                <td className="text-gray-300">Web Portal</td>
                <td><span className="nm-status-badge btn-active-mon">Blocked</span></td>
              </tr>
              <tr>
                <td className="font-bold text-white">Malware Payload Script</td>
                <td className="text-gray-400">1 day ago</td>
                <td className="text-gray-300">Browser Endpoint</td>
                <td><span className="nm-status-badge btn-active-mon">Blocked</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserAttackAnalysis;
