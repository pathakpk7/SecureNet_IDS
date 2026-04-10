import React, { useEffect, useState } from 'react';
import './ScanLine.css';

const ScanLine = () => {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scan-line">
      <div 
        className="scan-beam"
        style={{ left: `${position}%` }}
      />
      <div className="scan-glow" />
    </div>
  );
};

export default ScanLine;
