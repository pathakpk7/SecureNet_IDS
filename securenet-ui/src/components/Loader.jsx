import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, Activity, AlertTriangle } from 'lucide-react';

const Loader = ({ 
  type = 'default', 
  size = 'medium', 
  text = 'Loading...',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'security':
        return Shield;
      case 'activity':
        return Activity;
      case 'alert':
        return AlertTriangle;
      default:
        return Loader2;
    }
  };

  const Icon = getTypeIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className={`${getSizeClasses()} flex items-center justify-center`}
      >
        <Icon 
          size={size === 'small' ? 24 : size === 'large' ? 48 : 32}
          className="text-neon-blue neon-text" 
        />
      </motion.div>
      
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-300 text-sm font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

// Specialized loader components
export const PageLoader = () => (
  <div className="fixed inset-0 bg-bg-primary/90 backdrop-blur-lg flex items-center justify-center z-50">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
      >
        <Shield 
          size={48} 
          className="text-neon-blue neon-text" 
        />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">
        SecureNet IDS
      </h3>
      <p className="text-gray-300 mb-4">
        Initializing security systems...
      </p>
      <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-400">System Active</span>
      </div>
    </motion.div>
  </div>
);

export const CardLoader = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }, (_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <div className="h-8 w-16 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </motion.div>
    ))}
  </div>
);

export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="glass-card p-6">
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: rowIndex * 0.1 }}
          className="flex items-center space-x-4 p-3 rounded-lg bg-white/5"
        >
          {Array.from({ length: columns }, (_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-gray-600 rounded animate-pulse ${
                colIndex === 0 ? 'w-24' : colIndex === 1 ? 'w-32' : 'w-20'
              }`}
            ></div>
          ))}
        </motion.div>
      ))}
    </div>
  </div>
);

export const ButtonLoader = ({ loading, children, ...props }) => (
  <motion.button
    whileHover={{ scale: loading ? 1 : 1.02 }}
    whileTap={{ scale: 0.98 }}
    disabled={loading}
    className={`btn-primary relative overflow-hidden ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
    {...props}
  >
    {loading && (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="absolute left-4 top-1/2 -translate-y-1/2"
      >
        <Loader2 size={16} className="text-white" />
      </motion.div>
    )}
    
    <motion.span
      animate={{ opacity: loading ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.span>
  </motion.button>
);

export default Loader;
