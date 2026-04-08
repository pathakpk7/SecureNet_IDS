import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  TrendingUp,
  Users,
  Zap,
  Lock,
  Globe,
  Brain
} from 'lucide-react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  variant = 'default',
  hover = true,
  className = '',
  ...props 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass-card glass-card-hover';
      case 'neon':
        return 'neon-border';
      case 'success':
        return 'bg-safe/10 border-safe/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'danger':
        return 'bg-danger/10 border-danger/30';
      case 'info':
        return 'bg-info/10 border-info/30';
      default:
        return 'glass-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-neon-green';
      case 'warning':
        return 'text-neon-yellow';
      case 'danger':
        return 'text-neon-red';
      case 'info':
        return 'text-neon-blue';
      default:
        return 'text-neon-blue';
    }
  };

  return (
    <motion.div
      whileHover={hover ? { 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.3 }
      } : {}}
      className={`${getVariantClasses()} p-6 ${className}`}
      {...props}
    >
      {/* Header with Icon */}
      {(title || Icon) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`p-2 rounded-lg bg-white/10 ${getIconColor()}`}>
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-gray-300">
        {children}
      </div>
    </motion.div>
  );
};

// Predefined card components for common use cases
export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'info',
  trend = 'up',
  loading = false 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-safe/10',
          border: 'border-safe/30',
          text: 'text-neon-green',
          icon: 'bg-neon-green/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/30',
          text: 'text-neon-yellow',
          icon: 'bg-neon-yellow/20'
        };
      case 'danger':
        return {
          bg: 'bg-danger/10',
          border: 'border-danger/30',
          text: 'text-neon-red',
          icon: 'bg-neon-red/20'
        };
      default:
        return {
          bg: 'bg-info/10',
          border: 'border-info/30',
          text: 'text-neon-blue',
          icon: 'bg-neon-blue/20'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-6 relative overflow-hidden ${
        loading ? 'animate-pulse' : ''
      }`}
    >
      {/* Shimmer effect for loading state */}
      {loading && (
        <div className="absolute inset-0 shimmer"></div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.icon}`}>
          <Icon size={20} className={colors.text} />
        </div>
        
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${colors.text}`}>
            {trend === 'up' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingUp size={16} className="rotate-180" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-bold ${colors.text} neon-text`}>
            {loading ? '---' : value}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color = 'info',
  delay = 0 
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'text-neon-green';
      case 'warning':
        return 'text-neon-yellow';
      case 'danger':
        return 'text-neon-red';
      default:
        return 'text-neon-blue';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05, 
        transition: { duration: 0.3 }
      }}
      className="glass-card p-6 text-center cursor-pointer glass-card-hover"
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center ${getColorClasses()}`}>
        <Icon size={32} />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export const AlertCard = ({ 
  type, 
  message, 
  source, 
  timestamp, 
  severity = 'medium',
  onClick 
}) => {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-danger/10',
          border: 'border-danger',
          text: 'text-neon-red',
          icon: AlertTriangle,
          pulse: true
        };
      case 'low':
        return {
          bg: 'bg-safe/10',
          border: 'border-safe',
          text: 'text-neon-green',
          icon: Shield,
          pulse: false
        };
      default:
        return {
          bg: 'bg-warning/10',
          border: 'border-warning',
          text: 'text-neon-yellow',
          icon: AlertTriangle,
          pulse: true
        };
    }
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02, 
        x: 4,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      className={`glass-card p-4 border cursor-pointer transition-all duration-300 hover:bg-white/5 ${config.bg} ${config.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${config.text} ${
              config.pulse ? 'animate-pulse' : ''
            }`}></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {type}
            </span>
            <span className="text-xs text-gray-500">• {source}</span>
          </div>
          <p className="text-sm text-gray-300 mb-1">{message}</p>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        
        <div className={`p-2 rounded-lg ${config.text} ${config.text}/10`}>
          <Icon size={16} />
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
