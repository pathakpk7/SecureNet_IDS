import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminSimulation from '../components/simulation/AdminSimulation';
import UserSimulation from '../components/simulation/UserSimulation';
import '../styles/pages/simulation.css';

const Simulation = () => {
  const { user } = useAuth();
  const role = user?.role || user?.user_metadata?.role || 'user';

  return role === 'admin' ? <AdminSimulation /> : <UserSimulation />;
};

export default Simulation;
