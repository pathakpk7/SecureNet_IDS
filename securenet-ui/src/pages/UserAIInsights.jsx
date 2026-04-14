import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/ai.css';

const UserAIInsights = () => {
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [personalSecurityScore, setPersonalSecurityScore] = useState(94);

  const basicInsights = [
    {
      id: 1,
      title: 'Password Security',
      riskLevel: 'low',
      confidence: 85,
      insight: 'Your password strength is good. Consider enabling two-factor authentication for enhanced security.',
      recommendations: [
        'Enable two-factor authentication',
        'Update password every 90 days',
        'Use a password manager',
        'Avoid reusing passwords across sites'
      ],
      priority: 'medium'
    },
    {
      id: 2,
      title: 'Login Activity',
      riskLevel: 'low',
      confidence: 92,
      insight: 'Your login patterns are normal. No suspicious activity detected in your account.',
      recommendations: [
        'Continue monitoring your login activity',
        'Report any unfamiliar login attempts',
        'Keep your contact information updated',
        'Review active sessions regularly'
      ],
      priority: 'low'
    },
    {
      id: 3,
      title: 'Data Sharing',
      riskLevel: 'medium',
      confidence: 78,
      insight: 'You have shared some sensitive information recently. Review your sharing permissions.',
      recommendations: [
        'Review shared documents and folders',
        'Remove unnecessary sharing permissions',
        'Use secure sharing methods',
        'Regularly audit your access logs'
      ],
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Device Security',
      riskLevel: 'low',
      confidence: 88,
      insight: 'Your devices appear to be secure. Keep your software updated for best protection.',
      recommendations: [
        'Keep operating system updated',
        'Install security patches promptly',
        'Use antivirus software',
        'Enable device encryption'
      ],
      priority: 'low'
    }
  ];

  const personalRecommendations = [
    {
      category: 'Account Security',
      items: [
        'Enable two-factor authentication',
        'Use a strong, unique password',
        'Review account recovery options',
        'Set up login alerts'
      ]
    },
    {
      category: 'Privacy Protection',
      items: [
        'Review privacy settings regularly',
        'Limit data sharing to trusted sources',
        'Use encrypted communication',
        'Clear browser cache periodically'
      ]
    },
    {
      category: 'Safe Browsing',
      items: [
        'Avoid clicking suspicious links',
        'Verify website authenticity',
        'Use secure connections (HTTPS)',
        'Install browser security extensions'
      ]
    },
    {
      category: 'Device Protection',
      items: [
        'Install security software',
        'Keep software updated',
        'Use device encryption',
        'Backup important data regularly'
      ]
    }
  ];

  const personalStats = {
    securityScore: personalSecurityScore,
    loginAttempts: 156,
    lastLogin: '2 hours ago',
    activeDevices: 3,
    sharedFiles: 12,
    securityAlerts: 0,
    recommendations: 8
  };

  // Simulate security score updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalSecurityScore(prev => 
        Math.max(85, Math.min(100, prev + (Math.random() - 0.5) * 2))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#ffaa00';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ff00';
      default: return '#666';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00ff00';
    if (confidence >= 60) return '#ffaa00';
    return '#ff3366';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ffaa00';
      case 'medium': return '#00f5ff';
      case 'low': return '#00ff00';
      default: return '#666';
    }
  };

  return (
    <div className="ai-insights-page user-ai-insights fade-in">
      <div className="page-header">
        <h1 className="page-title">My Security Insights</h1>
        <p className="page-subtitle">Personalized security recommendations and basic insights</p>
      </div>

      {/* Personal Security Score */}
      <div className="personal-security-section">
        <Card className="security-score-card">
          <div className="score-header">
            <h3>My Security Score</h3>
            <span className="score-value">{personalSecurityScore.toFixed(0)}</span>
          </div>
          <div className="score-meter">
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ 
                  width: `${personalSecurityScore}%`,
                  backgroundColor: personalSecurityScore >= 90 ? '#00ff00' : 
                                   personalSecurityScore >= 70 ? '#ffaa00' : '#ff3366'
                }}
              ></div>
            </div>
            <span className="score-label">Security Strength</span>
          </div>
        </Card>
      </div>

      {/* Personal Stats */}
      <div className="personal-stats-section">
        <Card className="personal-stats-card">
          <h3>My Activity Overview</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{personalStats.loginAttempts}</span>
              <span className="stat-label">Total Logins</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.lastLogin}</span>
              <span className="stat-label">Last Login</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.activeDevices}</span>
              <span className="stat-label">Active Devices</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.sharedFiles}</span>
              <span className="stat-label">Shared Files</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.securityAlerts}</span>
              <span className="stat-label">Security Alerts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{personalStats.recommendations}</span>
              <span className="stat-label">Recommendations</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Basic Insights */}
      <div className="insights-section">
        <div className="insights-header">
          <h3>My Security Insights</h3>
          <span className="insights-count">{basicInsights.length} insights</span>
        </div>
        <div className="insights-grid">
          {basicInsights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`insight-card ${insight.riskLevel} ${selectedInsight === insight.id ? 'selected' : ''}`}
              onClick={() => setSelectedInsight(insight.id)}
            >
              <div className="insight-header">
                <h4 className="insight-title">{insight.title}</h4>
                <div className="insight-badges">
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(insight.riskLevel) }}
                  >
                    {insight.riskLevel.toUpperCase()}
                  </span>
                  <span 
                    className="confidence-badge"
                    style={{ color: getConfidenceColor(insight.confidence) }}
                  >
                    {insight.confidence}% Confidence
                  </span>
                </div>
              </div>
              <div className="insight-content">
                <p className="insight-text">{insight.insight}</p>
                <div className="priority-indicator">
                  <span className="priority-label">Priority:</span>
                  <span 
                    className="priority-value"
                    style={{ color: getPriorityColor(insight.priority) }}
                  >
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Personal Recommendations */}
      <div className="recommendations-section">
        <Card className="recommendations-card">
          <div className="recommendations-header">
            <h3>Personal Security Recommendations</h3>
            <span className="recommendations-count">4 categories</span>
          </div>
          <div className="recommendations-grid">
            {personalRecommendations.map((category, index) => (
              <div key={index} className="recommendation-category">
                <h4 className="category-title">{category.category}</h4>
                <div className="category-items">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="recommendation-item">
                      <span className="recommendation-checkmark"></span>
                      <span className="recommendation-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Insight Panel */}
      {selectedInsight && (
        <Card className="detailed-insight-card">
          <div className="insight-header">
            <h3>Recommended Actions</h3>
            <button 
              className="btn btn-outline"
              onClick={() => setSelectedInsight(null)}
            >
              Close
            </button>
          </div>
          <div className="insight-content">
            {basicInsights
              .find(p => p.id === selectedInsight)
              ?.recommendations.map((action, index) => (
                <div key={index} className="action-item">
                  <span className="action-number">{index + 1}</span>
                  <span className="action-text">{action}</span>
                  <button className="btn btn-sm btn-primary">Learn More</button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Security Tips */}
      <div className="security-tips-section">
        <Card className="tips-card">
          <h3>Quick Security Tips</h3>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-icon">lock</span>
              <span className="tip-text">Always use strong, unique passwords for each account</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">shield</span>
              <span className="tip-text">Enable two-factor authentication whenever possible</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">eye</span>
              <span className="tip-text">Be cautious with emails from unknown senders</span>
            </div>
            <div className="tip-item">
              <span className="tip-icon">update</span>
              <span className="tip-text">Keep your software and devices updated</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Help & Support */}
      <div className="help-section">
        <Card className="help-card">
          <h3>Need Help?</h3>
          <div className="help-options">
            <button className="btn btn-outline">Security Guide</button>
            <button className="btn btn-outline">Contact Support</button>
            <button className="btn btn-outline">FAQ</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAIInsights;
