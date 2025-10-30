import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import AddNewAdmin from "./components/AddNewAdmin";
import Sidebar from "./components/Sidebar";
import DoctorAppointments from "./components/DoctorAppointments"; // ✅ New import
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const AppContent = () => {
  const location = useLocation();

  // ✅ Check if the logged-in user is a doctor
  const isDoctorLoggedIn = localStorage.getItem("doctorToken");

  // ✅ Determine whether to show Sidebar
  const showSidebar =
    location.pathname !== "/login" &&
    !(isDoctorLoggedIn && location.pathname === "/doctor/profile");

  return (
    <>
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctor/profile" element={<DoctorAppointments />} />
      </Routes>
      <ToastContainer position="top-center" />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
