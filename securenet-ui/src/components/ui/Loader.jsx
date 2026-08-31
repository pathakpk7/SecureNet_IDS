import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loader-container ${size}`}>
      <div className="loader-ring">
        <div className="ring-segment"></div>
        <div className="ring-segment"></div>
        <div className="ring-segment"></div>
        <div className="ring-segment"></div>
      </div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;
