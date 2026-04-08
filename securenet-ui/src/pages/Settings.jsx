import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Database, Key, Eye, EyeOff, Save } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
      desktop: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    },
    api: {
      virusTotal: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      abuseIPDB: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      urlScan: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      compactMode: false,
    }
  });
  const [showApiKeys, setShowApiKeys] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'api', name: 'API Keys', icon: Key },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Save settings to backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const maskApiKey = (key) => {
    if (showApiKeys) return key;
    return key.substring(0, 8) + '•'.repeat(key.length - 8);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-400">
            Configure your SecureNet IDS preferences and security settings
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSettings}
          className="btn-primary"
        >
          <Save size={18} />
          <span>Save Settings</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-neon-blue text-neon-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-6"
      >
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                General Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Language
                  </label>
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    className="input-field w-48"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Theme
                  </label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                    className="input-field w-48"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Compact Mode
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="w-12 h-6 bg-gray-600 rounded-full transition-colors duration-200 relative">
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Notification Preferences
              </h3>
              
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 capitalize">
                      {key === 'email' ? 'Email Notifications' :
                       key === 'push' ? 'Push Notifications' :
                       key === 'sms' ? 'SMS Notifications' :
                       key === 'desktop' ? 'Desktop Notifications' : key}
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="sr-only"
                      />
                      <div className="w-12 h-6 bg-gray-600 rounded-full transition-colors duration-200 relative">
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Security Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Two-Factor Authentication
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactor}
                      onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="w-12 h-6 bg-gray-600 rounded-full transition-colors duration-200 relative">
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="input-field w-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2">
                    IP Whitelist
                  </label>
                  <div className="space-y-2">
                    {settings.security.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={ip}
                          onChange={(e) => {
                            const newWhitelist = [...settings.security.ipWhitelist];
                            newWhitelist[index] = e.target.value;
                            handleSettingChange('security', 'ipWhitelist', newWhitelist);
                          }}
                          className="input-field flex-1"
                          placeholder="192.168.1.0/24"
                        />
                        <button
                          onClick={() => {
                            const newWhitelist = settings.security.ipWhitelist.filter((_, i) => i !== index);
                            handleSettingChange('security', 'ipWhitelist', newWhitelist);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newWhitelist = [...settings.security.ipWhitelist, ''];
                        handleSettingChange('security', 'ipWhitelist', newWhitelist);
                      }}
                      className="btn-secondary"
                    >
                      Add IP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                API Keys
              </h3>
              
              <div className="space-y-4">
                {Object.entries(settings.api).map(([service, key]) => (
                  <div key={service} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300 capitalize">
                        {service === 'virusTotal' ? 'VirusTotal API Key' :
                         service === 'abuseIPDB' ? 'AbuseIPDB API Key' :
                         service === 'urlScan' ? 'URLScan API Key' : service}
                      </label>
                      <button
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="p-2 text-neon-blue hover:text-neon-blue/80 transition-colors"
                      >
                        {showApiKeys ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <input
                      type={showApiKeys ? 'text' : 'password'}
                      value={key}
                      onChange={(e) => handleSettingChange('api', service, e.target.value)}
                      className="input-field flex-1 font-mono"
                      placeholder={`Enter your ${service} API key`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;
