import React, { useState, useEffect, useRef } from 'react';
import './AnimatedCounter.css';

const AnimatedCounter = ({ 
  value, 
  duration = 2000, 
  prefix = '', 
  suffix = '', 
  className = '',
  formatValue = (val) => val 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const targetValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    
    if (targetValue !== previousValue.current) {
      setIsAnimating(true);
      const startValue = previousValue.current;
      const endValue = targetValue;
      const startTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeInOutQuad)
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentValue = startValue + (endValue - startValue) * easeProgress;
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          previousValue.current = endValue;
        }
      };
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = formatValue(displayValue);

  return (
    <span className={`animated-counter ${isAnimating ? 'animating' : ''} ${className}`}>
      {prefix}
      <span className="counter-value">{formattedValue}</span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
