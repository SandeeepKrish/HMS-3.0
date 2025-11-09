// frontend/src/pages/Login.jsx
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../lib/api"; // using unified API wrapper

const Login = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const navigateTo = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleLogin = async (e) => {
    e.preventDefault();

    // login needs only email + password
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    try {
      const { data } = await api.post(
        "/user/login",
        { email, password, role: "Patient" },
        { withCredentials: true }
      );

      // store token if backend returns it (optional)
      if (data?.token) {
        localStorage.setItem("patientToken", data.token);
      }

      // update user in context if provided
      if (data?.user) {
        setUser?.(data.user);
      }

      setIsAuthenticated(true);

      // toast after success
      toast.success(data.message || "Login successful");

      // go to home
      navigateTo("/");
      // clear local inputs
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Try again.";
      toast.error(msg);
      // ensure we don't incorrectly mark authenticated
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="container form-component login-form">
      <h2>Sign In</h2>
      <p>Please login to continue</p>
      <p>

        A patient is the most important visitor in our premises.
      </p>

      <form onSubmit={handleLogin}>
        {/* Email */}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input with Toggle */}
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

        <div
          style={{
            gap: "10px",
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <p style={{ marginBottom: 0 }}>Not Registered?</p>
          <Link to={"/register"} style={{ textDecoration: "none", color: "#271776ca" }}>
            Register Now
          </Link>
        </div>

        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
