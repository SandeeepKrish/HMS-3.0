// frontend/src/main.jsx
import React, { createContext, useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * Context shape:
 * - isAuthenticated: boolean
 * - setIsAuthenticated: fn
 * - user: object
 * - setUser: fn
 */
export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: {},
  setUser: () => {},
});

const AppWrapper = () => {
  // Initialize auth from any stored token (optimistic UI).
  // If you use cookies (httpOnly) instead of tokens, this will be false
  // and App.jsx will call the backend to confirm session.
  const hasPatientToken = Boolean(localStorage.getItem("patientToken"));
  const hasAdminToken = Boolean(localStorage.getItem("adminToken"));
  const hasDoctorToken = Boolean(localStorage.getItem("doctorToken"));

  const [isAuthenticated, setIsAuthenticated] = useState(
    hasPatientToken || hasAdminToken || hasDoctorToken || false
  );

  const [user, setUser] = useState({});

  // useMemo to avoid re-creating the context object on every render
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      user,
      setUser,
    }),
    [isAuthenticated, user]
  );

  return (
    <Context.Provider value={contextValue}>
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
