import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import AdminAIInsights from '../components/analysis/AdminAIInsights';
import UserAIInsights from '../components/analysis/UserAIInsights';
import '../styles/pages/analysis.css';

const AIInsights = () => {
  const { can } = usePermissions();

  if (can('view_admin_insights')) {
    return <AdminAIInsights />;
  }

  return <UserAIInsights />;
};

export default AIInsights;
