import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminLogs from './AdminLogs';
import UserLogs from './UserLogs';

const Logs = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminLogs />;
  else return <UserLogs />;
};

export default Logs;
