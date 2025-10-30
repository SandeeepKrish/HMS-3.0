import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

// ✅ Read from .env (defined in frontend/.env)
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "/dashboard";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4001";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/v1/user/patient/logout`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setIsAuthenticated(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const navigateTo = useNavigate();

  const goToLogin = () => {
    navigateTo("/login");
  };

  return (
    <>
      <nav className={"container"}>
        <div className="logo">
          <img src="/lifelogo.jpg" alt="logo" className="logo-img" />
        </div>

        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>
            <Link to={"/appointment"} onClick={() => setShow(!show)}>
              Appointment
            </Link>
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </Link>
          </div>

          {/* Button Group (Dashboard + Login/Logout) */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* ✅ Dynamic Dashboard URL */}
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

            {/* Auth Button */}
            {isAuthenticated ? (
              <button className="logoutBtn btn" onClick={handleLogout}>
                LOGOUT
              </button>
            ) : (
              <button className="loginBtn btn" onClick={goToLogin}>
                LOGIN
              </button>
            )}
          </div>
        </div>

        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
