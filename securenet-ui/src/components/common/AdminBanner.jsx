import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminBanner.css';

const AdminBanner = () => {
  const { user } = useAuth();

  // Banner removed per request
  return null;
};

export default AdminBanner;
