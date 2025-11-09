// frontend/src/pages/Register.jsx
import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../lib/api"; // unified api wrapper

const Register = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [did, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");

  const navigateTo = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phone || !password) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payload = { firstName, lastName, email, phone, did, dob, gender, password };

      const { data } = await api.post("/user/patient/register", payload, {
        withCredentials: true,
      });

      // toast first (user sees feedback)
      toast.success(data.message || "Registered successfully");

      // store token if present
      if (data?.token) {
        localStorage.setItem("patientToken", data.token);
      }

      if (data?.user) {
        setUser?.(data.user);
      }

      setIsAuthenticated(true);
      navigateTo("/");

      // clear
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setNic("");
      setDob("");
      setGender("");
      setPassword("");
    } catch (error) {
      console.error("register error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed, please try again";
      toast.error(msg);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="container form-component register-form">
      <h2>Sign Up</h2>
      <p>Please Sign Up To Continue</p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat culpa
        voluptas expedita itaque ex, totam ad quod error?
      </p>
      <form onSubmit={handleRegistration}>
        <div>
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="number" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <input type="number" placeholder="Eid" value={did} onChange={(e) => setNic(e.target.value)} />
          <input type={"date"} placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>
        <div>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ gap: "10px", justifyContent: "flex-end", flexDirection: "row" }}>
          <p style={{ marginBottom: 0 }}>Already Registered?</p>
          <Link to={"/login"} style={{ textDecoration: "none", color: "#271776ca" }}>Login Now</Link>
        </div>
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
