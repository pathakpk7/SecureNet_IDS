import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import Card from '../ui/Card';
import BarChart from '../Charts/BarChart';
import PieChart from '../Charts/PieChart';
import toast from 'react-hot-toast';
import '../../styles/pages/analysis.css';

const AdminAttackAnalysis = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [attackFrequencyData, setAttackFrequencyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [45, 52, 38, 65, 48, 32, 28]
  });

  const [attackTypeData, setAttackTypeData] = useState({
    labels: ['SQL Injection', 'DDoS SYN Flood', 'Brute Force', 'Port Scan', 'Ransomware C2', 'XSS Scripting'],
    values: [347, 289, 412, 156, 89, 234]
  });

  const [mitreAttacks, setMitreAttacks] = useState([
    { id: 1, type: 'SQL Injection (Union-based)', mitre: 'T1190', target: 'Database Cluster (MySQL)', severity: 'critical', count: 347, trend: 'up', percentage: '+28%' },
    { id: 2, type: 'DDoS SYN Flood Burst', mitre: 'T1498', target: 'Web Gateway Edge', severity: 'high', count: 289, trend: 'down', percentage: '-14%' },
    { id: 3, type: 'SSH Credential Brute Force', mitre: 'T1110', target: 'Bastion SSH Node', severity: 'high', count: 412, trend: 'up', percentage: '+18%' },
    { id: 4, type: 'Port Reconnaissance Sweep', mitre: 'T1046', target: 'DMZ Firewall Interface', severity: 'medium', count: 156, trend: 'stable', percentage: '0%' },
    { id: 5, type: 'Ransomware C2 Beaconing', mitre: 'T1071', target: 'File Storage Server', severity: 'critical', count: 89, trend: 'down', percentage: '-6%' },
    { id: 6, type: 'Cross-Site Scripting (XSS)', mitre: 'T1059', target: 'Client API Gateway', severity: 'medium', count: 234, trend: 'up', percentage: '+12%' }
  ]);

  const [threatActorIPs, setThreatActorIPs] = useState([
    { ip: '203.0.113.45', country: 'Russia (RU)', target: 'API Gateway', riskScore: 98, status: 'Active Threat', blocked: false },
    { ip: '45.33.32.156', country: 'China (CN)', target: 'Web Edge', riskScore: 94, status: 'Blocked', blocked: true },
    { ip: '198.51.100.77', country: 'United States (US)', target: 'Database Server', riskScore: 88, status: 'Monitoring', blocked: false },
    { ip: '185.220.101.5', country: 'Germany (DE)', target: 'File Storage', riskScore: 96, status: 'Blocked', blocked: true },
    { ip: '192.168.1.105', country: 'Internal Subnet', target: 'Core Switch', riskScore: 82, status: 'Quarantined', blocked: false }
  ]);

  // Simulate live threat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackFrequencyData(prev => ({
        ...prev,
        values: prev.values.map(val => Math.max(10, Math.min(100, val + Math.floor((Math.random() - 0.5) * 8))))
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleBlockIP = (ip) => {
    setThreatActorIPs(prev =>
      prev.map(item =>
        item.ip === ip ? { ...item, status: 'Blocked', blocked: true } : item
      )
    );
    toast.success(`Attacker IP ${ip} blocked on perimeter firewall`);
  };

  const handleDeployWAF = () => {
    toast.success('WAF Rule ruleset deployed to cloud gateway');
  };

  const handleExportPCAP = () => {
    toast.success('PCAP Forensic Log archive download initiated');
  };

  const handleQuarantine = () => {
    toast.success('Target host quarantined from internal VLAN');
  };

  const getSeverityBadgeColor = (severity) => {
    switch (String(severity).toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      default: return '#00f5ff';
    }
  };

  return (
    <div className="attack-analysis-page fade-in">
      {/* Top Box: Header, Range Controls, and 6 KPI Pills */}
      <Card className="aa-header-kpi-card">
        <div className="aa-header-content">
          <div className="page-header-text">
            <h1 className="page-title">Cyber Threat & Attack Vector Analysis</h1>
            <p className="page-subtitle">In-depth attack taxonomy, MITRE ATT&CK mappings, threat actor geolocations, and incident response playbooks</p>
          </div>
          <div className="aa-controls-group">
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px' }}>Range:</span>
            {['24h', '7d', '30d', '90d'].map(range => (
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

        {/* 6 KPI Pills */}
        <div className="aa-kpi-row">
          <div className="aa-kpi-pill">
            <span className="val text-red">1,247</span>
            <span className="lbl">Total Cyber Attacks</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-emerald">892</span>
            <span className="lbl">Automated Blocks</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-yellow">45</span>
            <span className="lbl">Active Exploits</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-red">23</span>
            <span className="lbl">Critical Severity</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-cyan">156</span>
            <span className="lbl">Mitigated Incidents</span>
          </div>
          <div className="aa-kpi-pill">
            <span className="val text-emerald">98.6%</span>
            <span className="lbl">AI Detection Rate</span>
          </div>
        </div>
      </Card>

      {/* Row 2: CHARTS ROW (Attack Frequency BarChart + Threat Taxonomy PieChart) */}
      <div className="aa-charts-row">
        <Card className="aa-chart-card">
          <div className="aa-card-header">
            <h3>Attack Frequency Histogram (Daily Surges)</h3>
            <span className="aa-badge">7-DAY HISTOGRAM</span>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <BarChart 
              data={attackFrequencyData} 
              title="Daily Attack Frequency"
              height="100%"
            />
          </div>
        </Card>

        <Card className="aa-chart-card">
          <div className="aa-card-header">
            <h3>Threat Vector Distribution</h3>
            <span className="aa-badge">TAXONOMY</span>
          </div>
          <div style={{ height: '240px', position: 'relative' }}>
            <PieChart 
              data={attackTypeData}
              title="Attack Vector Categories"
              height="100%"
            />
          </div>
        </Card>
      </div>

      {/* Row 3: SIDE-BY-SIDE TABLES ROW (MITRE ATT&CK + Threat Actor IPs) */}
      <div className="aa-tables-row">
        <Card className="aa-table-card">
          <div className="aa-card-header">
            <h3>MITRE ATT&CK Threat Vector Classification</h3>
            <span className="aa-badge mitre">MITRE v14 MAPPED</span>
          </div>

          <div className="aa-table-wrapper">
            <table className="aa-table">
              <thead>
                <tr>
                  <th>Attack Category</th>
                  <th>MITRE ID</th>
                  <th>Target Asset</th>
                  <th>Severity</th>
                  <th>Count</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {mitreAttacks.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-white">{item.type}</td>
                    <td><span className="mitre-code">{item.mitre}</span></td>
                    <td className="text-gray-300">{item.target}</td>
                    <td>
                      <span 
                        className="nm-status-badge"
                        style={{ 
                          backgroundColor: `${getSeverityBadgeColor(item.severity)}18`, 
                          color: getSeverityBadgeColor(item.severity),
                          border: `1px solid ${getSeverityBadgeColor(item.severity)}40` 
                        }}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="font-bold font-mono text-cyan">{item.count}</td>
                    <td>
                      <span className={`trend-badge ${item.trend}`}>
                        {item.percentage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="aa-table-card">
          <div className="aa-card-header">
            <h3>Attacker Geolocation & Threat Actor IP Intelligence</h3>
            <span className="aa-badge">5 HIGH-RISK NODES</span>
          </div>

          <div className="aa-table-wrapper">
            <table className="aa-table">
              <thead>
                <tr>
                  <th>Attacker Source IP</th>
                  <th>Location</th>
                  <th>Target</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {threatActorIPs.map((actor, idx) => (
                  <tr key={idx}>
                    <td className="font-mono text-cyan font-bold">{actor.ip}</td>
                    <td className="text-gray-200" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={13} style={{ color: '#00f0ff' }} />
                      {actor.country}
                    </td>
                    <td className="text-gray-300">{actor.target}</td>
                    <td>
                      <span className="font-mono font-bold text-red">{actor.riskScore}/100</span>
                    </td>
                    <td>
                      <span className={`nm-status-badge ${actor.blocked ? 'btn-active-mon' : 'btn-block-action'}`}>
                        {actor.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="nm-btn-sm btn-block-action"
                        onClick={() => handleBlockIP(actor.ip)}
                        disabled={actor.blocked}
                      >
                        {actor.blocked ? 'Blocked' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Row 4: INCIDENT CONTAINMENT PLAYBOOKS & ACTION RESPONSE */}
      <Card className="aa-playbooks-card">
        <div className="aa-card-header">
          <h3>Automated Incident Containment & Response Playbooks</h3>
          <span className="aa-badge">ACTIVE RESPONSE</span>
        </div>

        <div className="aa-playbooks-grid">
          <button className="aa-playbook-btn btn-waf" onClick={handleDeployWAF}>
            Deploy WAF Rule
          </button>
          <button className="aa-playbook-btn btn-pcap" onClick={handleExportPCAP}>
            Export PCAP Forensic Log
          </button>
          <button className="aa-playbook-btn btn-quarantine" onClick={handleQuarantine}>
            Trigger Host Containment
          </button>
          <button className="aa-playbook-btn btn-notify" onClick={() => toast.success('SOC Incident Response Team notified')}>
            Notify SOC Team
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminAttackAnalysis;
