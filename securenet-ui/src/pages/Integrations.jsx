import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/integrations.css';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'VirusTotal',
      description: 'Advanced malware and URL analysis',
      status: 'active',
      category: 'threat-intelligence',
      apiKey: '****-****-****-1234',
      lastSync: '2 minutes ago',
      features: ['File Analysis', 'URL Scanning', 'Domain Reputation']
    },
    {
      id: 2,
      name: 'AbuseIPDB',
      description: 'IP address reputation and abuse reporting',
      status: 'active',
      category: 'threat-intelligence',
      apiKey: '****-****-****-5678',
      lastSync: '5 minutes ago',
      features: ['IP Lookup', 'Blacklist Check', 'Geolocation']
    },
    {
      id: 3,
      name: 'URLScan',
      description: 'URL and website scanning service',
      status: 'inactive',
      category: 'threat-intelligence',
      apiKey: 'Not configured',
      lastSync: 'Never',
      features: ['URL Analysis', 'Screenshot Capture', 'Content Scan']
    },
    {
      id: 4,
      name: 'Shodan',
      description: 'Internet-connected device search engine',
      status: 'active',
      category: 'network-intelligence',
      apiKey: '****-****-****-9012',
      lastSync: '1 hour ago',
      features: ['Device Discovery', 'Port Scanning', 'Service Detection']
    },
    {
      id: 5,
      name: 'OTX AlienVault',
      description: 'Open threat exchange platform',
      status: 'active',
      category: 'threat-intelligence',
      apiKey: '****-****-****-3456',
      lastSync: '30 minutes ago',
      features: ['IOC Sharing', 'Threat Feeds', 'Malware Analysis']
    },
    {
      id: 6,
      name: 'Splunk',
      description: 'Security information and event management',
      status: 'inactive',
      category: 'siem',
      apiKey: 'Not configured',
      lastSync: 'Never',
      features: ['Log Aggregation', 'Real-time Monitoring', 'Alert Management']
    }
  ]);

  const handleToggleIntegration = (id) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            status: integration.status === 'active' ? 'inactive' : 'active',
            lastSync: integration.status === 'inactive' ? 'Just now' : integration.lastSync
          }
        : integration
    ));
  };

  const handleConfigure = (id) => {
    console.log(`Configure integration ${id}`);
    // In a real app, this would open a configuration modal
  };

  const handleTestConnection = (id) => {
    console.log(`Test connection for integration ${id}`);
    // In a real app, this would test the API connection
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#00f5ff' : '#ffaa00';
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'threat-intelligence': return '#ff3366';
      case 'network-intelligence': return '#00f5ff';
      case 'siem': return '#ffaa00';
      default: return '#666';
    }
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active').length;
  const threatIntelligenceCount = integrations.filter(i => i.category === 'threat-intelligence').length;

  return (
    <div className="integrations-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Integrations</h1>
        <p className="page-subtitle">Connect with third-party security services and APIs</p>
      </div>

      <div className="integrations-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{integrations.length}</span>
            <span className="stat-label">Total Integrations</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{activeIntegrations}</span>
            <span className="stat-label">Active</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{threatIntelligenceCount}</span>
            <span className="stat-label">Threat Intelligence</span>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-value">{integrations.filter(i => i.status === 'inactive').length}</span>
            <span className="stat-label">Inactive</span>
          </div>
        </Card>
      </div>

      <div className="integrations-grid">
        {integrations.map((integration) => (
          <Card key={integration.id} className="integration-card">
            <div className="integration-header">
              <div className="integration-info">
                <h3 className="integration-name">{integration.name}</h3>
                <p className="integration-description">{integration.description}</p>
              </div>
              <div className="integration-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(integration.status) }}
                >
                  {integration.status.toUpperCase()}
                </span>
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(integration.category) }}
                >
                  {integration.category.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="integration-details">
              <div className="detail-item">
                <span className="detail-label">API Key:</span>
                <span className="detail-value">{integration.apiKey}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Sync:</span>
                <span className="detail-value">{integration.lastSync}</span>
              </div>
            </div>

            <div className="integration-features">
              <h4>Features</h4>
              <div className="features-list">
                {integration.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="integration-actions">
              <button 
                className={`btn ${integration.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => handleToggleIntegration(integration.id)}
              >
                {integration.status === 'active' ? 'Disconnect' : 'Connect'}
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => handleConfigure(integration.id)}
              >
                Configure
              </button>
              {integration.status === 'active' && (
                <button 
                  className="btn btn-outline"
                  onClick={() => handleTestConnection(integration.id)}
                >
                  Test Connection
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="add-integration-card">
        <h3>Add New Integration</h3>
        <div className="add-integration-content">
          <p>Connect additional security services and threat intelligence platforms</p>
          <div className="available-integrations">
            <div className="integration-option">
              <span className="integration-icon">api</span>
              <div className="integration-option-info">
                <h4>Custom API</h4>
                <p>Connect to any REST API endpoint</p>
              </div>
              <button className="btn btn-outline">Add</button>
            </div>
            <div className="integration-option">
              <span className="integration-icon">webhook</span>
              <div className="integration-option-info">
                <h4>Webhook</h4>
                <p>Receive data from external services</p>
              </div>
              <button className="btn btn-outline">Add</button>
            </div>
            <div className="integration-option">
              <span className="integration-icon">database</span>
              <div className="integration-option-info">
                <h4>Database</h4>
                <p>Connect to external databases</p>
              </div>
              <button className="btn btn-outline">Add</button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="sync-settings-card">
        <h3>Sync Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Auto Sync</span>
              <span className="setting-description">Automatically sync data from integrations</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Sync Frequency</span>
              <span className="setting-description">How often to sync data</span>
            </div>
            <select className="form-select">
              <option value="realtime">Real-time</option>
              <option value="5min">Every 5 minutes</option>
              <option value="15min">Every 15 minutes</option>
              <option value="1hour">Every hour</option>
            </select>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-name">Error Notifications</span>
              <span className="setting-description">Get notified when integrations fail</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Integrations;
