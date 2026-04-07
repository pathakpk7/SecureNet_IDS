import React, { useState } from 'react';
import { FiBell, FiShield, FiDatabase, FiActivity, FiSettings, FiMoon, FiSun, FiGlobe } from 'react-icons/fi';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-neon-blue' : 'bg-gray-600'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

// Slider Component
const Slider = ({ value, onChange, min, max, label, unit }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <span className="text-neon-blue font-semibold">
        {value}{unit}
      </span>
    </div>
    <div className="relative">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="
          w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
          slider-thumb
        "
        style={{
          background: `linear-gradient(to right, #00F5FF 0%, #00F5FF ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
        }}
      />
    </div>
  </div>
);

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoDetection, setAutoDetection] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [dataRetention, setDataRetention] = useState(30);
  const [scanFrequency, setScanFrequency] = useState(5);
  const [alertThreshold, setAlertThreshold] = useState(3);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
          <p className="text-gray-400">Configure your SecureNet IDS preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <FiSettings className="text-neon-blue" size={20} />
          <span className="text-sm text-neon-blue">Configuration</span>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiShield className="text-neon-blue" size={24} />
            <h2 className="text-xl font-semibold text-white">Security Settings</h2>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={autoDetection}
              onChange={setAutoDetection}
              label="Auto Detection Mode"
            />
            
            <ToggleSwitch
              enabled={notifications}
              onChange={setNotifications}
              label="Real-time Notifications"
            />

            <Slider
              value={alertThreshold}
              onChange={setAlertThreshold}
              min={1}
              max={10}
              label="Alert Sensitivity"
              unit=""
            />

            <Slider
              value={scanFrequency}
              onChange={setScanFrequency}
              min={1}
              max={60}
              label="Scan Frequency"
              unit=" min"
            />
          </div>
        </div>

        {/* System Settings */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiDatabase className="text-neon-green" size={24} />
            <h2 className="text-xl font-semibold text-white">System Settings</h2>
          </div>

          <div className="space-y-4">
            <ToggleSwitch
              enabled={darkMode}
              onChange={setDarkMode}
              label="Dark Mode"
            />

            <Slider
              value={dataRetention}
              onChange={setDataRetention}
              min={7}
              max={90}
              label="Data Retention Period"
              unit=" days"
            />

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">System Status</span>
                <span className="text-neon-green text-sm font-semibold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Version</span>
                <span className="text-white">v2.4.1</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Last Update</span>
                <span className="text-white">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiGlobe className="text-neon-yellow" size={24} />
            <h2 className="text-xl font-semibold text-white">Network Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Monitoring Interface</span>
                <span className="text-neon-blue text-sm font-semibold">eth0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">IP Address</span>
                <span className="text-white font-mono">192.168.1.100</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Status</span>
                <span className="text-neon-green">Active</span>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Firewall Status</span>
                <span className="text-neon-green text-sm font-semibold">ENABLED</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rules Applied</span>
                <span className="text-white">247</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Blocked Today</span>
                <span className="text-neon-red">1,247</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <FiActivity className="text-orange-500" size={24} />
            <h2 className="text-xl font-semibold text-white">Performance</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-neon-yellow text-sm font-semibold">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-neon-yellow h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Memory Usage</span>
                <span className="text-neon-blue text-sm font-semibold">62%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-neon-blue h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Disk Usage</span>
                <span className="text-neon-green text-sm font-semibold">28%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-neon-green h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-neon-blue/20 border border-neon-blue text-neon-blue rounded-lg font-semibold transition-all duration-300 hover:bg-neon-blue/30 hover:scale-105 hover-glow">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
