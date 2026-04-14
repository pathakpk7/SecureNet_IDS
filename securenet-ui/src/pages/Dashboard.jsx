import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminDashboard />;
  else return <UserDashboard />;
};

export default Dashboard;
