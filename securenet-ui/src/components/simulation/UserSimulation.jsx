import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/simulation.css';

const UserSimulation = () => {
  const [userSimulations, setUserSimulations] = useState([
    {
      id: 1,
      name: 'Phishing Email Test',
      status: 'available',
      type: 'awareness',
      description: 'Test your ability to identify phishing emails',
      duration: '2 minutes',
      difficulty: 'Easy'
    },
    {
      id: 2,
      name: 'Password Security Check',
      status: 'available',
      type: 'personal',
      description: 'Evaluate your password strength and security habits',
      duration: '5 minutes',
      difficulty: 'Medium'
    },
    {
      id: 3,
      name: 'Device Security Audit',
      status: 'completed',
      type: 'device',
      description: 'Check security settings on your devices',
      duration: '3 minutes',
      difficulty: 'Easy'
    },
    {
      id: 4,
      name: 'Social Engineering Quiz',
      status: 'available',
      type: 'awareness',
      description: 'Test your knowledge of social engineering tactics',
      duration: '4 minutes',
      difficulty: 'Medium'
    }
  ]);

  const [activeSimulation, setActiveSimulation] = useState(null);
  const [userResults, setUserResults] = useState([
    {
      id: 1,
      simulationName: 'Device Security Audit',
      completedAt: '2024-04-17T14:30:00Z',
      score: 85,
      issuesFound: 2,
      recommendations: 3
    }
  ]);

  const handleStartSimulation = (simulation) => {
    setActiveSimulation(simulation);
    setUserSimulations(prev => prev.map(sim => 
      sim.id === simulation.id ? { ...sim, status: 'in-progress' } : sim
    ));

    // Simulate completion
    setTimeout(() => {
      setUserSimulations(prev => prev.map(sim => 
        sim.id === simulation.id ? { ...sim, status: 'completed' } : sim
      ));
      setActiveSimulation(null);
      
      // Add result
      const result = {
        id: Date.now(),
        simulationName: simulation.name,
        completedAt: new Date().toISOString(),
        score: Math.floor(Math.random() * 40) + 60,
        issuesFound: Math.floor(Math.random() * 5) + 1,
        recommendations: Math.floor(Math.random() * 4) + 2
      };
      setUserResults(prev => [result, ...prev.slice(0, 4)]);
    }, 3000);
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'available': 
        return { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' };
      case 'in-progress': 
        return { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
      case 'completed': 
        return { background: 'rgba(0, 245, 255, 0.15)', border: '1px solid rgba(0, 245, 255, 0.4)', color: '#00f5ff' };
      default: 
        return { background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#94a3b8' };
    }
  };

  const getDifficultyBadgeStyle = (difficulty) => {
    switch(difficulty) {
      case 'Easy': 
        return { background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa' };
      case 'Medium': 
        return { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
      case 'Hard': 
        return { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' };
      default: 
        return { background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#94a3b8' };
    }
  };

  return (
    <div className="user-simulation-page fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Security Training Simulations</h1>
        <p className="page-subtitle">Improve your security awareness with interactive scenarios</p>
      </div>

      {/* ROW 1: 4 Available Training, 1 Completed, 85% Average Score in ONE ROW */}
      <div className="training-stats-row">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{userSimulations.length}</div>
            <div className="stat-label">Available Training</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{userSimulations.filter(s => s.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">
              {userResults.length > 0 ? Math.round(userResults.reduce((acc, r) => acc + r.score, 0) / userResults.length) : 0}%
            </div>
            <div className="stat-label">Average Score</div>
          </div>
        </Card>
      </div>

      {/* ROW 2: Training Simulations in ONE CARD (2 Rows x Multiple Columns Grid) */}
      <div style={{ marginBottom: '24px' }}>
        <Card className="simulations-card full-width">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Training Simulations</h3>
            <span className="user-role-badge">INTERACTIVE SCENARIOS</span>
          </div>

          <div className="simulations-grid-2x2">
            {userSimulations.map(simulation => (
              <div key={simulation.id} className="simulation-item-card">
                <div className="simulation-info">
                  <div className="simulation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 className="simulation-name" style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: '700' }}>{simulation.name}</h4>
                    <div className="simulation-badges" style={{ display: 'flex', gap: '6px' }}>
                      <span 
                        className="status-badge"
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          ...getStatusBadgeStyle(simulation.status)
                        }}
                      >
                        {simulation.status === 'in-progress' ? 'IN PROGRESS' : 
                         simulation.status === 'completed' ? 'COMPLETED' : 'AVAILABLE'}
                      </span>
                      <span 
                        className="difficulty-badge"
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          ...getDifficultyBadgeStyle(simulation.difficulty)
                        }}
                      >
                        {simulation.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="simulation-description" style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 12px 0', lineHeight: '1.4' }}>
                    {simulation.description}
                  </p>
                  <div className="simulation-meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px', marginTop: '4px' }}>
                    <span className="simulation-type" style={{ color: '#00f5ff', fontWeight: '700' }}>{simulation.type.toUpperCase()}</span>
                    <span className="simulation-duration" style={{ color: '#cbd5e1' }}>Duration: {simulation.duration}</span>
                  </div>
                </div>
                <div className="simulation-actions" style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  {simulation.status === 'available' && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartSimulation(simulation)}
                      style={{
                        background: 'rgba(0, 245, 255, 0.15)',
                        border: '1px solid rgba(0, 245, 255, 0.4)',
                        color: '#00f5ff',
                        fontWeight: '700',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Start Training
                    </button>
                  )}
                  {simulation.status === 'in-progress' && (
                    <button
                      className="btn btn-warning btn-sm"
                      disabled
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        color: '#fbbf24',
                        fontWeight: '700',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        width: '100%'
                      }}
                    >
                      In Progress...
                    </button>
                  )}
                  {simulation.status === 'completed' && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStartSimulation(simulation)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#e2e8f0',
                        fontWeight: '600',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Retake Simulation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 3: Your Progress, Recent Results, Recommended Training in ONE ROW */}
      <div className="training-bottom-row">
        {/* Card 1: Your Progress */}
        <Card className="simulations-card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Your Progress</h3>
          <div className="progress-summary">
            <div className="progress-item">
              <div className="progress-label">Security Awareness</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <span className="progress-value">75%</span>
            </div>
            <div className="progress-item">
              <div className="progress-label">Device Security</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <span className="progress-value">60%</span>
            </div>
            <div className="progress-item">
              <div className="progress-label">Password Hygiene</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }}></div>
              </div>
              <span className="progress-value">85%</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Recent Results */}
        <Card className="simulations-card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Recent Results</h3>
          <div className="results-list">
            {userResults.map(result => (
              <div key={result.id} className="result-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '8px' }}>
                <div className="result-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 className="result-name" style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: '700' }}>{result.simulationName}</h4>
                  <span className={`result-score ${result.score >= 80 ? 'high' : result.score >= 60 ? 'medium' : 'low'}`} style={{ fontWeight: '700', fontSize: '13px' }}>
                    {result.score}%
                  </span>
                </div>
                <div className="result-single-line-stats" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  <span>Issues: <strong style={{ color: '#ef4444' }}>{result.issuesFound}</strong></span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <span>Recommendations: <strong style={{ color: '#00f5ff' }}>{result.recommendations}</strong></span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <span style={{ color: '#cbd5e1' }}>{new Date(result.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3: Recommended Training */}
        <Card className="simulations-card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>Recommended Training</h3>
          <div className="recommendation-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="recommendation-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="rec-content">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff' }}>Advanced Phishing Detection</h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Learn to identify email threats</p>
                <div className="rec-meta" style={{ fontSize: '10px', color: '#00f5ff', marginTop: '4px' }}>Duration: 10 min • Hard</div>
              </div>
            </div>
            <div className="recommendation-item" style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="rec-content">
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#fff' }}>Mobile Security Essentials</h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Secure smartphones & tablets</p>
                <div className="rec-meta" style={{ fontSize: '10px', color: '#00f5ff', marginTop: '4px' }}>Duration: 8 min • Easy</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserSimulation;
