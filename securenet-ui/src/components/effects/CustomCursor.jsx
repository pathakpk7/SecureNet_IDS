import React, { useEffect, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Add to trail
      setTrail(prev => [
        { x: e.clientX, y: e.clientY, id: Date.now() },
        ...prev.slice(-8) // Keep only last 8 trail points
      ]);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Clean up old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.filter(point => Date.now() - point.id < 200));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="custom-cursor">
        <div 
          className={`cursor-dot ${isHovering ? 'hovering' : ''}`}
          style={{ left: position.x, top: position.y }}
        />
        {trail.map((point, index) => (
          <div
            key={point.id}
            className="trail-dot"
            style={{
              left: point.x,
              top: point.y,
              opacity: (index + 1) / trail.length
            }}
          />
        ))}
      </div>
      <style jsx>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
