import React from 'react';
import GridBackground from '../components/effects/GridBackground';
import ParticleBackground from '../components/effects/ParticleBackground';
import Navbar from '../components/common/Navbar';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <GridBackground />
      <ParticleBackground />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
