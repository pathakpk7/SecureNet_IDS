import React from 'react';
import './Topbar.css';

function Navbar({ toggleMenu, menuOpen }) {
  const navItems = [
    "Dashboard",
    "Alerts",
    "Network Monitor",
    "Attack Analysis",
    "AI Insights",
    "Logs",
    "Reports",
    "Admin Panel",
    "User Profile",
    "Notifications",
    "Simulation",
    "Integrations",
    "Settings"
  ];

  return (
    <div className="navbar">
      
      <div className="logo">SecureNet IDS</div>

      <div className="nav-links">
        {navItems.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>

      <div className="nav-right">
        <div className="user-info">
          <div className="user-name">Prasoon Pathak</div>
          <div className={`user-role admin`}>
            Admin
          </div>
        </div>
        <button className="logout-btn">Logout</button>
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
