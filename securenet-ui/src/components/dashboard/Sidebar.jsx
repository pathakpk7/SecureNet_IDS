import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNavItemsByRole } from '../../config/navConfig';
import './Sidebar.css';

const Sidebar = ({ isOpen = true, setMenuOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navConfig = getNavItemsByRole(user?.role || 'user');
  const menuItems = navConfig.flatMap(group => group.items);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          </svg>
        );
      case 'warning':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'network':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
        );
      case 'security':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'admin':
      case 'settings':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'person':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'notifications':
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return (
          <svg style={{ width: '16px', height: '16px', display: 'inline-block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
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
            <img src="/logo.jpg" alt="SecureNet IDS Logo" className="sidebar-logo-img" />
            <span className="logo-text">SecureNet IDS</span>
          </div>
          <button className="close-btn" onClick={() => setMenuOpen && setMenuOpen(false)}>
            <X size={18} />
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
