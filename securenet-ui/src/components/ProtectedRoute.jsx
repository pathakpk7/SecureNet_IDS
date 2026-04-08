import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ 
  children, 
  isAuthenticated = false, 
  requiredRole = null,
  redirectTo = '/login' 
}) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (requiredRole && requiredRole !== 'user' && requiredRole !== 'admin') {
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
