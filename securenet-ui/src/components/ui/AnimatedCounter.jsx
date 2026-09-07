import React, { useState, useEffect, useRef } from 'react';
import './AnimatedCounter.css';

const AnimatedCounter = ({ 
  value, 
  duration = 400, 
  prefix = '', 
  suffix = '', 
  className = '',
  decimals = 0
}) => {
  const targetValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);
  const animationRef = useRef(null);

  useEffect(() => {
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startValue = previousValue.current;
    
    if (Math.abs(endValue - startValue) < 0.001) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const curr = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(curr);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValue.current = endValue;
      }
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Format clean integer vs decimal values (prevent 15686.291812 float spam)
  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.round(num).toLocaleString();
  };

  return (
    <span className={`animated-counter ${className}`}>
      {prefix}
      <span className="counter-value">{formatNumber(displayValue)}</span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
