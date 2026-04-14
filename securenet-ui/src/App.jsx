import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    document.body.className = user?.role || "user";
  }, [user]);

  return (
    <div className="App">
      <AppRoutes />
    </div>
  );
}

export default App;
