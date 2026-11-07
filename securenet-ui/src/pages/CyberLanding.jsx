import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Zap, 
  ArrowRight, 
  Radio, 
  Lock, 
  Terminal, 
  Server,
  Layers,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import '../styles/pages/cyber-landing.css';

const ATTACK_SCENARIOS = {
  baseline: {
    label: "Normal Traffic Flow",
    status: "Secure",
    protocol: "TLSv1.3 / TCP",
    throughput: "48.2 MB/s",
    latency: "0.84 ms",
    features: "SYN/ACK Ratio: 1.01 • Window: 64240 • Entropy: 0.12",
    verdict: "Classified as Benign Traffic",
    verdictType: "safe",
    ip: "192.168.1.144"
  },
  ddos: {
    label: "Volumetric SYN Flood",
    status: "Attack Detected",
    protocol: "TCP SYN / Raw Socket",
    throughput: "940.6 MB/s",
    latency: "1.12 ms",
    features: "SYN Ratio: 98.4% • Incomplete Handshakes • High Port Drift",
    verdict: "RandomForest Confidence: 99.8% • Malicious DoS Vector",
    verdictType: "critical",
    ip: "45.142.214.88"
  },
  portscan: {
    label: "Stealth Reconnaissance Probe",
    status: "Probe Infiltration",
    protocol: "TCP FIN / NULL Sweep",
    throughput: "14.2 KB/s",
    latency: "0.96 ms",
    features: "Port Uniformity: High • Sequential Destination • Zero Payload",
    verdict: "Threat Score: 94/100 • Automated Boundary Null-Route Issued",
    verdictType: "warning",
    ip: "185.220.101.5"
  }
};

