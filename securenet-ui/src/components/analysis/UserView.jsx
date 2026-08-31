import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import '../../styles/pages/analysis.css';

const UserAttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [personalAttackData, setPersonalAttackData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [4, 5, 3, 6, 4, 2, 2]
  });

  const [personalAttackTypeData, setPersonalAttackTypeData] = useState({
    labels: ['Phishing', 'Malware', 'Suspicious', 'Safe'],
    values: [2, 1, 3, 45]
  });

  // Simulate personal data updates
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
      <div className="page-header">
        <h1 className="page-title">Personal Attack Analysis</h1>
        <p className="page-subtitle">Analysis of attacks targeting your account and devices</p>
      </div>

      <div className="analysis-controls">
        <div className="time-range-selector">
          {timeRanges.map(range => (
            <button
              key={range}
              className={`range-btn ${selectedTimeRange === range ? 'active' : ''}`}
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="analysis-grid">
        <Card className="analysis-card">
          <h3 className="card-title">Personal Attack Timeline</h3>
          <div className="chart-container">
            <BarChart data={personalAttackData} />
          </div>
        </Card>

        <Card className="analysis-card">
          <h3 className="card-title">Attack Types Distribution</h3>
          <div className="chart-container">
            <PieChart data={personalAttackTypeData} />
          </div>
        </Card>

        <Card className="analysis-card">
          <h3 className="card-title">Personal Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">26</div>
              <div className="stat-label">Total Attacks</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">3</div>
              <div className="stat-label">Blocked</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">92%</div>
              <div className="stat-label">Protection Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Low</div>
              <div className="stat-label">Risk Level</div>
            </div>
          </div>
        </Card>

        <Card className="analysis-card">
          <h3 className="card-title">Recent Attack Attempts</h3>
          <div className="attack-list">
            <div className="attack-item">
              <div className="attack-info">
                <div className="attack-type">Phishing Email</div>
                <div className="attack-time">2 hours ago</div>
              </div>
              <div className="attack-status blocked">Blocked</div>
            </div>
            <div className="attack-item">
              <div className="attack-info">
                <div className="attack-type">Suspicious Login</div>
                <div className="attack-time">5 hours ago</div>
              </div>
              <div className="attack-status blocked">Blocked</div>
            </div>
            <div className="attack-item">
              <div className="attack-info">
                <div className="attack-type">Malware Attempt</div>
                <div className="attack-time">1 day ago</div>
              </div>
              <div className="attack-status blocked">Blocked</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAttackAnalysis;
