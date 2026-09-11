import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  LayoutDashboard, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Bell, 
  Search, 
  Brain, 
  BarChart3, 
  Shield, 
  User, 
  Terminal, 
  Cpu, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen = true, setMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Resolve current user & role
  const currentUser = user || (localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')) : null);
  const currentRole = (currentUser?.role || currentUser?.user_metadata?.role || 'user').toUpperCase();
  const userName = currentUser?.name || currentUser?.user_metadata?.name || 'Authorized User';
  const userEmail = currentUser?.email || 'operator@securenet.io';

  // Accordion state for expandable sections
  const [expandedGroups, setExpandedGroups] = useState({
    Monitoring: true,
    Analysis: false,
    [currentRole]: false,
    Tools: false
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleLogout = async () => {
    if (setMenuOpen) setMenuOpen(false);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Alerts", path: "/alerts", icon: ShieldAlert },

    {
      name: "Monitoring",
      icon: Activity,
      children: [
        { name: "Network Monitor", path: "/network-monitor", icon: Radio },
        { name: "System Logs", path: "/logs", icon: FileText },
        { name: "System Audit Trail", path: "/audit-logs", icon: ShieldCheck },
        { name: "Notifications", path: "/notifications", icon: Bell }
      ]
    },

    {
      name: "Analysis",
      icon: Search,
      children: [
        { name: "Attack Analysis", path: "/attack-analysis", icon: Shield },
        { name: "AI Insights", path: "/ai-insights", icon: Brain },
        { name: "Reports", path: "/reports", icon: BarChart3 }
      ]
    },

    {
      name: currentRole,
      icon: User,
      children: [
        ...(currentRole === 'ADMIN' ? [
          { name: "Admin Panel", path: "/admin-panel", icon: Shield },
          { name: "System Audit Trail", path: "/audit-logs", icon: ShieldCheck },
          { name: "SIEM Export", path: "/siem-export", icon: Terminal }
        ] : []),
        { name: "User Profile", path: "/user-profile", icon: User }
      ]
    },

    {
      name: "Tools",
      icon: Terminal,
      children: [
        { name: "Simulation", path: "/simulation", icon: Cpu },
        { name: "Integrations", path: "/integrations", icon: Terminal }
      ]
    },

    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMenuOpen && setMenuOpen(false)} 
          aria-hidden="true"
        />
      )}
      
      {/* Slide-out Sidebar Drawer */}
      <aside className={`mobile-sidebar ${isOpen ? 'open' : ''}`} aria-label="Mobile Navigation">
        {/* Drawer Header */}
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-brand">
            <img src="/logo.jpg" alt="SecureNet IDS Logo" className="mobile-sidebar-logo-img" />
            <div className="mobile-sidebar-brand-text">
              <span className="mobile-brand-title">SecureNet</span>
              <span className="mobile-brand-sub">IDS Console</span>
            </div>
          </div>
          <button 
            className="mobile-sidebar-close-btn" 
            onClick={() => setMenuOpen && setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Identity Card */}
        <div className="mobile-user-card">
          <div className="mobile-user-avatar">
            <User size={18} />
          </div>
          <div className="mobile-user-details">
            <span className="mobile-user-name">{userName}</span>
            <span className="mobile-user-email">{userEmail}</span>
          </div>
          <span className={`mobile-role-badge ${currentRole.toLowerCase()}`}>
            {currentRole}
          </span>
        </div>
        
        {/* Navigation List */}
        <nav className="mobile-sidebar-nav">
          <ul className="mobile-nav-list">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const hasChildren = Boolean(item.children);
              const isGroupExpanded = Boolean(expandedGroups[item.name]);
              const childActive = hasChildren && isChildActive(item.children);

              if (hasChildren) {
                return (
                  <li key={item.name} className="mobile-nav-group-item">
                    <button 
                      className={`mobile-group-toggle ${childActive ? 'active-group' : ''}`}
                      onClick={() => toggleGroup(item.name)}
                      aria-expanded={isGroupExpanded}
                    >
                      <div className="mobile-group-toggle-left">
                        <IconComponent size={18} className="mobile-nav-icon" />
                        <span className="mobile-nav-text">{item.name}</span>
                      </div>
                      {isGroupExpanded ? (
                        <ChevronDown size={16} className="mobile-chevron" />
                      ) : (
                        <ChevronRight size={16} className="mobile-chevron" />
                      )}
                    </button>

                    {isGroupExpanded && (
                      <ul className="mobile-sub-list">
                        {item.children.map((child) => {
                          const SubIcon = child.icon || FileText;
                          const isSubActive = location.pathname === child.path;
                          return (
                            <li key={child.path} className="mobile-sub-item">
                              <Link
                                to={child.path}
                                className={`mobile-sub-link ${isSubActive ? 'active' : ''}`}
                                onClick={() => setMenuOpen && setMenuOpen(false)}
                              >
                                <SubIcon size={15} className="mobile-sub-icon" />
                                <span>{child.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="mobile-nav-single-item">
                  <Link 
                    to={item.path} 
                    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMenuOpen && setMenuOpen(false)}
                  >
                    <IconComponent size={18} className="mobile-nav-icon" />
                    <span className="mobile-nav-text">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Drawer Footer / Logout */}
        <div className="mobile-sidebar-footer">
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
