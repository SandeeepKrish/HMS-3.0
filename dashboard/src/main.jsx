import React, { createContext, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios"; // Make sure axios is installed
import App from "./App.jsx";

// Create context to manage authentication and admin state
export const Context = createContext({ isAuthenticated: false, admin: null });

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null); // null initially

  const fetchAdmin = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // Check for adminToken
      if (token) {
        const response = await axios.get("http://localhost:4001/api/v1/admin/data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Set admin data and authentication state
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchAdmin(); // Call fetchAdmin if adminToken exists
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    // Check on load if the user is authenticated and handle the redirection
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Context.Provider value={{ isAuthenticated, setIsAuthenticated, admin, setAdmin }}>
      <App />
    </Context.Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
