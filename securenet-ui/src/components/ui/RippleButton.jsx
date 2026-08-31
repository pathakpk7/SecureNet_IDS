import React, { useState } from 'react';
import './RippleButton.css';

const RippleButton = ({ children, onClick, className = '', disabled = false }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size: 20
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`ripple-button ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </button>
  );
};

export default RippleButton;
