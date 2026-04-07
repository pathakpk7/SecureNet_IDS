import React, { useState } from 'react';
import { 
  FiDashboard, 
  FiActivity, 
  FiShield, 
  FiAlertTriangle, 
  FiFileText, 
  FiBarChart2, 
  FiFile, 
  FiSettings, 
  FiInfo,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ activeItem, setActiveItem }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: FiDashboard, label: 'Dashboard', id: 'Dashboard' },
    { icon: FiActivity, label: 'Live Traffic', id: 'Live Traffic' },
    { icon: FiShield, label: 'Threat Detection', id: 'Threat Detection' },
    { icon: FiAlertTriangle, label: 'Alerts', id: 'Alerts' },
    { icon: FiFileText, label: 'Logs', id: 'Logs' },
    { icon: FiBarChart2, label: 'Analytics', id: 'Analytics' },
    { icon: FiFile, label: 'Reports', id: 'Reports' },
    { icon: FiSettings, label: 'Settings', id: 'Settings' },
    { icon: FiInfo, label: 'About', id: 'About' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-lg text-neon-blue hover-glow"
      >
        {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative h-screen bg-bg-secondary/90 backdrop-blur-xl 
        border-r border-neon-blue/30 glass-card transition-all duration-300 z-40
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 w-0 lg:w-64' : 'translate-x-0 w-64'}
        ${isCollapsed ? 'lg:w-20' : ''}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-8`}>
            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-green rounded-lg flex items-center justify-center neon-border">
              <span className="text-black font-bold text-xl">S</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-2xl font-bold neon-text text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
                SecureNet IDS
              </h1>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} 
                    px-4 py-3 rounded-lg transition-all duration-300 relative group
                    ${isActive 
                      ? 'bg-gradient-to-r from-neon-blue/20 to-transparent text-neon-blue border-l-4 border-neon-blue' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }
                    hover:scale-105 hover-glow
                  `}>
                  <Icon size={20} className={isActive ? 'neon-text' : ''} />
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive ? 'neon-text' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue rounded-r-full animate-pulse"></div>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-bg-primary border border-neon-blue/30 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status */}
          <div className={`${isCollapsed ? 'text-center' : ''}`}>
            <div className="glass-card p-4">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-lg shadow-neon-green/50"></div>
                {!isCollapsed && (
                  <span className="text-sm font-semibold text-neon-green neon-text">LIVE</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>System Active</p>
                  <p>Threat Level: Low</p>
                  <p>Last Scan: 2 min ago</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
