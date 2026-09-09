import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import BarChart from '../Charts/BarChart';
import { Play, Activity, ShieldAlert, Cpu, Network, CheckCircle2, AlertTriangle, ShieldCheck, Plus, TerminalSquare, BookOpen, Clock, StopCircle, Settings, BarChart2, Trash2, X, Save } from 'lucide-react';

const AdminSimulation = () => {
  const [simulations, setSimulations] = useState([
    { id: 1, name: 'DDoS SYN Flood', status: 'ready', impact: 'High', type: 'Network', duration: '5m', description: 'Simulates a volumetric SYN flood attack against the edge router.', graphData: null },
    { id: 2, name: 'SQL Injection Scan', status: 'running', impact: 'Medium', type: 'Application', duration: '10m', description: 'Automated SQLi payloads against the web API endpoints.', graphData: null },
    { id: 3, name: 'Brute Force SSH', status: 'completed', impact: 'Low', type: 'Authentication', duration: '15m', description: 'Dictionary attack against SSH port 22 with common credentials.', graphData: { labels: ['0s', '5s', '10s', '15s'], values: [10, 45, 120, 145] } },
    { id: 4, name: 'Ransomware Beacon', status: 'ready', impact: 'Critical', type: 'Malware', duration: 'Continuous', description: 'Simulates C2 beaconing typical of modern ransomware strains.', graphData: null },
  ]);

  const [simulationResults, setSimulationResults] = useState([
    { id: 1, simulationName: 'Brute Force SSH', score: 98, threatsDetected: 145, blocked: 145, missed: 0, timestamp: Date.now() - 3600000 },
    { id: 2, simulationName: 'Previous SQLi Scan', score: 85, threatsDetected: 42, blocked: 35, missed: 7, timestamp: Date.now() - 86400000 },
  ]);

  const [expandedResultId, setExpandedResultId] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingSim, setEditingSim] = useState(null);

  const handleSaveConfig = () => {
    setSimulations(prev => prev.map(s => s.id === editingSim.id ? editingSim : s));
    setShowConfigModal(false);
    setEditingSim(null);
  };

  // Dynamic KPIs
  const activeScenarios = simulations.filter(s => s.status === 'running').length;
  const totalPassed = simulationResults.length;
  
  const avgBlockRate = useMemo(() => {
    let blocked = 0;
    let detected = 0;
    simulationResults.forEach(r => {
      blocked += r.blocked;
      detected += r.threatsDetected;
    });
    if (detected === 0) return '0.0';
    return ((blocked / detected) * 100).toFixed(1);
  }, [simulationResults]);

  const handleStartSimulation = (sim) => {
    setSimulations(prev => prev.map(s => s.id === sim.id ? { ...s, status: 'running', graphData: null } : s));
  };

  const handleStopSimulation = (sim) => {
    const detected = Math.floor(Math.random() * 200) + 50;
    const missed = Math.floor(Math.random() * 10);
    const blocked = detected - missed;
    const score = Math.round((blocked / detected) * 100);
    
    const newResult = {
      id: Date.now(),
      simulationName: sim.name,
      score,
      threatsDetected: detected,
      blocked,
      missed,
      timestamp: Date.now()
    };

    setSimulationResults(prev => [newResult, ...prev]);

    // Generate random varying graph shapes
    const p1 = Math.random();
    const p2 = Math.random();
    const p3 = Math.random();
    const p4 = Math.random();
    const totalP = p1 + p2 + p3 + p4;

    setSimulations(prev => prev.map(s => s.id === sim.id ? { 
      ...s, 
      status: 'completed',
      graphData: {
        labels: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
        values: [
          Math.floor(detected * (p1/totalP)), 
          Math.floor(detected * (p2/totalP)), 
          Math.floor(detected * (p3/totalP)), 
          Math.floor(detected * (p4/totalP))
        ]
      }
    } : s));
  };

  const handleAddCustom = () => {
    const newSim = {
      id: Date.now(),
      name: 'Custom User Scenario ' + Math.floor(Math.random() * 1000),
      status: 'ready',
      impact: 'Medium',
      type: 'Custom',
      duration: '10m',
      description: 'User defined custom threat emulation payload.',
      graphData: null,
      isCustom: true
    };
    setSimulations(prev => [newSim, ...prev]);
  };

  const handleDeleteSimulation = (id) => {
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'ready': 
        return { background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' };
      case 'running': 
        return { background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#a855f7', animation: 'pulse 2s infinite' };
      case 'completed': 
        return { background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#10b981' };
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
      case 'Critical': 
        return { background: 'rgba(153, 27, 27, 0.25)', border: '1px solid rgba(239, 68, 68, 0.6)', color: '#fca5a5' };
      default: 
        return { background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.4)', color: '#94a3b8' };
    }
  };

  return (
    <div className="admin-simulation-page fade-in" style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={32} color="#00f5ff" />
            Attack Simulation Center
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '1rem' }}>Test security defenses, AI models, and rulesets with controlled attack scenarios</p>
        </div>
      </div>

      {/* SYSTEM ISOLATION ALERT - MOVED TO TOP */}
      <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={20} color="#eab308" />
        <span style={{ color: '#fde047', fontSize: '13.5px', fontWeight: '500' }}>
          <b>System Isolation:</b> All simulations run in a sandboxed staging environment. Live network production traffic is <b>not affected</b>. Threat telemetry is routed to a parallel ML inference queue.
        </span>
      </div>

      {/* COMPACT DYNAMIC KPIs IN ONE BOX */}
      <Card style={{ padding: '0', background: 'rgba(15, 23, 42, 0.8)', overflow: 'hidden' }}>
        <div className="admin-sim-kpis">
          
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Cpu size={20} color="#a855f7" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Active Scenarios: <b style={{ color: '#f8fafc', fontSize: '16px', marginLeft: '6px' }}>{activeScenarios}</b>
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={20} color="#10b981" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Total Tests Passed: <b style={{ color: '#f8fafc', fontSize: '16px', marginLeft: '6px' }}>{totalPassed}</b>
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <ShieldAlert size={20} color="#ef4444" />
            <div style={{ fontSize: '14px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
              Avg Threat Block Rate: <b style={{ color: '#fca5a5', fontSize: '16px', marginLeft: '6px' }}>{avgBlockRate}%</b>
            </div>
          </div>

        </div>
      </Card>

      <div className="admin-sim-layout">
        
        {/* AVAILABLE SIMULATIONS - LEFT COL */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={20} color="#38bdf8" /> Available Simulations
            </h3>
            <button 
              onClick={handleAddCustom}
              style={{
                background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: '1px dashed #38bdf8', 
                padding: '6px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', 
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'}
            >
              <Plus size={14} /> Add Custom Scenario
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {simulations.map(sim => (
              <div key={sim.id} style={{
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', transition: 'all 0.2s', position: 'relative'
              }}>
                <div className="admin-sim-item-inner">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>{sim.name}</h4>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', ...getStatusBadgeStyle(sim.status) }}>
                        {sim.status.toUpperCase()}
                      </span>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', ...getImpactBadgeStyle(sim.impact) }}>
                        {sim.impact.toUpperCase()} IMPACT
                      </span>
                      {sim.isCustom && (
                        <button 
                          onClick={() => handleDeleteSimulation(sim.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', marginRight: '16px', fontSize: '12px', fontWeight: 'bold' }}
                          title="Delete Custom Scenario"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>{sim.description}</p>
                    
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cpu size={14}/> {sim.type}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {sim.duration}</span>
                    </div>
                  </div>

                  <div className="admin-sim-actions-col">
                    {sim.status === 'ready' && (
                      <button onClick={() => handleStartSimulation(sim)} style={{
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <Play size={16} /> Start
                      </button>
                    )}
                    {sim.status === 'running' && (
                      <button onClick={() => handleStopSimulation(sim)} style={{
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                        <StopCircle size={16} /> Stop
                      </button>
                    )}
                    {sim.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => handleStartSimulation(sim)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Play size={16} /> Restart
                        </button>
                        <button 
                          onClick={() => setExpandedResultId(expandedResultId === sim.id ? null : sim.id)}
                          style={{
                            background: expandedResultId === sim.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <BarChart2 size={16} /> {expandedResultId === sim.id ? 'Hide Results' : 'View Results'}
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => { setEditingSim(sim); setShowConfigModal(true); }}
                      style={{
                        background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}>
                      <Settings size={14}/> Configure
                    </button>
                  </div>
                </div>

                {/* GRAPH RESULTS SECTION */}
                {expandedResultId === sim.id && sim.graphData && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>
                      <Activity size={16} color="#38bdf8" /> Execution Telemetry
                    </div>
                    <div style={{ height: '180px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '16px' }}>
                      <BarChart data={sim.graphData} title="Attack Vector Payload Intensity" height="100%" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT COL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#818cf8" /> Templates Library
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div 
                onClick={handleAddCustom}
                style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px dashed #475569', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#38bdf8'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#475569'}
              >
                <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TerminalSquare size={14} color="#38bdf8" /> Custom Scenario
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Build your own attack payload</p>
              </div>

              <div 
                style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px dashed #475569', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#10b981'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#475569'}
              >
                <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#10b981" /> Industry Standard
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>MITRE ATT&CK framework vectors</p>
              </div>

            </div>
          </Card>

          <Card style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" /> Recent Results
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {simulationResults.map(res => (
                <div key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '14px' }}>{res.simulationName}</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold' }}>{res.score}%</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                    <span>Block: <span style={{ color: '#f8fafc' }}>{res.blocked}</span></span>
                    <span>Miss: <span style={{ color: res.missed > 0 ? '#ef4444' : '#f8fafc' }}>{res.missed}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {showConfigModal && editingSim && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ width: '450px', padding: '24px', background: '#0f172a', border: '1px solid rgba(0,245,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={18} color="#38bdf8"/> Configure Scenario
              </h3>
              <button onClick={() => { setShowConfigModal(false); setEditingSim(null); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Scenario Name</label>
                <input type="text" value={editingSim.name} onChange={e => setEditingSim({...editingSim, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Description</label>
                <textarea value={editingSim.description} onChange={e => setEditingSim({...editingSim, description: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', minHeight: '60px' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Target Type</label>
                  <select value={editingSim.type} onChange={e => setEditingSim({...editingSim, type: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                    <option value="Network">Network</option>
                    <option value="Application">Application</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Malware">Malware</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Duration</label>
                  <input type="text" value={editingSim.duration} onChange={e => setEditingSim({...editingSim, duration: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '6px' }}>Impact Level</label>
                <select value={editingSim.impact} onChange={e => setEditingSim({...editingSim, impact: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '6px', fontSize: '13px', outline: 'none' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowConfigModal(false); setEditingSim(null); }} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleSaveConfig} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14}/> Save Configuration</button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default AdminSimulation;
