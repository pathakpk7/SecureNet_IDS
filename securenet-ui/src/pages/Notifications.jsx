import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminNotifications from './AdminNotifications';
import UserNotifications from './UserNotifications';
import '../styles/pages/notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminNotifications />;
  else return <UserNotifications />;
};

export default Notifications;
