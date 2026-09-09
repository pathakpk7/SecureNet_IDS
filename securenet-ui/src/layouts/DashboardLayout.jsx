import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../components/dashboard/Topbar';
import Sidebar from '../components/dashboard/Sidebar';
import AdminBanner from '../components/common/AdminBanner';
import './DashboardLayout.css';

function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isMobile]);

  return (
    <div className="layout">
      <AdminBanner />

      <Navbar 
        toggleMenu={() => setMenuOpen(prev => !prev)} 
        menuOpen={menuOpen}
      />

      {/* MOBILE / TABLET SIDEBAR DRAWER */}
      {isMobile && (
        <Sidebar isOpen={menuOpen} setMenuOpen={setMenuOpen} />
      )}

      {/* MAIN CONTENT */}
      <main className="content">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;
