import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen = true, setMenuOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: 'dashboard', text: 'Dashboard' },
    { path: '/alerts', icon: 'warning', text: 'Alerts' },
    { path: '/network-monitor', icon: 'network', text: 'Network Monitor' },
    { path: '/attack-analysis', icon: 'security', text: 'Attack Analysis' },
    { path: '/ai-insights', icon: 'psychology', text: 'AI Insights' },
    { path: '/logs', icon: 'description', text: 'Logs' },
    { path: '/reports', icon: 'assessment', text: 'Reports' },
    { path: '/admin-panel', icon: 'admin', text: 'Admin Panel' },
    { path: '/user-profile', icon: 'person', text: 'User Profile' },
    { path: '/notifications', icon: 'notifications', text: 'Notifications' },
    { path: '/simulation', icon: 'science', text: 'Simulation' },
    { path: '/integrations', icon: 'integration', text: 'Integrations' },
    { path: '/settings', icon: 'settings', text: 'Settings' }
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: '📊',
      warning: '⚠️',
      network: '🌐',
      security: '🔒',
      psychology: '🧠',
      description: '📝',
      assessment: '📈',
      admin: '⚙️',
      person: '👤',
      notifications: '🔔',
      science: '🔬',
      integration: '🔗',
      settings: '⚙️'
    };
    return icons[iconName] || '📋';
  };

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div className="overlay" onClick={() => setMenuOpen && setMenuOpen(false)} />
      )}
      
      {/* SIDEBAR */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">shield</span>
            <span className="logo-text">SecureNet IDS</span>
          </div>
          <button className="close-btn" onClick={() => setMenuOpen && setMenuOpen(false)}>
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={item.path} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setMenuOpen && setMenuOpen(false)}
                >
                  <span className="nav-icon">{getIcon(item.icon)}</span>
                  <span className="nav-text">{item.text}</span>
                  {location.pathname === item.path && (
                    <div className="nav-indicator"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
