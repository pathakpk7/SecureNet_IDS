import React, { useState } from 'react';
import Card from '../components/ui/Card';
import '../styles/pages/settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailAlerts: true,
    pushNotifications: true,
    autoRefresh: true,
    soundAlerts: false,
    logLevel: 'info',
    sessionTimeout: 30,
    dataRetention: 90,
    apiRateLimit: 1000,
    twoFactorAuth: false,
    passwordExpiry: 90,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // In a real app, this would save to backend
  };

  const handleReset = () => {
    setSettings({
      darkMode: false,
      emailAlerts: true,
      pushNotifications: true,
      autoRefresh: true,
      soundAlerts: false,
      logLevel: 'info',
      sessionTimeout: 30,
      dataRetention: 90,
      apiRateLimit: 1000,
      twoFactorAuth: false,
      passwordExpiry: 90,
      backupFrequency: 'daily',
      maintenanceMode: false,
      debugMode: false
    });
  };

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your SecureNet IDS preferences and system options</p>
      </div>

      <div className="settings-grid">
        <Card className="settings-section">
          <h3>Appearance</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Dark Mode</span>
                <span className="setting-description">Use dark theme for the interface</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Auto Refresh</span>
                <span className="setting-description">Automatically refresh dashboard data</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.autoRefresh}
                  onChange={() => handleToggle('autoRefresh')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Sound Alerts</span>
                <span className="setting-description">Play sound for security alerts</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.soundAlerts}
                  onChange={() => handleToggle('soundAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Notifications</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Email Alerts</span>
                <span className="setting-description">Receive security alerts via email</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailAlerts}
                  onChange={() => handleToggle('emailAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Push Notifications</span>
                <span className="setting-description">Receive browser push notifications</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Alert Threshold</span>
                <span className="setting-description">Minimum severity for notifications</span>
              </div>
              <select 
                className="form-select"
                value={settings.logLevel}
                onChange={(e) => handleChange('logLevel', e.target.value)}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Security</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Two-Factor Authentication</span>
                <span className="setting-description">Require 2FA for all users</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Session Timeout</span>
                <span className="setting-description">Auto-logout after inactivity (minutes)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Password Expiry</span>
                <span className="setting-description">Force password change after (days)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.passwordExpiry}
                onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                min="30"
                max="365"
              />
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>System</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Data Retention</span>
                <span className="setting-description">Keep logs and data for (days)</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.dataRetention}
                onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                min="7"
                max="365"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">API Rate Limit</span>
                <span className="setting-description">Requests per minute per user</span>
              </div>
              <input 
                type="number" 
                className="form-input"
                value={settings.apiRateLimit}
                onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
                min="100"
                max="10000"
              />
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Backup Frequency</span>
                <span className="setting-description">How often to backup system data</span>
              </div>
              <select 
                className="form-select"
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h3>Advanced</h3>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Maintenance Mode</span>
                <span className="setting-description">Temporarily disable user access</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.maintenanceMode}
                  onChange={() => handleToggle('maintenanceMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Debug Mode</span>
                <span className="setting-description">Enable detailed logging and debugging</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.debugMode}
                  onChange={() => handleToggle('debugMode')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      <Card className="settings-actions">
        <div className="actions-content">
          <div className="actions-info">
            <h3>Settings Actions</h3>
            <p>Save your changes or reset to default settings</p>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleSave}>
              Save Settings
            </button>
            <button className="btn btn-outline" onClick={handleReset}>
              Reset to Default
            </button>
            <button className="btn btn-outline">Export Settings</button>
            <button className="btn btn-outline">Import Settings</button>
          </div>
        </div>
      </Card>

      <Card className="settings-info">
        <h3>System Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">SecureNet IDS v3.2.1</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">January 15, 2024</span>
          </div>
          <div className="info-item">
            <span className="info-label">License:</span>
            <span className="info-value">Enterprise Edition</span>
          </div>
          <div className="info-item">
            <span className="info-label">Support:</span>
            <span className="info-value">support@securenet.com</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
