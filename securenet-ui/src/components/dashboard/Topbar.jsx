import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

function Navbar({ toggleMenu, menuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const { user, logout } = useAuth();
  
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
      name: "Admin",
      children: [
        ...(user?.role === 'admin' ? [{ name: "Admin Panel", path: "/admin-panel" }] : []),
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

  const toggleDropdown = (menu) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to redirect to home
      navigate('/');
    }
  };

  const handleRipple = (e) => {
    const target = e.currentTarget;
    const circle = document.createElement("span");

    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - target.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - target.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = target.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    target.appendChild(circle);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".nav-item")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="navbar">
      
      <div className="logo">SecureNet IDS</div>

      <div className="nav-links">
        {navItems.map((item) => (
          <div className={`nav-item ${activeMenu === item.name ? "active" : ""}`} key={item.name}>
            
            {item.children ? (
              <>
                <span onClick={(e) => {
                  handleRipple(e);
                  toggleDropdown(item.name);
                }}>
                  {item.name}
                  {item.children && <span className="arrow">▾</span>}
                </span>

                {activeMenu === item.name && (
                  <div className="dropdown">
                    {item.children.map((child) => (
                      <Link key={child.name} to={child.path}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link to={item.path} className={location.pathname === item.path ? "active" : ""} onClick={handleRipple}>
                {item.name}
              </Link>
            )}

          </div>
        ))}
      </div>

      <div className="nav-right">
        <div className="user-info">
          <div className="user-name">{user?.user_metadata?.name || user?.email || 'User'}</div>
          <div className={`user-role ${user?.user_metadata?.role || 'user'}`}>
            {user?.user_metadata?.role || 'user'}
          </div>
        </div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <button className={`hamburger ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

    </div>
  );
}

export default Navbar;