const CyberLanding = () => {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [packetCount, setPacketCount] = useState(148920);
  const [threatCount, setThreatCount] = useState(418);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scenario = ATTACK_SCENARIOS[activeScenario];

  // Smooth live packet counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 8) + 3);
      if (activeScenario !== 'baseline' && Math.random() > 0.6) {
        setThreatCount(prev => prev + 1);
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [activeScenario]);

  const handleLaunchDashboard = (e) => {
    if (e) e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="landing-experience">
      {/* Editorial Navigation */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-group">
            <Link to="/" className="brand-anchor">
              <img src="/logo.jpg" alt="SecureNet IDS" className="brand-symbol" />
              <div className="brand-text">
                <span className="brand-title">SecureNet</span>
                <span className="brand-descriptor">Network Defense</span>
              </div>
            </Link>
          </div>

          <nav className="desktop-links" aria-label="Main Navigation">
            <a href="#telemetry" className="nav-anchor">Live Console</a>
            <a href="#architecture" className="nav-anchor">Architecture</a>
            <a href="#capabilities" className="nav-anchor">Capabilities</a>
            <a href="#benchmarks" className="nav-anchor">Benchmarks</a>
          </nav>

          <div className="nav-actions">
            <Link to="/login" className="btn-ghost">
              Sign In
            </Link>
            <button 
              onClick={handleLaunchDashboard} 
              className="btn-primary"
              aria-label="Open Security Operations Center Dashboard"
            >
              <span>SOC Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button 
              className="mobile-nav-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <a href="#telemetry" onClick={() => setMobileMenuOpen(false)}>Live Console</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#benchmarks" onClick={() => setMobileMenuOpen(false)}>Benchmarks</a>
            <div className="mobile-drawer-footer">
              <Link to="/login" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <button onClick={(e) => { setMobileMenuOpen(false); handleLaunchDashboard(e); }} className="btn-primary">
                Open SOC Dashboard
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-editorial">
          <div className="hero-content anim-reveal">
            <div className="system-status-indicator">
              <span className="status-indicator"></span>
              <span className="status-label">Operational Network Telemetry</span>
            </div>

            <h1 className="hero-headline">
              Intelligent intrusion detection for high-throughput enterprise networks
            </h1>

            <p className="hero-narrative anim-fade-up anim-stagger-1">
              Continuous wire-level packet stream ingestion, 41-dimensional flow vectorization, 
              and sub-millisecond machine learning inference engineered for modern Security Operations Centers.
            </p>

            <div className="hero-actions anim-fade-up anim-stagger-2">
              <button onClick={handleLaunchDashboard} className="btn-primary-large">
                <span>Enter Operator Console</span>
                <ArrowRight size={16} />
              </button>
              <Link to="/signup" className="btn-secondary-large">
                Register Organization
              </Link>
            </div>
          </div>

          {/* Interactive Live Telemetry Console */}
          <div id="telemetry" className="live-telemetry-viewport anim-fade-up anim-stagger-3">
            <div className="console-chrome">
              <div className="chrome-controls">
                <span className="dot dot-close"></span>
                <span className="dot dot-min"></span>
                <span className="dot dot-max"></span>
                <span className="console-title">telemetry-stream.ids • active wire probe</span>
              </div>
              <div className="scenario-switcher" role="tablist">
                <button 
                  className={`scenario-btn ${activeScenario === 'baseline' ? 'active' : ''}`}
                  onClick={() => setActiveScenario('baseline')}
                >
                  Baseline
                </button>
                <button 
                  className={`scenario-btn ${activeScenario === 'ddos' ? 'active' : ''}`}
                  onClick={() => setActiveScenario('ddos')}
                >
                  DDoS Vector
                </button>
                <button 
                  className={`scenario-btn ${activeScenario === 'portscan' ? 'active' : ''}`}
                  onClick={() => setActiveScenario('portscan')}
                >
                  Recon Probe
                </button>
              </div>
            </div>

            <div className="console-body">
              <div className="telemetry-readout-grid">
                <div className="readout-cell">
                  <span className="readout-label">Live Scenario</span>
                  <span className="readout-value">{scenario.label}</span>
                </div>
                <div className="readout-cell">
                  <span className="readout-label">Packet Throughput</span>
                  <span className="readout-value mono-data">{scenario.throughput}</span>
                </div>
                <div className="readout-cell">
                  <span className="readout-label">Inference Latency</span>
                  <span className="readout-value mono-data">{scenario.latency}</span>
                </div>
                <div className="readout-cell">
                  <span className="readout-label">Source Identity</span>
                  <span className="readout-value mono-data">{scenario.ip}</span>
                </div>
              </div>

              <div className="console-log-row">
                <div className="log-descriptor">
                  <Terminal size={14} className="log-icon" />
                  <span className="log-prefix">Extracted Vectors:</span>
                </div>
                <div className="log-content mono-data">{scenario.features}</div>
              </div>

              <div className={`verdict-banner verdict-${scenario.verdictType}`}>
                <div className="verdict-status-dot"></div>
                <div className="verdict-text-wrapper">
                  <span className="verdict-lead">Decision Engine:</span>
                  <span className="verdict-detail">{scenario.verdict}</span>
                </div>
              </div>
            </div>

            <div className="console-footer-strip">
              <div className="footer-metric">
                <span className="metric-caption">Processed Packets:</span>
                <span className="metric-figure mono-data">{packetCount.toLocaleString()}</span>
              </div>
              <div className="footer-metric">
                <span className="metric-caption">Mitigated Incursions:</span>
                <span className="metric-figure mono-data">{threatCount}</span>
              </div>
              <div className="footer-metric live-flag">
                <span className="status-indicator"></span>
                <span>Kernel Ring Zero-Loss Sync</span>
              </div>
            </div>
          </div>
        </section>

        {/* Editorial Architecture Narrative */}
        <section id="architecture" className="editorial-section">
          <div className="section-head">
            <span className="section-category">Inspection Pipeline</span>
            <h2 className="section-title">End-to-end execution path from raw frame to firewall enforcement</h2>
            <p className="section-summary">
              A distributed inspection framework built to classify anomalous traffic patterns at line speed without bottlenecking mission-critical throughput.
            </p>
          </div>

          <div className="pipeline-flow-grid">
            <div className="pipeline-node hover-lift">
              <div className="node-header">
                <Radio size={20} className="node-icon" />
                <h3 className="node-title">Wire-Speed Capture</h3>
              </div>
              <p className="node-copy">
                Kernel-level socket hooks interface with incoming network interfaces. Zero-copy ring buffers capture TCP, UDP, and ICMP frames with negligible CPU overhead.
              </p>
              <div className="node-meta">
                <span className="meta-item">Kernel AF_PACKET</span>
                <span className="meta-item">Ring Buffer Architecture</span>
              </div>
            </div>

            <div className="pipeline-node hover-lift">
              <div className="node-header">
                <Cpu size={20} className="node-icon" />
                <h3 className="node-title">Vector Normalization</h3>
              </div>
              <p className="node-copy">
                Raw packets are processed into 41 mathematical flow features, including SYN/ACK ratios, payload entropy, flag transitions, and inter-arrival timing variances.
              </p>
              <div className="node-meta">
                <span className="meta-item">41 Dimensions</span>
                <span className="meta-item">StandardScaler Pipeline</span>
              </div>
            </div>

            <div className="pipeline-node hover-lift">
              <div className="node-header">
                <Layers size={20} className="node-icon" />
                <h3 className="node-title">RandomForest Inference</h3>
              </div>
              <p className="node-copy">
                Trained against industry-standard NSL-KDD and CICIDS corpora to accurately segregate legitimate user sessions from DoS floods, reconnaissance probes, and privilege escalations.
              </p>
              <div className="node-meta">
                <span className="meta-item">Multi-Class Classifier</span>
                <span className="meta-item">99.4% Validation Score</span>
              </div>
            </div>

            <div className="pipeline-node hover-lift">
              <div className="node-header">
                <Shield size={20} className="node-icon" />
                <h3 className="node-title">Mitigation Enforcement</h3>
              </div>
              <p className="node-copy">
                Identified adversaries trigger real-time threat intelligence correlation against VirusTotal and AbuseIPDB feeds, dispatching iptables drop rules in under two milliseconds.
              </p>
              <div className="node-meta">
                <span className="meta-item">Dynamic Null-Routing</span>
                <span className="meta-item">Real-Time WebSocket Feed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Benchmarks */}
        <section id="benchmarks" className="editorial-section benchmark-section">
          <div className="benchmarks-container">
            <div className="benchmark-entry">
              <span className="benchmark-stat">99.4%</span>
              <span className="benchmark-name">Classification Accuracy</span>
              <span className="benchmark-note">Validated on standard CICIDS2017 multi-vector attack datasets</span>
            </div>

            <div className="benchmark-entry">
              <span className="benchmark-stat">1.18 ms</span>
              <span className="benchmark-name">Vector Generation Latency</span>
              <span className="benchmark-note">Mean execution time per 41-feature flow transformation</span>
            </div>

            <div className="benchmark-entry">
              <span className="benchmark-stat">41</span>
              <span className="benchmark-name">Extracted Dimensions</span>
              <span className="benchmark-note">Capturing header symmetry, session duration, and payload entropy</span>
            </div>

            <div className="benchmark-entry">
              <span className="benchmark-stat">Zero Loss</span>
              <span className="benchmark-name">Capture Reliability</span>
              <span className="benchmark-note">Zero-copy socket architecture under high-throughput saturation</span>
            </div>
          </div>
        </section>

        {/* Enterprise Security Capabilities */}
        <section id="capabilities" className="editorial-section">
          <div className="section-head">
            <span className="section-category">Enterprise Operations</span>
            <h2 className="section-title">Built for the demands of modern defensive engineering</h2>
            <p className="section-summary">
              Engineered with multi-tenant architecture, comprehensive role governance, and compliance-grade auditability.
            </p>
          </div>

          <div className="capabilities-editorial-grid">
            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Activity size={18} className="cap-icon" />
                <h4>Live Packet Stream Inspection</h4>
              </div>
              <p>Continuous line-speed analysis across network interfaces with instant WebSocket event dispatching to connected operator consoles.</p>
            </div>

            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Lock size={18} className="cap-icon" />
                <h4>Role-Based Access Governance</h4>
              </div>
              <p>Granular organization boundaries ensuring strict isolation between SOC analysts, administrators, and external security auditors.</p>
            </div>

            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Server size={18} className="cap-icon" />
                <h4>Reputation Threat Feeds</h4>
              </div>
              <p>Direct integration with VirusTotal and AbuseIPDB API connectors for automated reputation verification and ASN risk profiling.</p>
            </div>

            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Shield size={18} className="cap-icon" />
                <h4>Dynamic Boundary Blacklist</h4>
              </div>
              <p>Automated firewall rule injection and expiration tracking to neutralize malicious IP origins without operator intervention.</p>
            </div>

            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Terminal size={18} className="cap-icon" />
                <h4>Immutable Audit Trails</h4>
              </div>
              <p>Cryptographically sequenced event journals capturing administrator actions, policy alterations, and mitigation events for post-incident review.</p>
            </div>

            <div className="capability-card hover-lift">
              <div className="cap-header">
                <Layers size={18} className="cap-icon" />
                <h4>Compliance & SIEM Ingestion</h4>
              </div>
              <p>Structured JSON event streams and standardized PDF summaries formatted for seamless handoff to enterprise SIEM platforms.</p>
            </div>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="cta-editorial">
          <div className="cta-inner">
            <h2 className="cta-heading">Deploy continuous threat monitoring across your perimeter</h2>
            <p className="cta-sub">
              Access real-time telemetry, automate adversary mitigation, and harden your organization against evolving intrusion vectors.
            </p>
            <div className="cta-actions">
              <button onClick={handleLaunchDashboard} className="btn-primary-large">
                <span>Launch Security Operations Center</span>
                <ArrowRight size={16} />
              </button>
              <Link to="/signup" className="btn-secondary-large">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Deliberate Editorial Footer */}
      <footer className="editorial-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-title">SecureNet IDS</div>
            <p className="footer-tagline">
              Enterprise network defense and machine learning intrusion detection platform
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <span className="footer-col-title">Platform</span>
              <a href="#telemetry">Live Console</a>
              <a href="#architecture">Architecture</a>
              <a href="#capabilities">Capabilities</a>
              <a href="#benchmarks">Benchmarks</a>
            </div>

            <div className="footer-col">
              <span className="footer-col-title">Console</span>
              <Link to="/login">SOC Dashboard</Link>
              <Link to="/alerts">Threat Alerts</Link>
              <Link to="/network-monitor">Network Monitor</Link>
              <Link to="/signup">Register</Link>
            </div>

            <div className="footer-col">
              <span className="footer-col-title">System Status</span>
              <div className="system-health-pill">
                <span className="status-indicator"></span>
                <span>All Inspection Nodes Healthy</span>
              </div>
              <span className="system-version mono-data">Kernel Driver v2.4.1</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>SecureNet IDS • Enterprise Network Defense Systems</span>
          <span className="footer-rights">All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default CyberLanding;
