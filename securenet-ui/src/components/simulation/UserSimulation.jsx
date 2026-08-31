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

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#00ff00';
      case 'in-progress': return '#ffaa00';
      case 'completed': return '#00f5ff';
      default: return '#888';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#00ffcc';
      case 'Medium': return '#ffaa00';
      case 'Hard': return '#ff3366';
      default: return '#888';
    }
  };

  return (
    <div className="user-simulation-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Security Training Simulations</h1>
        <p className="page-subtitle">Improve your security awareness with interactive scenarios</p>
      </div>

      <div className="training-stats">
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

      <div className="simulations-grid">
        <Card className="simulations-card full-width">
          <h3 className="card-title">Training Simulations</h3>
          <div className="simulations-list">
            {userSimulations.map(simulation => (
              <div key={simulation.id} className="simulation-item">
                <div className="simulation-info">
                  <div className="simulation-header">
                    <h4 className="simulation-name">{simulation.name}</h4>
                    <div className="simulation-badges">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(simulation.status) }}
                      >
                        {simulation.status === 'in-progress' ? 'IN PROGRESS' : 
                         simulation.status === 'completed' ? 'COMPLETED' : 'AVAILABLE'}
                      </span>
                      <span 
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(simulation.difficulty) }}
                      >
                        {simulation.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="simulation-description">{simulation.description}</p>
                  <div className="simulation-meta">
                    <span className="simulation-type">{simulation.type}</span>
                    <span className="simulation-duration">Duration: {simulation.duration}</span>
                  </div>
                </div>
                <div className="simulation-actions">
                  {simulation.status === 'available' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleStartSimulation(simulation)}
                    >
                      Start Training
                    </button>
                  )}
                  {simulation.status === 'in-progress' && (
                    <button className="btn btn-warning" disabled>
                      In Progress...
                    </button>
                  )}
                  {simulation.status === 'completed' && (
                    <button className="btn btn-outline">
                      Retake
                    </button>
                  )}
                  <button className="btn btn-outline">Details</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="simulations-card">
          <h3 className="card-title">Your Progress</h3>
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

        <Card className="simulations-card">
          <h3 className="card-title">Recent Results</h3>
          <div className="results-list">
            {userResults.map(result => (
              <div key={result.id} className="result-item">
                <div className="result-header">
                  <h4 className="result-name">{result.simulationName}</h4>
                  <span className={`result-score ${result.score >= 80 ? 'high' : result.score >= 60 ? 'medium' : 'low'}`}>
                    {result.score}%
                  </span>
                </div>
                <div className="result-stats">
                  <div className="stat">
                    <span className="stat-label">Issues:</span>
                    <span className="stat-value">{result.issuesFound}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Recommendations:</span>
                    <span className="stat-value">{result.recommendations}</span>
                  </div>
                </div>
                <div className="result-time">
                  {new Date(result.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="recommendations-section">
        <Card className="recommendations-card">
          <h3 className="card-title">Recommended Training</h3>
          <div className="recommendation-list">
            <div className="recommendation-item">
              <div className="rec-icon">security</div>
              <div className="rec-content">
                <h4>Advanced Phishing Detection</h4>
                <p>Learn to identify sophisticated phishing attacks</p>
                <div className="rec-meta">Duration: 10 minutes | Difficulty: Hard</div>
              </div>
              <button className="btn btn-outline btn-sm">Enroll</button>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon">devices</div>
              <div className="rec-content">
                <h4>Mobile Security Essentials</h4>
                <p>Secure your smartphone and tablet devices</p>
                <div className="rec-meta">Duration: 8 minutes | Difficulty: Easy</div>
              </div>
              <button className="btn btn-outline btn-sm">Enroll</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserSimulation;
