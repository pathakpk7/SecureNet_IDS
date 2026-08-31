import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import '../../styles/pages/integrations.css';

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Slack Notifications',
      status: 'active',
      type: 'communication',
      lastSync: '2 minutes ago',
      description: 'Send security alerts to Slack channels'
    },
    {
      id: 2,
      name: 'SIEM System',
      status: 'active',
      type: 'security',
      lastSync: '5 minutes ago',
      description: 'Export logs to external SIEM system'
    },
    {
      id: 3,
      name: 'Active Directory',
      status: 'inactive',
      type: 'authentication',
      lastSync: '1 hour ago',
      description: 'Sync user accounts with AD'
    },
    {
      id: 4,
      name: 'Threat Intelligence API',
      status: 'active',
      type: 'security',
      lastSync: '1 minute ago',
      description: 'Import threat intelligence feeds'
    },
    {
      id: 5,
      name: 'Email Gateway',
      status: 'active',
      type: 'communication',
      lastSync: '3 minutes ago',
      description: 'Integrate with email security gateway'
    },
    {
      id: 6,
      name: 'Cloud Provider',
      status: 'error',
      type: 'cloud',
      lastSync: 'Failed',
      description: 'Connect to AWS/Azure security services'
    }
  ]);

  const [integrationStats, setIntegrationStats] = useState({
    total: 6,
    active: 4,
    inactive: 1,
    error: 1
  });

  // Simulate real-time sync status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        lastSync: integration.status === 'active' 
          ? Math.random() > 0.7 ? 'Just now' : integration.lastSync
          : integration.lastSync
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleIntegration = (id) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'active' ? 'inactive' : 'active';
        return { ...integration, status: newStatus };
      }
      return integration;
    }));

    // Update stats
    setIntegrationStats(prev => {
      const integration = integrations.find(i => i.id === id);
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
      case 'error': return '#ff0000';
      default: return '#888';
    }
  };

  return (
    <div className="admin-integrations-page fade-in">
      <div className="page-header">
        <h1 className="page-title">System Integrations</h1>
        <p className="page-subtitle">Manage third-party service connections and data flows</p>
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
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-value">{integrationStats.error}</div>
            <div className="stat-label">Errors</div>
          </div>
        </Card>
      </div>

      <div className="integrations-grid">
        <Card className="integrations-card full-width">
          <h3 className="card-title">Active Integrations</h3>
          <div className="integrations-list">
            {integrations
              .filter(integration => integration.status === 'active')
              .map(integration => (
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
                      className="btn btn-sm btn-outline"
                      onClick={() => handleToggleIntegration(integration.id)}
                    >
                      Disable
                    </button>
                    <button className="btn btn-sm btn-primary">Configure</button>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card className="integrations-card">
          <h3 className="card-title">Inactive Integrations</h3>
          <div className="integrations-list">
            {integrations
              .filter(integration => integration.status === 'inactive')
              .map(integration => (
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
                      className="btn btn-sm btn-primary"
                      onClick={() => handleToggleIntegration(integration.id)}
                    >
                      Enable
                    </button>
                    <button className="btn btn-sm btn-outline">Configure</button>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card className="integrations-card">
          <h3 className="card-title">Integration Errors</h3>
          <div className="integrations-list">
            {integrations
              .filter(integration => integration.status === 'error')
              .map(integration => (
                <div key={integration.id} className="integration-item error">
                  <div className="integration-info">
                    <div className="integration-header">
                      <h4 className="integration-name">{integration.name}</h4>
                      <span 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(integration.status) }}
                      ></span>
                    </div>
                    <p className="integration-description">{integration.description}</p>
                    <div className="error-message">
                      Connection timeout. Please check credentials.
                    </div>
                  </div>
                  <div className="integration-actions">
                    <button className="btn btn-sm btn-warning">Retry</button>
                    <button className="btn btn-sm btn-outline">Troubleshoot</button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminIntegrations;
