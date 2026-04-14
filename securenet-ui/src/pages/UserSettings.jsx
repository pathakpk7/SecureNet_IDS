import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/settings.css';

const UserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Personal Settings Only
    darkMode: false,
    autoRefresh: true,
    soundAlerts: false,
    emailAlerts: true,
    pushNotifications: true,
    alertThreshold: 'medium',
    notificationFrequency: 'immediate',
    
    // User Preferences
    language: 'english',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    
    // Dashboard Settings
    defaultDashboard: 'overview',
    widgetsEnabled: true,
    animationEffects: true,
    compactView: false,
    
    // Privacy Settings
    profileVisibility: 'team',
    activityStatus: true,
    lastSeenVisibility: true,
    
    // Accessibility
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReader: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

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
    console.log('Saving user settings:', settings);
    // In a real app, this would save to backend
    alert('Your personal settings have been saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your personal settings to default?')) {
      setSettings({
        darkMode: false,
        autoRefresh: true,
        soundAlerts: false,
        emailAlerts: true,
        pushNotifications: true,
        alertThreshold: 'medium',
        notificationFrequency: 'immediate',
        language: 'english',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12-hour',
        defaultDashboard: 'overview',
        widgetsEnabled: true,
        animationEffects: true,
        compactView: false,
        profileVisibility: 'team',
        activityStatus: true,
        lastSeenVisibility: true,
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      });
    }
  };

  return (
    <div className="user-settings-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal Settings</h1>
        <p className="page-subtitle">Configure your personal preferences and notification settings</p>
      </div>

      {/* Access Notice */}
      <Card className="access-notice-card user-notice">
        <div className="notice-content">
          <span className="notice-icon">info</span>
          <div className="notice-info">
            <h4>Personal Settings Only</h4>
            <p>You can only modify your personal settings. System configurations are managed by administrators.</p>
          </div>
        </div>
      </Card>

      <div className="settings-grid">
        {/* Appearance Settings */}
        <Card className="settings-section user-section">
          <div className="section-header">
            <h3>Appearance</h3>
            <span className="user-badge">USER</span>
          </div>
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
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Animation Effects</span>
                <span className="setting-description">Enable interface animations</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.animationEffects}
                  onChange={() => handleToggle('animationEffects')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Compact View</span>
                <span className="setting-description">Use compact layout for better space utilization</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.compactView}
                  onChange={() => handleToggle('compactView')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="settings-section user-section">
          <div className="section-header">
            <h3>Notifications</h3>
            <span className="user-badge">USER</span>
          </div>
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
                value={settings.alertThreshold}
                onChange={(e) => handleChange('alertThreshold', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Notification Frequency</span>
                <span className="setting-description">How often to receive notifications</span>
              </div>
              <select 
                className="form-select"
                value={settings.notificationFrequency}
                onChange={(e) => handleChange('notificationFrequency', e.target.value)}
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>
          </div>
        </Card>

        {/* User Preferences */}
        <Card className="settings-section user-section">
          <div className="section-header">
            <h3>User Preferences</h3>
            <span className="user-badge">USER</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Language</span>
                <span className="setting-description">Interface language</span>
              </div>
              <select 
                className="form-select"
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Timezone</span>
                <span className="setting-description">Your local timezone</span>
              </div>
              <select 
                className="form-select"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="MST">Mountain Time (MST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="GMT">Greenwich Mean Time (GMT)</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Date Format</span>
                <span className="setting-description">Preferred date display format</span>
              </div>
              <select 
                className="form-select"
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Time Format</span>
                <span className="setting-description">12-hour or 24-hour time format</span>
              </div>
              <select 
                className="form-select"
                value={settings.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
              >
                <option value="12-hour">12-hour (AM/PM)</option>
                <option value="24-hour">24-hour</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Default Dashboard</span>
                <span className="setting-description">Dashboard to show on login</span>
              </div>
              <select 
                className="form-select"
                value={settings.defaultDashboard}
                onChange={(e) => handleChange('defaultDashboard', e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="threats">Threat Intelligence</option>
                <option value="network">Network Monitor</option>
                <option value="logs">Security Logs</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Dashboard Widgets</span>
                <span className="setting-description">Show dashboard widgets</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.widgetsEnabled}
                  onChange={() => handleToggle('widgetsEnabled')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="settings-section user-section">
          <div className="section-header">
            <h3>Privacy Settings</h3>
            <span className="user-badge">USER</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Profile Visibility</span>
                <span className="setting-description">Who can see your profile</span>
              </div>
              <select 
                className="form-select"
                value={settings.profileVisibility}
                onChange={(e) => handleChange('profileVisibility', e.target.value)}
              >
                <option value="private">Private</option>
                <option value="team">Team Only</option>
                <option value="public">Public</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Activity Status</span>
                <span className="setting-description">Show when you're online</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.activityStatus}
                  onChange={() => handleToggle('activityStatus')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Last Seen Visibility</span>
                <span className="setting-description">Show your last login time</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.lastSeenVisibility}
                  onChange={() => handleToggle('lastSeenVisibility')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>

        {/* Accessibility Settings */}
        <Card className="settings-section user-section">
          <div className="section-header">
            <h3>Accessibility</h3>
            <span className="user-badge">USER</span>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Font Size</span>
                <span className="setting-description">Text size for better readability</span>
              </div>
              <select 
                className="form-select"
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">High Contrast</span>
                <span className="setting-description">Increase contrast for better visibility</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.highContrast}
                  onChange={() => handleToggle('highContrast')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Reduced Motion</span>
                <span className="setting-description">Minimize animations and transitions</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.reducedMotion}
                  onChange={() => handleToggle('reducedMotion')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Screen Reader Support</span>
                <span className="setting-description">Optimize for screen readers</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.screenReader}
                  onChange={() => handleToggle('screenReader')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* User Actions */}
      <Card className="settings-actions user-actions">
        <div className="actions-content">
          <div className="actions-info">
            <h3>Personal Settings</h3>
            <p>Manage your personal preferences and notification settings</p>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary user-btn" onClick={handleSave}>
              Save Personal Settings
            </button>
            <button className="btn btn-outline user-btn-outline" onClick={handleReset}>
              Reset to Default
            </button>
            <button className="btn btn-outline user-btn-outline disabled" disabled>
              Export Settings (Admin Only)
            </button>
            <button className="btn btn-outline user-btn-outline disabled" disabled>
              Import Settings (Admin Only)
            </button>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="help-card user-help">
        <h3>Settings Help</h3>
        <div className="help-content">
          <div className="help-item">
            <h4>Personal Settings</h4>
            <p>These settings control your personal experience with SecureNet IDS, including appearance, notifications, and accessibility options.</p>
          </div>
          <div className="help-item">
            <h4>System Configurations</h4>
            <p>System-wide settings and security configurations are managed by administrators. Contact your admin if you need changes to system settings.</p>
          </div>
          <div className="help-item">
            <h4>Privacy & Security</h4>
            <p>Your personal data and privacy settings are protected. System administrators cannot view your personal preferences.</p>
          </div>
          <div className="help-item">
            <h4>Need Help?</h4>
            <p>Contact your system administrator for assistance with advanced settings or system configurations.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserSettings;
