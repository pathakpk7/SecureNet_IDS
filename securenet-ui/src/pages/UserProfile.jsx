import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminProfile from './AdminProfile';
import UserOnlyProfile from './UserOnlyProfile';
import '../styles/pages/profile.css';

const UserProfile = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminProfile />;
  else return <UserOnlyProfile />;
};

export default UserProfile;
