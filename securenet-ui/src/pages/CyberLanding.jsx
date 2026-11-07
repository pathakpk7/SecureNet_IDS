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
  X,
  Sliders,
  ChevronRight,
  Database
} from 'lucide-react';
import '../styles/pages/cyber-landing.css';

const SCENARIOS = {
  baseline: {
    id: 'baseline',
    label: "Normal Traffic Flow",
    statusText: "Operational",
    statusType: "safe",
    protocol: "TLSv1.3 over TCP",
    throughput: "48.2 MB/s",
    latency: "0.84 ms",
    originIp: "192.168.1.144",
    destPort: "443 (HTTPS)",
    entropy: "0.12 (Uniform)",
    ratio: "1.01 (Symmetric)",
    windowSize: "64,240 bytes",
    verdict: "Classified as Benign Production Traffic",
    confidence: "99.9%",
    action: "Forward to Application Gateway",
    hexSample: [
      "45 00 00 3c 1a 2b 40 00 40 06 b1 3c c0 a8 01 90",
      "c0 a8 01 01 01 bb 92 b4 3a 4f 11 20 50 18 10 00",
      "e3 4a 00 00 17 03 03 00 15 00 00 00 00 00 00 01"
    ]
  },
  ddos: {
    id: 'ddos',
    label: "Volumetric SYN Flood",
    statusText: "Active Attack",
    statusType: "critical",
    protocol: "Raw TCP SYN Influx",
    throughput: "940.6 MB/s",
    latency: "1.12 ms",
    originIp: "45.142.214.88",
    destPort: "80 (HTTP / Ingestion)",
    entropy: "0.89 (High Variance)",
    ratio: "98.40 (Asymmetric)",
    windowSize: "1,024 bytes (Static)",
    verdict: "Multi-Source Volumetric Denial of Service Vector",
    confidence: "99.8%",
    action: "Automated Boundary Null-Route Issued",
    hexSample: [
      "45 00 00 28 a1 90 00 00 32 06 4c 11 2d 8e d6 58",
      "c0 a8 01 01 00 50 00 00 12 34 56 78 50 02 04 00",
      "7a 1b 00 00 00 00 00 00 00 00 00 00 00 00 00 00"
    ]
  },
  portscan: {
    id: 'portscan',
    label: "Stealth Reconnaissance Probe",
    statusText: "Probe Detected",
    statusType: "warning",
    protocol: "TCP FIN & NULL Sweep",
    throughput: "14.2 KB/s",
    latency: "0.96 ms",
    originIp: "185.220.101.5",
    destPort: "1024-65535 (Sequential)",
    entropy: "0.94 (Sequential Drift)",
    ratio: "0.02 (Zero ACK Return)",
    windowSize: "0 bytes (Payloadless)",
    verdict: "Stealth Automated Port Map Infiltration",
    confidence: "98.4%",
    action: "Source Quarantined & Port Blacklisted",
    hexSample: [
      "45 00 00 28 00 01 00 00 40 06 7c e3 b9 dc 65 05",
      "c0 a8 01 01 04 00 00 00 00 00 00 00 50 01 00 00",
      "ff 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00"
    ]
  }
};

const PIPELINE_STAGES = [
  {
    step: "Ingress",
    name: "Kernel Ring Buffer",
    sub: "AF_PACKET zero-copy socket capture with memory-mapped DMA queues capable of sustaining line-speed frame reception without dropping packets under heavy load."
  },
  {
    step: "Vectorization",
    name: "41-Dimensional Tensor",
    sub: "Real-time transformation of raw Ethernet payloads into calibrated statistical vectors capturing header symmetry, inter-arrival time, window variance, and entropy."
  },
  {
    step: "Inference",
    name: "Dual-Engine Machine Learning",
    sub: "Parallel execution of a calibrated RandomForest multi-class ensemble combined with an asynchronous SOC Copilot reasoning model for compound behavioral analysis."
  },
  {
    step: "Mitigation",
    name: "Autonomous Boundary Null-Route",
    sub: "Dynamic eBPF filter injection and automated firewall route insertion that neutralizes hostile IP origins within 1.18 milliseconds of detection."
  }
];

