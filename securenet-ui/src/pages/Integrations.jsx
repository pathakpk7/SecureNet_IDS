import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminIntegrations from '../components/integrations/AdminIntegrations';
import UserIntegrations from '../components/integrations/UserIntegrations';
import '../styles/pages/settings.css';

const Integrations = () => {
  const { user } = useAuth();
  const role = user?.role || user?.user_metadata?.role || 'user';

  return role === 'admin' ? <AdminIntegrations /> : <UserIntegrations />;
};

export default Integrations;
