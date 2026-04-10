import React, { useState, useEffect } from "react";
import Navbar from '../components/dashboard/Topbar';
import Sidebar from '../components/dashboard/Sidebar';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen(); // IMPORTANT (initial run)
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <div className="layout">

      <Navbar 
        toggleMenu={() => setMenuOpen(prev => !prev)} 
        menuOpen={menuOpen}
      />

      {/* MOBILE SIDEBAR */}
      {isMobile && (
        <Sidebar isOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}

      {/* MAIN CONTENT */}
      <div className="content">
        {children}
      </div>

    </div>
  );
}

export default DashboardLayout;
