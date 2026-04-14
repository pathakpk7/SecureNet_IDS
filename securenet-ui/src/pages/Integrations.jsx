import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminIntegrations from './AdminIntegrations';
import UserIntegrations from './UserIntegrations';

const Integrations = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminIntegrations />;
  else return <UserIntegrations />;
};

export default Integrations;
