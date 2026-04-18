import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";

function App() {
  const { user } = useAuth();

  useEffect(() => {
    document.body.className = user?.role || "user";
  }, [user]);

  return (
    <>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            {/* All existing routes */}
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </div>
      </ErrorBoundary>
      <Toaster position="top-right" />
    </>
  );
}

export default App;