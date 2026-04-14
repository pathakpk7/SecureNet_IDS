import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminNetworkMonitor from './AdminNetworkMonitor';
import UserNetworkMonitor from './UserNetworkMonitor';

const NetworkMonitor = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminNetworkMonitor />;
  else return <UserNetworkMonitor />;
};

export default NetworkMonitor;
