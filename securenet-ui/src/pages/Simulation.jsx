import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminSimulation from './AdminSimulation';
import UserSimulation from './UserSimulation';
import '../styles/pages/simulation.css';

const Simulation = () => {
  const { user } = useAuth();
  
  if (user?.role === "admin") return <AdminSimulation />;
  else return <UserSimulation />;
};

export default Simulation;
