// frontend/src/App.jsx
import React, { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Appointment from "./pages/Appointment.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./lib/api"; // <- use api wrapper, NOT axios
import { Context } from "./main";

const App = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);

// small change inside frontend/src/App.jsx (replace the useEffect body)
useEffect(() => {
  let mounted = true;

  const fetchUser = async () => {
    try {
      // If you rely solely on cookies (httpOnly), remove this short-circuit.
      const token = localStorage.getItem("patientToken") || localStorage.getItem("adminToken") || localStorage.getItem("doctorToken");
      if (!token) {
        // Still attempt if your auth uses cookies, otherwise skip to avoid 401 noise
        setIsAuthenticated(false);
        setUser({});
        return;
      }

      const response = await api.get("/user/patient/me", { withCredentials: true });

      if (!mounted) return;

      if (response?.data?.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        setIsAuthenticated(false);
        setUser({});
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser({});
    }
  };

  fetchUser();
  return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
