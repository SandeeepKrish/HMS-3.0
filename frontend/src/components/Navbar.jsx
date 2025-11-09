// frontend/src/components/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import api from "../lib/api";
import { toast } from "react-toastify";
import { Context } from "../main";

const DASHBOARD_URL =
  (import.meta.env.VITE_DASHBOARD_URL && import.meta.env.VITE_DASHBOARD_URL.replace(/\/$/, "")) ||
  (location && location.hostname === "localhost" ? "http://localhost:5174" : "https://hmsjm.netlify.app");

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
  const [checking, setChecking] = useState(true); // avoid flash
  const navigateTo = useNavigate();

  // Validate token / session on mount so navbar reflects true status
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      setChecking(true);
      try {
        // If you've stored a token in localStorage (patientToken/adminToken/doctorToken),
        // api interceptor will attach it. We call backend to confirm session.
        const res = await api.get("/user/patient/me", { withCredentials: true });
        if (!mounted) return;
        if (res?.data?.user) {
          setUser?.(res.data.user);
          setIsAuthenticated(true);
        } else {
          // fallback: if backend didn't return user, still try check other endpoints
          setIsAuthenticated(false);
          setUser?.({});
        }
      } catch (err) {
        // Not authenticated or token expired
        setIsAuthenticated(false);
        setUser?.({});
      } finally {
        if (mounted) setChecking(false);
      }
    };

    // Only call checkAuth if some token or cookies exist (avoid unnecessary call)
    const token =
      localStorage.getItem("patientToken") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("doctorToken");

    if (token) {
      checkAuth();
    } else {
      // If no token, we may still call health or skip
      setIsAuthenticated(false);
      setUser?.({});
      setChecking(false);
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handleLogout = async () => {
    try {
      // Try patient logout; fallback to generic logout routes if needed.
      try {
        await api.get("/user/patient/logout", { withCredentials: true });
      } catch (e1) {
        try {
          await api.get("/user/logout", { withCredentials: true });
        } catch (e2) {
          // ignore - still clear local state
        }
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // Clear any saved tokens & user state
      localStorage.removeItem("adminToken");
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("patientToken");
      setIsAuthenticated(false);
      setUser?.({});
      toast.success("Logged out");
      navigateTo("/login");
    }
  };

  const goToLogin = () => navigateTo("/login");

  // optionally show nothing while checking to avoid flicker
  // but keep a minimal nav visible to avoid layout jump
  return (
    <nav className={"container"}>
      <div className="logo">
        <img src="/lifelogo.jpg" alt="logo" className="logo-img" />
      </div>

      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          <Link to={"/"} onClick={() => setShow(!show)}>Home</Link>
          <Link to={"/appointment"} onClick={() => setShow(!show)}>Appointment</Link>
          <Link to={"/about"} onClick={() => setShow(!show)}>About Us</Link>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Dashboard
          </a>

          {/* show login/logout depending on auth state */}
          {isAuthenticated ? (
            <button className="logoutBtn btn" onClick={handleLogout}>LOGOUT</button>
          ) : (
            <button className="loginBtn btn" onClick={goToLogin}>LOGIN</button>
          )}
        </div>
      </div>

      <div className="hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Navbar;
