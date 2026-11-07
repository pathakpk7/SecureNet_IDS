import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Cpu, Lock, ArrowRight, Server, Database } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import '../styles/pages/landing.css';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="editorial-landing-clean">
        {/* Hero Section */}
        <section className="clean-hero-block">
          <div className="clean-hero-grid">
            <div className="clean-hero-copy anim-reveal">
              <div className="status-ping">
                <span className="ping-dot"></span>
                <span className="ping-label">Continuous Wire Inspection Active</span>
              </div>
              <h1 className="clean-hero-title">
                Machine learning intrusion detection for enterprise networks
              </h1>
              <p className="clean-hero-lead">
                Continuous packet analysis, real-time anomaly classification, and automated perimeter threat neutralization at line speed.
              </p>
              <div className="clean-hero-cta-group">
                <button onClick={handleGetStarted} className="btn-solid">
                  <span>Open Operations Console</span>
                  <ArrowRight size={15} />
                </button>
                <Link to="/login" className="btn-hollow">
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
            
            <div className="clean-hero-aside anim-fade-up anim-stagger-2">
              <div className="telemetry-compact-panel">
                <div className="compact-panel-head">
                  <span className="compact-title">Live Wire Stream</span>
                  <span className="compact-interface mono-data">AF_PACKET eth0</span>
                </div>
                <div className="compact-stats-row">
                  <div className="compact-stat">
                    <span className="compact-val mono-data">2,847</span>
                    <span className="compact-lbl">Neutralized Incursions</span>
                  </div>
                  <div className="compact-stat">
                    <span className="compact-val mono-data">99.98%</span>
                    <span className="compact-lbl">Inspection Availability</span>
                  </div>
                </div>
                <div className="compact-footer mono-data">
                  Direct Ingestion · 41 Dimensions Vectorized
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="clean-features-block">
          <div className="clean-features-inner">
            <div className="features-intro">
              <h2 className="clean-features-title">High-throughput threat intelligence and automated mitigation</h2>
              <p className="clean-features-sub">
                Designed to operate at hardware line speeds with sub-millisecond inference and zero synthetic overhead.
              </p>
            </div>

            <div className="features-cards-grid">
              <div className="feature-box hover-lift">
                <Activity size={20} className="feature-ico" />
                <h3>Real-Time Packet Stream</h3>
                <p>Zero-copy frame extraction capturing IPv4, IPv6, TCP, and UDP sessions continuously without packet drops under saturation.</p>
              </div>

              <div className="feature-box hover-lift">
                <Cpu size={20} className="feature-ico" />
                <h3>RandomForest Classification</h3>
                <p>Multi-class supervised inference separating benign flows from volumetric DoS floods, stealth probes, and brute-force vectors.</p>
              </div>

              <div className="feature-box hover-lift">
                <Shield size={20} className="feature-ico" />
                <h3>Dynamic Boundary Null-Routing</h3>
                <p>Automated boundary firewall rule insertion and eBPF filters cross-referenced against global reputation intelligence feeds.</p>
              </div>

              <div className="feature-box hover-lift">
                <Lock size={20} className="feature-ico" />
                <h3>Granular RBAC Governance</h3>
                <p>Isolated tenant spaces with cryptographically verifiable audit trails for SOC teams, administrators, and compliance auditors.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="clean-cta-block">
          <div className="clean-cta-inner">
            <h2>Deploy defense intelligence across your organization</h2>
            <p>
              Get instant visibility into traffic anomalies and safeguard critical network infrastructure.
            </p>
            <button onClick={handleGetStarted} className="btn-solid">
              <span>Start SOC Session</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Landing;
