import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import AdminView from '../components/notifications/AdminView';
import UserView from '../components/notifications/UserView';
import '../styles/pages/notifications.css';

export default function Notifications() {
  const { can } = usePermissions();

  return can("VIEW_ADVANCED_ANALYTICS") ? <AdminView /> : <UserView />;
}
