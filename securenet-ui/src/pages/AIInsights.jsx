import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminAIInsights from './AdminAIInsights';
import UserAIInsights from './UserAIInsights';

const AIInsights = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminAIInsights />;
  else return <UserAIInsights />;
};

export default AIInsights;
