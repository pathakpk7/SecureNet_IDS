import React from 'react';
import MainLayout from '../layouts/MainLayout';
import '../styles/pages/landing.css';

const Landing = () => {
  return (
    <MainLayout>
      <div className="landing">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            {/* Left Side */}
            <div className="hero-left fade-in">
              <h1 className="hero-title">
                AI-Powered Intrusion Detection System
              </h1>
              <p className="hero-subtitle">
                Real-time threat detection, AI-driven insights, and network security monitoring.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary glow-hover">Get Started</button>
                <button className="btn btn-outline">Learn More</button>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="hero-right fade-in stagger-1">
              <div className="dashboard-preview glass neon-border">
                <div className="preview-header">
                  <div className="preview-indicator active"></div>
                  <span>Live Monitor</span>
                </div>
                <div className="preview-content">
                  <div className="preview-metrics">
                    <div className="metric">
                      <span className="metric-value">2,847</span>
                      <span className="metric-label">Threats Blocked</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">99.9%</span>
                      <span className="metric-label">Uptime</span>
                    </div>
                  </div>
                  <div className="preview-chart">
                    <div className="chart-bar"></div>
                    <div className="chart-bar"></div>
                    <div className="chart-bar"></div>
                    <div className="chart-bar"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-container">
            <h2 className="section-title fade-in">Advanced Features</h2>
            <div className="features-grid">
              <div className="feature-card glass fade-in stagger-1">
                <div className="feature-icon">🔍</div>
                <h3>Real-Time Monitoring</h3>
                <p>Monitor network traffic and detect threats in real-time with advanced pattern recognition.</p>
              </div>
              <div className="feature-card glass fade-in stagger-2">
                <div className="feature-icon">🤖</div>
                <h3>AI Threat Detection</h3>
                <p>Machine learning algorithms identify sophisticated attack patterns before they cause damage.</p>
              </div>
              <div className="feature-card glass fade-in stagger-3">
                <div className="feature-icon">📊</div>
                <h3>Network Traffic Analysis</h3>
                <p>Comprehensive analysis of all network traffic with detailed reporting and insights.</p>
              </div>
              <div className="feature-card glass fade-in stagger-4">
                <div className="feature-icon">👥</div>
                <h3>Multi-User Admin System</h3>
                <p>Secure role-based access control for teams and organizations of any size.</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="about-container">
            <div className="about-content glass fade-in">
              <h2 className="about-title">About SecureNet IDS</h2>
              <p className="about-text">
                SecureNet IDS is a cutting-edge intrusion detection system that leverages artificial intelligence 
                to provide real-time threat detection and comprehensive network security monitoring. Our platform 
                analyzes millions of network events per second, identifying potential security breaches before they 
                can impact your organization. With scalable architecture designed for enterprises of all sizes, 
                SecureNet IDS delivers enterprise-grade security with actionable insights and automated response capabilities.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-container">
            <div className="cta-content glass fade-in">
              <h2 className="cta-title">Secure Your Network Today</h2>
              <p className="cta-subtitle">
                Join thousands of organizations protecting their digital assets with SecureNet IDS
              </p>
              <button className="btn btn-primary glow-hover cta-button">Start Now</button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Landing;
