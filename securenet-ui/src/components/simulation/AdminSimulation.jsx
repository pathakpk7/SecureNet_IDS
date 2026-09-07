import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/simulation.css';

const AdminSimulation = () => {
  const [simulations, setSimulations] = useState([
    {
      id: 1,
      name: 'DDoS Attack Simulation',
      status: 'ready',
      type: 'network',
      description: 'Simulate distributed denial of service attack',
      duration: '5 minutes',
      impact: 'Medium'
    },
    {
      id: 2,
      name: 'SQL Injection Test',
      status: 'ready',
      type: 'web',
      description: 'Test SQL injection vulnerability detection',
      duration: '3 minutes',
      impact: 'Low'
    },
    {
      id: 3,
      name: 'Ransomware Scenario',
      status: 'running',
      type: 'malware',
      description: 'Simulate ransomware attack pattern',
      duration: '10 minutes',
      impact: 'High'
    },
    {
      id: 4,
      name: 'Phishing Campaign',
      status: 'completed',
      type: 'social',
      description: 'Simulate phishing email campaign',
      duration: '7 minutes',
      impact: 'Medium'
    }
  ]);

  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);

  // Simulate real-time simulation updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulations(prev => prev.map(sim => {
        if (sim.status === 'running') {
          // Randomly complete running simulations
          if (Math.random() > 0.7) {
            return { ...sim, status: 'completed' };
          }
        }
        return sim;
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleStartSimulation = (simulation) => {
    setActiveSimulation(simulation);
    setSimulations(prev => prev.map(sim => 
      sim.id === simulation.id ? { ...sim, status: 'running' } : sim
    ));

    // Simulate completion after duration
    setTimeout(() => {
      setSimulations(prev => prev.map(sim => 
        sim.id === simulation.id ? { ...sim, status: 'completed' } : sim
      ));
      setActiveSimulation(null);
      
      // Add results
      const result = {
        id: Date.now(),
        simulationName: simulation.name,
        timestamp: new Date().toISOString(),
        threatsDetected: Math.floor(Math.random() * 20) + 5,
        blocked: Math.floor(Math.random() * 15) + 3,
        missed: Math.floor(Math.random() * 5) + 1,
        score: Math.floor(Math.random() * 30) + 70
      };
      setSimulationResults(prev => [result, ...prev.slice(0, 9)]);
    }, 5000);
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'ready': 
        return { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' };
      case 'running': 
        return { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
      case 'completed': 
        return { background: 'rgba(0, 245, 255, 0.15)', border: '1px solid rgba(0, 245, 255, 0.4)', color: '#00f5ff' };
      default: 
        return { background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#94a3b8' };
    }
  };

  const getImpactBadgeStyle = (impact) => {
    switch(impact) {
      case 'Low': 
        return { background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa' };
      case 'Medium': 
        return { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' };
      case 'High': 
        return { background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444' };
      default: 
        return { background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#94a3b8' };
    }
  };

  return (
    <div className="admin-simulation-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Attack Simulation Center</h1>
        <p className="page-subtitle">Test security defenses with controlled attack scenarios</p>
      </div>

      <div className="simulation-controls">
        <Card className="control-card">
          <h3 className="card-title">Simulation Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Ready:</span>
              <span className="status-value">
                {simulations.filter(s => s.status === 'ready').length}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Running:</span>
              <span className="status-value">
                {simulations.filter(s => s.status === 'running').length}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Completed:</span>
              <span className="status-value">
                {simulations.filter(s => s.status === 'completed').length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="control-card">
          <h3 className="card-title">System Impact</h3>
          <div className="impact-warning">
            <span className="warning-icon">warning</span>
            <p>Simulations run in isolated environment. No real systems affected.</p>
          </div>
        </Card>
      </div>

      <div className="simulations-grid">
        <Card className="simulations-card full-width">
          <h3 className="card-title">Available Simulations</h3>
          <div className="simulations-list">
            {simulations.map(simulation => (
              <div key={simulation.id} className="simulation-item">
                <div className="simulation-info">
                  <div className="simulation-header">
                    <h4 className="simulation-name">{simulation.name}</h4>
                    <div className="simulation-badges">
                      <span 
                        className="status-badge"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          ...getStatusBadgeStyle(simulation.status)
                        }}
                      >
                        {simulation.status.toUpperCase()}
                      </span>
                      <span 
                        className="impact-badge"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                          ...getImpactBadgeStyle(simulation.impact)
                        }}
                      >
                        {simulation.impact} IMPACT
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
                  {simulation.status === 'ready' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleStartSimulation(simulation)}
                    >
                      Start Simulation
                    </button>
                  )}
                  {simulation.status === 'running' && (
                    <button className="btn btn-warning" disabled>
                      Running...
                    </button>
                  )}
                  {simulation.status === 'completed' && (
                    <button className="btn btn-outline">
                      View Results
                    </button>
                  )}
                  <button className="btn btn-outline">Configure</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="simulations-card">
          <h3 className="card-title">Recent Results</h3>
          <div className="results-list">
            {simulationResults.length === 0 ? (
              <div className="no-results">
                <p>No simulation results yet. Run a simulation to see results.</p>
              </div>
            ) : (
              simulationResults.map(result => (
                <div key={result.id} className="result-item">
                  <div className="result-header">
                    <h4 className="result-name">{result.simulationName}</h4>
                    <span className="result-score">{result.score}%</span>
                  </div>
                  <div className="result-stats">
                    <div className="stat">
                      <span className="stat-label">Detected:</span>
                      <span className="stat-value">{result.threatsDetected}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Blocked:</span>
                      <span className="stat-value">{result.blocked}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Missed:</span>
                      <span className="stat-value">{result.missed}</span>
                    </div>
                  </div>
                  <div className="result-time">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="simulations-card">
          <h3 className="card-title">Simulation Templates</h3>
          <div className="templates-list">
            <div className="template-item">
              <h4>Custom Scenario</h4>
              <p>Create your own attack simulation</p>
              <button className="btn btn-outline btn-sm">Create</button>
            </div>
            <div className="template-item">
              <h4>Industry Standard</h4>
              <p>MITRE ATT&CK framework scenarios</p>
              <button className="btn btn-outline btn-sm">Browse</button>
            </div>
            <div className="template-item">
              <h4>Historical Attacks</h4>
              <p>Simulate real-world attack patterns</p>
              <button className="btn btn-outline btn-sm">Explore</button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSimulation;
