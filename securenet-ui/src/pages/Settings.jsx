import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminSettings from './AdminSettings';
import UserSettings from './UserSettings';
import '../styles/pages/settings.css';

const Settings = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminSettings />;
  else return <UserSettings />;
};

export default Settings;
