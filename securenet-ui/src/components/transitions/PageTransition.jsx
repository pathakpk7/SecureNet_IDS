import React, { useState, useEffect } from 'react';
import './PageTransition.css';

const PageTransition = ({ children, transitionType = 'fade' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  const getTransitionClass = () => {
    const baseClass = 'page-transition';
    const typeClass = `page-transition--${transitionType}`;
    const visibilityClass = isVisible ? 'page-transition--visible' : 'page-transition--hidden';
    
    return `${baseClass} ${typeClass} ${visibilityClass}`;
  };

  return (
    <div className={getTransitionClass()}>
      {children}
    </div>
  );
};

export default PageTransition;
