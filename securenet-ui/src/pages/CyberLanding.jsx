import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/cyber-landing.css';

const CyberLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDashboard = (e) => {
    if (e) e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="cl-page">
      {/* Top Header / Navigation */}
      <nav className="cl-nav">
        <div className="cl-brand">
          <Link to="/dashboard" onClick={handleLaunchDashboard} style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.jpg" alt="SecureNet IDS Logo" className="cl-logo-img" />
          </Link>
        </div>

        <div className="cl-nav-actions">
          <Link to="/login" className="cl-btn-text">
            Sign In
          </Link>
          <button onClick={handleLaunchDashboard} className="cl-btn-primary" style={{ cursor: 'pointer', border: 'none' }}>
            Launch Dashboard →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="cl-section cl-hero">
        <div className="cl-pill">
          <div className="cl-dot"></div>
          ENTERPRISE NETWORK DEFENSE
        </div>

        <h1 className="cl-hero-title">
          Intelligent Intrusion Detection & Automated Threat Mitigation
        </h1>

        <p className="cl-hero-sub">
          Continuous packet stream inspection, machine learning anomaly classification, and dynamic IP enforcement engineered for high-throughput Security Operations Centers.
        </p>

        <div className="cl-hero-cta">
          <button onClick={handleLaunchDashboard} className="cl-btn-primary" style={{ cursor: 'pointer', border: 'none' }}>
            Open SOC Dashboard
          </button>
          <Link to="/signup" className="cl-btn-secondary">
            Register Organization Account
          </Link>
        </div>
      </section>

      {/* Key System Metrics */}
      <section id="metrics" className="cl-section">
        <div className="cl-grid-4-metrics">
          <div className="cl-metric-card">
            <span className="cl-metric-value">99.4%</span>
            <span className="cl-metric-label">Detection Accuracy</span>
          </div>
          <div className="cl-metric-card">
            <span className="cl-metric-value">&lt; 1.2 ms</span>
            <span className="cl-metric-label">Feature Vector Latency</span>
          </div>
          <div className="cl-metric-card">
            <span className="cl-metric-value">41</span>
            <span className="cl-metric-label">Extracted Packet Features</span>
          </div>
          <div className="cl-metric-card">
            <span className="cl-metric-value">Real-Time</span>
            <span className="cl-metric-label">WebSocket Telemetry</span>
          </div>
        </div>
      </section>

      {/* Core Processing Pipeline Section */}
      <section id="pipeline" className="cl-section">
        <div className="cl-section-header">
          <h2>Core Processing Pipeline</h2>
          <p>End-to-end technical workflow from wire-level packet capture to automated mitigation.</p>
        </div>

        <div className="cl-story-timeline">
          {/* Step 01 */}
          <div className="cl-story-card">
            <div className="cl-act-badge">STEP 01</div>
            <div className="cl-story-info">
              <h3>Packet Capture & Wire Filtering</h3>
              <p>
                PyShark and Scapy socket engines capture incoming IPv4, IPv6, TCP, and UDP frames continuously with zero-copy buffer architecture.
              </p>
            </div>
            <div className="cl-story-spec">
              <div className="cl-spec-row">
                <span className="cl-spec-label">Engine</span>
                <span className="cl-spec-val">PyShark / Scapy</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Buffer Strategy</span>
                <span className="cl-spec-val">Zero-Copy Socket Ring</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Protocols</span>
                <span className="cl-spec-val">TCP / UDP / ICMP / IPv4</span>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="cl-story-card">
            <div className="cl-act-badge">STEP 02</div>
            <div className="cl-story-info">
              <h3>Feature Vector Normalization</h3>
              <p>
                Calculates flow metrics including SYN/ACK ratios, payload entropy, port frequencies, and window sizes into standardized numerical vectors.
              </p>
            </div>
            <div className="cl-story-spec">
              <div className="cl-spec-row">
                <span className="cl-spec-label">Dimensions</span>
                <span className="cl-spec-val">41 Feature Fields</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Transformer</span>
                <span className="cl-spec-val">StandardScaler Pipeline</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Latency</span>
                <span className="cl-spec-val">Sub-Millisecond</span>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="cl-story-card">
            <div className="cl-act-badge">STEP 03</div>
            <div className="cl-story-info">
              <h3>RandomForest Anomaly Classification</h3>
              <p>
                Evaluates incoming vector arrays using trained RandomForest models to categorize traffic into Normal behavior or malicious attack classes.
              </p>
            </div>
            <div className="cl-story-spec">
              <div className="cl-spec-row">
                <span className="cl-spec-label">Model Type</span>
                <span className="cl-spec-val">RandomForest Classifier</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Benchmark Data</span>
                <span className="cl-spec-val">NSL-KDD / CICIDS Dataset</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Classification</span>
                <span className="cl-spec-val">DoS / Probe / R2L / U2R</span>
              </div>
            </div>
          </div>

          {/* Step 04 */}
          <div className="cl-story-card">
            <div className="cl-act-badge">STEP 04</div>
            <div className="cl-story-info">
              <h3>Threat Intelligence & Dynamic Blocking</h3>
              <p>
                Malicious source IPs are cross-checked via VirusTotal and AbuseIPDB API integrations, broadcast to the dashboard, and added to the IP blacklist.
              </p>
            </div>
            <div className="cl-story-spec">
              <div className="cl-spec-row">
                <span className="cl-spec-label">Intel Providers</span>
                <span className="cl-spec-val">VirusTotal / AbuseIPDB</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Alert Streaming</span>
                <span className="cl-spec-val">FastAPI WebSocket</span>
              </div>
              <div className="cl-spec-row">
                <span className="cl-spec-label">Enforcement</span>
                <span className="cl-spec-val">Dynamic IP Blacklist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities Section */}
      <section id="capabilities" className="cl-section">
        <div className="cl-section-header">
          <h2>Enterprise Security Capabilities</h2>
          <p>Designed for SOC engineers requiring real-time visibility, automated policy enforcement, and audit-ready reporting.</p>
        </div>

        <div className="cl-grid-3">
          <div className="cl-feature-box">
            <h4>Live Packet Stream Inspection</h4>
            <p>Continuously monitor live network interface traffic with real-time socket updates and flow rate tracking.</p>
          </div>

          <div className="cl-feature-box">
            <h4>Multi-Tenant RBAC Security</h4>
            <p>Strictly isolate organization telemetry, user roles, and administrative permissions across multi-tenant environments.</p>
          </div>

          <div className="cl-feature-box">
            <h4>Reputation Score Validation</h4>
            <p>Query third-party threat feeds including VirusTotal and AbuseIPDB to confirm threat score confidence.</p>
          </div>

          <div className="cl-feature-box">
            <h4>Dynamic IP Blacklist Registry</h4>
            <p>Maintain an active firewall blacklist registry with policy expiration management and instant revocation.</p>
          </div>

          <div className="cl-feature-box">
            <h4>Immutable Audit Tracking</h4>
            <p>Record operator actions, configuration shifts, and automated mitigation events in secure audit logs.</p>
          </div>

          <div className="cl-feature-box">
            <h4>Automated Telemetry Exports</h4>
            <p>Generate formatted PDF compliance summaries, raw CSV packet logs, and JSON feeds for external SIEM engines.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cl-footer">
        SecureNet IDS • Enterprise AI-Powered Intrusion Detection System
      </footer>
    </div>
  );
};

export default CyberLanding;
