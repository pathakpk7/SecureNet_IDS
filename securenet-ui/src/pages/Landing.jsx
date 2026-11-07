import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Cpu, Lock, ArrowRight } from 'lucide-react';
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
      <div className="landing-clean">
        {/* Hero Section */}
        <section className="clean-hero-section">
          <div className="clean-hero-container">
            <div className="clean-hero-left anim-reveal">
              <h1 className="clean-hero-title">
                Machine learning intrusion detection for enterprise networks
              </h1>
              <p className="clean-hero-subtitle">
                Continuous packet analysis, real-time anomaly classification, and automated perimeter threat neutralization.
              </p>
              <div className="clean-hero-buttons">
                <button onClick={handleGetStarted} className="btn-clean-primary">
                  <span>Open Console</span>
                  <ArrowRight size={15} />
                </button>
                <Link to="/login" className="btn-clean-ghost">
                  Review Documentation
                </Link>
              </div>
            </div>
            
            <div className="clean-hero-right anim-fade-up anim-stagger-2">
              <div className="clean-preview-panel">
                <div className="preview-panel-header">
                  <div className="status-indicator"></div>
                  <span className="preview-panel-title">Live Wire Stream</span>
                </div>
                <div className="preview-panel-content">
                  <div className="preview-metrics-row">
                    <div className="preview-stat">
                      <span className="preview-value mono-data">2,847</span>
                      <span className="preview-label">Neutralized Incursions</span>
                    </div>
                    <div className="preview-stat">
                      <span className="preview-value mono-data">99.9%</span>
                      <span className="preview-label">Inspection Availability</span>
                    </div>
                  </div>
                  <div className="preview-stream-summary">
                    <span className="mono-data caption">Socket Ingestion: AF_PACKET Zero-Copy Ring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="clean-features-section">
          <div className="clean-features-container">
            <div className="features-editorial-header">
              <span className="section-category">Core Capabilities</span>
              <h2 className="clean-section-title">High-throughput threat intelligence and automated mitigation</h2>
            </div>
            <div className="clean-features-grid">
              <div className="clean-feature-item hover-lift">
                <Activity size={22} className="feature-symbol" />
                <h3>Real-Time Packet Stream</h3>
                <p>Zero-copy frame extraction capturing IPv4, IPv6, TCP, and UDP sessions continuously without packet drops.</p>
              </div>
              <div className="clean-feature-item hover-lift">
                <Cpu size={22} className="feature-symbol" />
                <h3>RandomForest Classification</h3>
                <p>Pre-trained multi-class inference separating benign workflows from DoS floods, port probes, and brute-force events.</p>
              </div>
              <div className="clean-feature-item hover-lift">
                <Shield size={22} className="feature-symbol" />
                <h3>Dynamic Null-Routing</h3>
                <p>Automated boundary firewall rule insertion cross-referenced against global reputation intelligence feeds.</p>
              </div>
              <div className="clean-feature-item hover-lift">
                <Lock size={22} className="feature-symbol" />
                <h3>Granular RBAC Governance</h3>
                <p>Isolated tenant spaces with cryptographically verifiable audit trails for SOC teams and compliance engineers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="clean-cta-section">
          <div className="clean-cta-container">
            <div className="clean-cta-content">
              <h2>Deploy defense intelligence across your organization</h2>
              <p>
                Get real-time visibility into traffic anomalies and safeguard critical infrastructure.
              </p>
              <button onClick={handleGetStarted} className="btn-clean-primary">
                <span>Start SOC Session</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Landing;
