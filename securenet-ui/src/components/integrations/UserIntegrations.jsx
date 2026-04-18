import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/integrations.css';

const UserIntegrations = () => {
  const [userIntegrations, setUserIntegrations] = useState([
    {
      id: 1,
      name: 'Personal Email',
      status: 'active',
      type: 'communication',
      lastSync: '5 minutes ago',
      description: 'Receive security alerts via email'
    },
    {
      id: 2,
      name: 'Mobile App',
      status: 'active',
      type: 'mobile',
      lastSync: '1 minute ago',
      description: 'Push notifications to mobile device'
    },
    {
      id: 3,
      name: 'Password Manager',
      status: 'inactive',
      type: 'security',
      lastSync: '2 days ago',
      description: 'Sync with external password manager'
    },
    {
      id: 4,
      name: 'VPN Service',
      status: 'active',
      type: 'network',
      lastSync: '10 minutes ago',
      description: 'VPN connection monitoring'
    }
  ]);

  const [integrationStats, setIntegrationStats] = useState({
    total: 4,
    active: 3,
    inactive: 1
  });

  // Simulate sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserIntegrations(prev => prev.map(integration => ({
        ...integration,
        lastSync: integration.status === 'active' 
          ? Math.random() > 0.8 ? 'Just now' : integration.lastSync
          : integration.lastSync
      })));
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleIntegration = (id) => {
    setUserIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'active' ? 'inactive' : 'active';
        return { ...integration, status: newStatus };
      }
      return integration;
    }));

    // Update stats
    setIntegrationStats(prev => {
      const integration = userIntegrations.find(i => i.id === id);
      if (integration.status === 'active') {
        return { ...prev, active: prev.active - 1, inactive: prev.inactive + 1 };
      } else {
        return { ...prev, active: prev.active + 1, inactive: prev.inactive - 1 };
      }
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#00ff00';
      case 'inactive': return '#ffaa00';
      default: return '#888';
    }
  };

  return (
    <div className="user-integrations-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal Integrations</h1>
        <p className="page-subtitle">Manage your connected services and personal integrations</p>
      </div>

      <div className="integration-stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{integrationStats.total}</div>
            <div className="stat-label">Total Integrations</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{integrationStats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{integrationStats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </Card>
      </div>

      <div className="integrations-grid">
        <Card className="integrations-card full-width">
          <h3 className="card-title">Your Connected Services</h3>
          <div className="integrations-list">
            {userIntegrations.map(integration => (
              <div key={integration.id} className="integration-item">
                <div className="integration-info">
                  <div className="integration-header">
                    <h4 className="integration-name">{integration.name}</h4>
                    <span 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(integration.status) }}
                    ></span>
                  </div>
                  <p className="integration-description">{integration.description}</p>
                  <div className="integration-meta">
                    <span className="integration-type">{integration.type}</span>
                    <span className="last-sync">Last sync: {integration.lastSync}</span>
                  </div>
                </div>
                <div className="integration-actions">
                  <button 
                    className={`btn btn-sm ${integration.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => handleToggleIntegration(integration.id)}
                  >
                    {integration.status === 'active' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-sm btn-outline">Settings</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="integrations-card">
          <h3 className="card-title">Integration Benefits</h3>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-icon">email</div>
              <div className="benefit-content">
                <h4>Email Alerts</h4>
                <p>Receive instant security notifications</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">mobile</div>
              <div className="benefit-content">
                <h4>Mobile Push</h4>
                <p>Get alerts on your mobile device</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">security</div>
              <div className="benefit-content">
                <h4>Password Sync</h4>
                <p>Secure password management</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">vpn</div>
              <div className="benefit-content">
                <h4>VPN Protection</h4>
                <p>Monitor VPN connections</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="integrations-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-btn primary">
              <span className="action-icon">add</span>
              Add New Integration
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">sync</span>
              Sync All Services
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">settings</span>
              Integration Settings
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">help</span>
              Help & Support
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserIntegrations;
