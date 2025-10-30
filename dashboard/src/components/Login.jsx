import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
// Import the icons you want to use for the eye toggle
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Admin");

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for confirm password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  // ... (Your existing useEffect and handleLogin logic remains the same)

  // Toggle functions
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // ✅ Clear old tokens on load
  useEffect(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("patientToken");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4001/api/v1/user/login",
        { email, password, confirmPassword, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message);
      setIsAuthenticated(true);

      // ✅ Save token & navigate based on role
      if (role === "Doctor") {
        localStorage.setItem("doctorToken", data.token);
        navigateTo("/doctor/profile");
      } else if (role === "Admin") {
        localStorage.setItem("adminToken", data.token);
        navigateTo("/");
      } else if (role === "Patient") {
        localStorage.setItem("patientToken", data.token);
        navigateTo("/"); // Customize if needed
      }

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  // ✅ Redirect if already logged in based on token
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

      {/* Role selection */}
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
        
        {/* Password Input with Toggle */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"} // Dynamic type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", paddingRight: "40px" }} // Make space for the icon
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
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Dynamic Icon */}
          </span>
        </div>

        {/* Confirm Password Input with Toggle */}
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"} // Dynamic type
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", paddingRight: "40px" }} // Make space for the icon
          />
          <span
            onClick={toggleConfirmPasswordVisibility}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />} {/* Dynamic Icon */}
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