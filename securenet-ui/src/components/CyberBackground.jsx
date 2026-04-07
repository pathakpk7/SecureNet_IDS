import React from 'react';

const CyberBackground = () => {
  return (
    <div className="cyber-background">
      {/* Animated Grid Layer */}
      <div className="cyber-grid"></div>
      
      {/* Radial Glow Layer */}
      <div className="radial-glow"></div>
      
      {/* Noise Overlay */}
      <div className="noise-overlay"></div>
      
      {/* Scan Lines */}
      <div className="scan-lines">
        <div className="scan-line scan-line-1"></div>
        <div className="scan-line scan-line-2"></div>
        <div className="scan-line scan-line-3"></div>
      </div>
      
      {/* Floating Particles */}
      <div className="particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
      </div>
    </div>
  );
};

export default CyberBackground;
