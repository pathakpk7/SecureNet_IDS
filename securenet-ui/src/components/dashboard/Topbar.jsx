import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

function Navbar({ toggleMenu, menuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoverMenu, setHoverMenu] = useState(null);
  const { user, logout } = useAuth();
  
  // Safely resolve the current user (especially for demo accounts)
  const currentUser = user || (localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')) : null);
  const currentRole = (currentUser?.role || currentUser?.user_metadata?.role || 'user').toUpperCase();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alerts", path: "/alerts" },

    {
      name: "Monitoring",
      children: [
        { name: "Network Monitor", path: "/network-monitor" },
        { name: "Logs", path: "/logs" },
        { name: "Notifications", path: "/notifications" }
      ]
    },

    {
      name: "Analysis",
      children: [
        { name: "Attack Analysis", path: "/attack-analysis" },
        { name: "AI Insights", path: "/ai-insights" },
        { name: "Reports", path: "/reports" }
      ]
    },

    {
      name: currentRole,
      children: [
        ...(currentRole === 'ADMIN' ? [{ name: "Admin Panel", path: "/admin-panel" }] : []),
        { name: "User Profile", path: "/user-profile" }
      ]
    },

    {
      name: "Tools",
      children: [
        { name: "Simulation", path: "/simulation" },
        { name: "Integrations", path: "/integrations" }
      ]
    },

    { name: "Settings", path: "/settings" }
  ];

  const closeMenu = () => {
    setActiveMenu(null);
    setHoverMenu(null);
  };

  const toggleDropdown = (menu) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.path);
  };

  // Close dropdown menu whenever location changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".nav-item")) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="navbar">
      
      <div className="logo">
        <Link to="/dashboard" onClick={closeMenu} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.jpg" alt="SecureNet IDS Logo" className="topbar-logo-img" />
        </Link>
      </div>

      <div className="nav-links">
        {navItems.map((item) => {
          const isOpen = (activeMenu === item.name || hoverMenu === item.name);
          return (
            <div 
              className={`nav-item ${isOpen ? "menu-open" : ""}`} 
              key={item.name}
              onMouseEnter={() => item.children && setHoverMenu(item.name)}
              onMouseLeave={() => setHoverMenu(null)}
            >
              {item.children ? (
                <>
                  <span 
                    className={isChildActive(item.children) ? "active" : ""}
                    onClick={() => toggleDropdown(item.name)}
                  >
                    {item.name}
                    <span className={`arrow ${isOpen ? 'open' : ''}`}>▾</span>
                  </span>

                  {isOpen && (
                    <div className="dropdown">
                      {item.children.map((child) => (
                        <Link 
                          key={child.name} 
                          to={child.path}
                          className={location.pathname === child.path ? "active" : ""}
                          onClick={closeMenu}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  to={item.path} 
                  className={location.pathname === item.path ? "active" : ""} 
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              )}

            </div>
          );
        })}
      </div>

      <div className="nav-right">
        <div className="user-info">
          <div className="user-name">{user?.name || user?.user_metadata?.name || 'Authorized User'}</div>
          <div className={`user-role ${user?.role || user?.user_metadata?.role || 'user'}`}>
            {(user?.role || user?.user_metadata?.role || 'USER').toUpperCase()}
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <button className={`hamburger ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

    </div>
  );
}

export default Navbar;
