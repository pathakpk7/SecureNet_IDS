import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminBanner.css';

const AdminBanner = () => {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-banner">
      <span className="admin-banner-icon"></span>
      <span className="admin-banner-text">ADMIN MODE ACTIVE</span>
    </div>
  );
};

export default AdminBanner;
