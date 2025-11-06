// dashboard/src/components/Login.jsx
import React, { useContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main"; // adjust path if main is elsewhere
import api from "../lib/api"; // axios wrapper created earlier
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");

  const [showPassword, setShowPassword] = useState(false);

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  // Clear tokens on load (optional)
  useEffect(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("patientToken");
  }, []);

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // use the api instance (baseURL already has /api/v1)
      const res = await api.post("/user/login", {
        email,
        password,  
        role,
      });

      const data = res.data;
      toast.success(data.message || "Login successful");
      setIsAuthenticated(true);

      // Save token & navigate based on role
      if (role === "Doctor") {
        if (data.token) localStorage.setItem("doctorToken", data.token);
        navigateTo("/doctor/profile");
      } else if (role === "Admin") {
        if (data.token) localStorage.setItem("adminToken", data.token);
        navigateTo("/");
      } else {
        if (data.token) localStorage.setItem("patientToken", data.token);
        navigateTo("/");
      }

      // clear fields
      setEmail("");
      setPassword("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check console for details.";
      toast.error(msg);
      console.error("Login error:", err);
    }
  };

  // Redirect if already logged in
  if (isAuthenticated) {
    if (localStorage.getItem("doctorToken")) {
      return <Navigate to="/doctor/profile" />;
    } else if (localStorage.getItem("adminToken")) {
      return <Navigate to="/" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  return (
    <section className="container form-component">
      <img src="/lifelogo.jpg" alt="logo" className="logolife" />
      <h1 className="form-title">Welcome TO Life Line Medical College</h1>
      <p>Only Admins and Doctors Are Allowed To Access These Resources!</p>

      <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
        <label>
          <input
            type="radio"
            value="Admin"
            checked={role === "Admin"}
            onChange={() => setRole("Admin")}
          />{" "}
          Admin
        </label>
        <label>
          <input
            type="radio"
            value="Doctor"
            checked={role === "Doctor"}
            onChange={() => setRole("Doctor")}
          />{" "}
          Doctor
        </label>
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <span
            onClick={togglePasswordVisibility}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </section>
  );
};

export default Login;
