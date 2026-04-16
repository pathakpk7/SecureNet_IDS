import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";
import RealtimeLogs from "./pages/RealtimeLogs";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    document.body.className = user?.role || "user";
  }, [user]);

  return (
    <div className="App">
      <Routes>
        {/* All existing routes */}
        <Route path="/*" element={<AppRoutes />} />

        {/* New realtime route */}
        <Route path="/realtime-logs" element={<RealtimeLogs />} />
      </Routes>
    </div>
  );
}

export default App;