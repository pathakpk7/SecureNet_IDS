import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            SecureNet IDS
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link to="/login" className="nav-link">
            <button className="btn btn-outline">
              Login
            </button>
          </Link>
          <Link to="/signup" className="nav-link">
            <button className="btn">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
