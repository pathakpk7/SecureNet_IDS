import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminAttackAnalysis from './AdminAttackAnalysis';
import UserAttackAnalysis from './UserAttackAnalysis';

const AttackAnalysis = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminAttackAnalysis />;
  else return <UserAttackAnalysis />;
};

export default AttackAnalysis;
