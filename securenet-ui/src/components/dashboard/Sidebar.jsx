import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsByRole } from '../../config/navConfig';
import './Sidebar.css';

const Sidebar = ({ isOpen = true, setMenuOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navConfig = getNavItemsByRole(user?.role || 'user');
  const menuItems = navConfig.flatMap(group => group.items);

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
            {navConfig.map((group, groupIndex) => (
              <React.Fragment key={group.group}>
                {groupIndex > 0 && <div className="nav-separator"></div>}
                <li className="nav-group">
                  <div className="nav-group-title">{group.group}</div>
                  {group.items.map((item) => (
                    <li key={item.path} className="nav-item">
                      <Link 
                        to={item.path} 
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setMenuOpen && setMenuOpen(false)}
                      >
                        <span className="nav-icon">{getIcon(item.icon)}</span>
                        <span className="nav-text">{item.name}</span>
                        {location.pathname === item.path && (
                          <div className="nav-indicator"></div>
                        )}
                      </Link>
                    </li>
                  ))}
                </li>
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