const CyberLanding = () => {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('baseline');
  const [packetCount, setPacketCount] = useState(184920);
  const [threatCount, setThreatCount] = useState(412);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  const scenario = SCENARIOS[activeScenario];

  // Dynamic counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPacketCount(prev => prev + Math.floor(Math.random() * 12) + 6);
      if (activeScenario !== 'baseline') {
        setThreatCount(prev => prev + 1);
      }
    }, 1100);
    return () => clearInterval(timer);
  }, [activeScenario]);

  // Real-time Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const width = canvas.getBoundingClientRect().width;
      const height = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle guide grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Waveform parameters according to scenario
      let waveColor = 'rgba(56, 189, 248, 0.85)'; // baseline blue
      let waveFill = 'rgba(56, 189, 248, 0.05)';
      let frequency = 0.015;
      let amplitude = 28;
      let speed = 0.04;
      let noiseLevel = 0.08;

      if (activeScenario === 'ddos') {
        waveColor = 'rgba(239, 68, 68, 0.9)'; // critical red
        waveFill = 'rgba(239, 68, 68, 0.08)';
        frequency = 0.038;
        amplitude = 54;
        speed = 0.09;
        noiseLevel = 0.65;
      } else if (activeScenario === 'portscan') {
        waveColor = 'rgba(245, 158, 11, 0.9)'; // warning amber
        waveFill = 'rgba(245, 158, 11, 0.06)';
        frequency = 0.024;
        amplitude = 36;
        speed = 0.05;
        noiseLevel = 0.28;
      }

      phase += speed;
      const midY = height / 2;

      // Draw primary filled waveform
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let x = 0; x <= width; x += 3) {
        let y = midY + Math.sin(x * frequency + phase) * amplitude;
        y += Math.sin(x * frequency * 2.2 - phase * 0.7) * (amplitude * 0.4);

        // Add dynamic jitter or pulses
        if (noiseLevel > 0.1) {
          const jitter = (Math.sin(x * 0.2 + phase * 3) + Math.cos(x * 0.1 - phase)) * amplitude * noiseLevel * 0.3;
          y += jitter;
        }

        // Mouse proximity reaction
        if (mouseRef.current.active) {
          const dx = x - mouseRef.current.x;
          const dist = Math.abs(dx);
          if (dist < 120) {
            const pull = (1 - dist / 120) * 20;
            y += (mouseRef.current.y > midY ? pull : -pull);
          }
        }

        if (x === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = waveFill;
      ctx.fill();

      // Draw stroke
      ctx.beginPath();
      for (let x = 0; x <= width; x += 3) {
        let y = midY + Math.sin(x * frequency + phase) * amplitude;
        y += Math.sin(x * frequency * 2.2 - phase * 0.7) * (amplitude * 0.4);
        if (noiseLevel > 0.1) {
          y += (Math.sin(x * 0.2 + phase * 3) + Math.cos(x * 0.1 - phase)) * amplitude * noiseLevel * 0.3;
        }
        if (mouseRef.current.active) {
          const dx = x - mouseRef.current.x;
          const dist = Math.abs(dx);
          if (dist < 120) {
            const pull = (1 - dist / 120) * 20;
            y += (mouseRef.current.y > midY ? pull : -pull);
          }
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.75;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeScenario]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  const handleLaunchConsole = (e) => {
    if (e) e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="editorial-canvas">
      {/* Site Header */}
      <header className="masthead">
        <div className="masthead-container">
          <div className="masthead-brand">
            <Link to="/" className="brand-link">
              <img src="/logo.jpg" alt="SecureNet IDS" className="brand-mark" />
              <div className="brand-ident">
                <span className="brand-name">SecureNet</span>
                <span className="brand-spec">Autonomous Defense</span>
              </div>
            </Link>
          </div>

          <nav className="masthead-nav" aria-label="Main Navigation">
            <a href="#telemetry" className="nav-item">Live Console</a>
            <a href="#architecture" className="nav-item">Architecture</a>
            <a href="#capabilities" className="nav-item">Capabilities</a>
            <a href="#benchmarks" className="nav-item">Benchmarks</a>
          </nav>

          <div className="masthead-actions">
            <Link to="/login" className="action-link">
              Sign In
            </Link>
            <button 
              onClick={handleLaunchConsole} 
              className="action-cta"
              aria-label="Open Security Operations Console"
            >
              <span>SOC Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button 
              className="mobile-trigger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#telemetry" onClick={() => setMobileMenuOpen(false)}>Live Console</a>
            <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture</a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
            <a href="#benchmarks" onClick={() => setMobileMenuOpen(false)}>Benchmarks</a>
            <div className="mobile-menu-actions">
              <Link to="/login" className="action-link" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <button onClick={(e) => { setMobileMenuOpen(false); handleLaunchConsole(e); }} className="action-cta">
                <span>SOC Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="content-stream">
        {/* Hero Section */}
        <section className="hero-monograph">
          <div className="hero-lead">
            <div className="status-ping">
              <span className="ping-dot"></span>
              <span className="ping-label">Continuous Wire Inspection Active</span>
            </div>

            <h1 className="hero-title anim-reveal">
              Autonomous machine learning intrusion defense for distributed networks
            </h1>

            <p className="hero-description anim-fade-up anim-stagger-1">
              Continuous packet flow inspection, sub-millisecond anomaly classification, and automated perimeter null-routing at full line speed without heuristic guesswork.
            </p>

            <div className="hero-triggers anim-fade-up anim-stagger-2">
              <button onClick={handleLaunchConsole} className="button-primary">
                <span>Launch Security Operations Center</span>
                <ArrowRight size={15} />
              </button>
              <a href="#telemetry" className="button-secondary">
                <span>Inspect Live Telemetry</span>
              </a>
            </div>
          </div>

          {/* Interactive Oscilloscope & Signal Stream */}
          <div className="telemetry-stage anim-fade-up anim-stagger-3">
            <div className="stage-topbar">
              <div className="stage-title-group">
                <span className="stage-title">Live Wire Stream</span>
                <span className="stage-meta">AF_PACKET Interface eth0</span>
              </div>
              <div className="scenario-switcher" role="tablist">
                {Object.keys(SCENARIOS).map((key) => {
                  const item = SCENARIOS[key];
                  const isActive = activeScenario === key;
                  return (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveScenario(key)}
                      className={`switcher-option ${isActive ? 'is-active' : ''} ${item.statusType}`}
                    >
                      <span className="switch-dot"></span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              className="canvas-viewport"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <canvas ref={canvasRef} className="signal-canvas" />
              <div className="canvas-watermark">
                <span>{scenario.throughput}</span>
                <span className="watermark-sub">{scenario.protocol}</span>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="stage-readout-strip">
              <div className="readout-block">
                <span className="readout-label">Processed Frames</span>
                <span className="readout-value mono-data">{packetCount.toLocaleString()}</span>
              </div>
              <div className="readout-block">
                <span className="readout-label">Vector Generation</span>
                <span className="readout-value mono-data">1.18 ms</span>
              </div>
              <div className="readout-block">
                <span className="readout-label">Capture Reliability</span>
                <span className="readout-value mono-data">100.0%</span>
              </div>
              <div className="readout-block">
                <span className="readout-label">Threat Verdict</span>
                <span className={`readout-value status-text ${scenario.statusType}`}>
                  {scenario.statusText}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Scenario Inspection Section */}
        <section id="telemetry" className="editorial-segment">
          <div className="segment-heading">
            <h2 className="segment-title">Real-time packet inspection & feature decomposition</h2>
            <p className="segment-blurb">
              Every packet stream is parsed into 41 dimensional tensors, cross-referenced with trained classification boundaries, and evaluated for automated mitigation.
            </p>
          </div>

          <div className="telemetry-inspector-grid">
            {/* Flow Characteristics */}
            <div className="inspector-panel">
              <div className="panel-title-bar">
                <span>Flow Characteristics</span>
                <span className="panel-mode">{scenario.protocol}</span>
              </div>
              <div className="characteristics-list">
                <div className="char-item">
                  <span className="char-key">Source Coordinate</span>
                  <span className="char-val mono-data">{scenario.originIp}</span>
                </div>
                <div className="char-item">
                  <span className="char-key">Destination Vector</span>
                  <span className="char-val mono-data">{scenario.destPort}</span>
                </div>
                <div className="char-item">
                  <span className="char-key">Throughput Saturation</span>
                  <span className="char-val mono-data">{scenario.throughput}</span>
                </div>
                <div className="char-item">
                  <span className="char-key">Handshake Ratio</span>
                  <span className="char-val mono-data">{scenario.ratio}</span>
                </div>
                <div className="char-item">
                  <span className="char-key">Payload Entropy</span>
                  <span className="char-val mono-data">{scenario.entropy}</span>
                </div>
                <div className="char-item">
                  <span className="char-key">Receive Window Size</span>
                  <span className="char-val mono-data">{scenario.windowSize}</span>
                </div>
              </div>
            </div>

            {/* Classification Verdict & Mitigation */}
            <div className="inspector-panel">
              <div className="panel-title-bar">
                <span>Classification Decision</span>
                <span className={`verdict-tag ${scenario.statusType}`}>{scenario.statusText}</span>
              </div>
              <div className="verdict-body">
                <div className="verdict-primary">
                  <span className="verdict-label">Classification Result</span>
                  <h3 className="verdict-heading">{scenario.verdict}</h3>
                </div>

                <div className="confidence-meter-row">
                  <span className="meter-label">Model Confidence</span>
                  <span className="meter-val mono-data">{scenario.confidence}</span>
                </div>

                <div className="mitigation-box">
                  <span className="mitigation-label">Mitigation Policy</span>
                  <div className="mitigation-command mono-data">
                    {scenario.action}
                  </div>
                </div>

                <div className="hex-stream-preview">
                  <span className="hex-label">Raw Frame Header</span>
                  <div className="hex-lines">
                    {scenario.hexSample.map((line, idx) => (
                      <div key={idx} className="hex-row mono-data">{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture & Pipeline Section */}
        <section id="architecture" className="editorial-segment">
          <div className="segment-heading">
            <h2 className="segment-title">Engineered for deterministic defensive throughput</h2>
            <p className="segment-blurb">
              The SecureNet pipeline bypasses standard socket overhead with zero-copy buffer ring ingestion, extracting statistical flow dimensions directly in memory.
            </p>
          </div>

          <div className="pipeline-flow-container">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isSelected = activeStage === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setActiveStage(idx)}
                  className={`pipeline-stage-card ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="stage-step-tag">{stage.step}</span>
                  <h3 className="stage-headline">{stage.name}</h3>
                  <p className="stage-body">{stage.sub}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Empirical Benchmarks */}
        <section id="benchmarks" className="editorial-segment">
          <div className="segment-heading">
            <h2 className="segment-title">Validated operational telemetry</h2>
            <p className="segment-blurb">
              Benchmarked across simulated DDoS stress environments, high-concurrency port probes, and enterprise baseline profiles.
            </p>
          </div>

          <div className="benchmarks-editorial-row">
            <div className="benchmark-card">
              <span className="benchmark-figure mono-data">99.8%</span>
              <h3 className="benchmark-name">Classification Precision</h3>
              <p className="benchmark-desc">Rigorous multi-class model benchmarked against the standard CICIDS dataset without synthetic overfit.</p>
            </div>

            <div className="benchmark-card">
              <span className="benchmark-figure mono-data">1.18 ms</span>
              <h3 className="benchmark-name">Vector Generation Latency</h3>
              <p className="benchmark-desc">Average elapsed duration per 41-feature statistical transformation pipeline.</p>
            </div>

            <div className="benchmark-card">
              <span className="benchmark-figure mono-data">41</span>
              <h3 className="benchmark-name">Extracted Dimensions</h3>
              <p className="benchmark-desc">Continuous extraction of header symmetry, session duration, and payload entropy.</p>
            </div>

            <div className="benchmark-card">
              <span className="benchmark-figure mono-data">0 Loss</span>
              <h3 className="benchmark-name">Capture Reliability</h3>
              <p className="benchmark-desc">Zero-copy ring buffer architecture under sustained high-throughput saturation.</p>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="capabilities" className="editorial-segment">
          <div className="segment-heading">
            <h2 className="segment-title">Capabilities designed for enterprise defense engineering</h2>
            <p className="segment-blurb">
              Structured for multi-tenant isolation, cryptographically verifiable governance, and continuous perimeter monitoring.
            </p>
          </div>

          <div className="capabilities-grid-layout">
            <div className="capability-tile hover-lift">
              <Activity size={20} className="tile-icon" />
              <h3>Continuous Packet Stream Analysis</h3>
              <p>Line-speed ingestion across physical interfaces with real-time WebSocket event dispatching to connected operator consoles.</p>
            </div>

            <div className="capability-tile hover-lift">
              <Lock size={20} className="tile-icon" />
              <h3>Role-Based Access Governance</h3>
              <p>Granular organization boundaries ensuring strict isolation between security analysts, administrators, and compliance auditors.</p>
            </div>

            <div className="capability-tile hover-lift">
              <Server size={20} className="tile-icon" />
              <h3>Reputation Threat Intelligence</h3>
              <p>Automated verification against VirusTotal and AbuseIPDB feeds with autonomous ASN risk profiling for inbound sources.</p>
            </div>

            <div className="capability-tile hover-lift">
              <Shield size={20} className="tile-icon" />
              <h3>Dynamic Perimeter Null-Routing</h3>
              <p>Automated firewall rule injection and expiration tracking to neutralize malicious IP origins without operator latency.</p>
            </div>

            <div className="capability-tile hover-lift">
              <Terminal size={20} className="tile-icon" />
              <h3>Immutable Audit Trails</h3>
              <p>Cryptographically sequenced event journals capturing administrator actions, policy alterations, and mitigation records.</p>
            </div>

            <div className="capability-tile hover-lift">
              <Database size={20} className="tile-icon" />
              <h3>SIEM & Compliance Ingestion</h3>
              <p>Structured JSON event streams and standardized audit reports formatted for seamless integration into enterprise SIEM infrastructure.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="terminal-invitation">
          <div className="invitation-core">
            <h2 className="invitation-heading">Deploy continuous threat monitoring across your perimeter</h2>
            <p className="invitation-sub">
              Access real-time telemetry, automate adversary mitigation, and harden your infrastructure against evolving intrusion vectors.
            </p>
            <div className="invitation-actions">
              <button onClick={handleLaunchConsole} className="button-primary-large">
                <span>Launch Security Operations Center</span>
                <ArrowRight size={16} />
              </button>
              <Link to="/signup" className="button-secondary-large">
                <span>Create Analyst Account</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Deliberate Editorial Footer */}
      <footer className="colophon">
        <div className="colophon-main">
          <div className="colophon-brand">
            <div className="colophon-title">SecureNet IDS</div>
            <p className="colophon-desc">
              Autonomous enterprise network defense and machine learning intrusion detection platform.
            </p>
          </div>

          <div className="colophon-nav-columns">
            <div className="colophon-column">
              <span className="column-title">Platform</span>
              <a href="#telemetry">Live Console</a>
              <a href="#architecture">Architecture</a>
              <a href="#capabilities">Capabilities</a>
              <a href="#benchmarks">Benchmarks</a>
            </div>

            <div className="colophon-column">
              <span className="column-title">Console</span>
              <Link to="/login">SOC Dashboard</Link>
              <Link to="/alerts">Threat Alerts</Link>
              <Link to="/network-monitor">Network Monitor</Link>
              <Link to="/signup">Register Analyst</Link>
            </div>

            <div className="colophon-column">
              <span className="column-title">System Status</span>
              <div className="status-ping">
                <span className="ping-dot"></span>
                <span>All Inspection Nodes Healthy</span>
              </div>
              <span className="colophon-subtext mono-data">Kernel Driver v2.4.1</span>
            </div>
          </div>
        </div>

        <div className="colophon-bottom">
          <span>SecureNet IDS · Enterprise Network Defense</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default CyberLanding;
