import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  // Resolve effective user if state has not caught up with localStorage yet
  const effectiveUser = user || (() => {
    try {
      const stored = localStorage.getItem('demoUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (loading && !effectiveUser) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f1e', color: '#00f5ff', fontSize: '18px', fontWeight: 600 }}>
        Loading session...
      </div>
    );
  }

  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  // Strict role-based access control
  const userRole = (effectiveUser.role || effectiveUser.user_metadata?.role || 'user').toLowerCase();
  if (role && userRole !== role.toLowerCase()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
