// dashboard/src/components/DoctorAppointments.jsx
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");

    const fetchDoctorData = async () => {
      try {
        const res = await api.get("/user/doctor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data.doctor);
      } catch (error) {
        console.error("fetchDoctorData error:", error);
        toast.error("Failed to fetch doctor profile");
      }
    };

    const fetchDoctorAppointments = async () => {
      try {
        const res = await api.get("/appointment/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.appointments || []);
      } catch (error) {
        console.error("fetchDoctorAppointments error:", error);
        toast.error("Failed to fetch doctor appointments");
      }
    };

    fetchDoctorData();
    fetchDoctorAppointments();
  }, []);

  const toBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async (appointment) => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    const logo = await toBase64(`${window.location.origin}/lifelogo.jpg`);
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoX = (pageWidth - 50) / 2;

    doc.addImage(logo, "JPEG", logoX, 10, 50, 40);
    doc.setFontSize(18);
    doc.text("Life Line Medical College", pageWidth / 2, 60, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Doctor: ${appointment.doctor.firstName} ${appointment.doctor.lastName}`, 140, 80);
    doc.text(`Dept: ${appointment.department}`, 140, 90);

    doc.text(`Date of Issue: ${currentDate}`, 20, 80);
    doc.text(`Patient Name: ${appointment.firstName} ${appointment.lastName}`, 20, 90);
    doc.text(`Appointment Date: ${appointment.appointment_date.substring(0, 10)}`, 20, 100);

    doc.text("Consultation fee : Rs:100 ", 20, 130);
    doc.line(20, 135, pageWidth - 20, 135);
    doc.text("Case Study", 20, 145);
    doc.text("Doctor's Signature", pageWidth - 60, 280);

    doc.save(`${appointment.firstName}_Appointment.pdf`);
  };

  const handleLogout = async () => {
    try {
      // If your backend supports a doctor logout route, you can call it here (optional)
      // await api.get("/user/doctor/logout", { headers: { Authorization: `Bearer ${localStorage.getItem("doctorToken")}` } });

      localStorage.removeItem("doctorToken");
      toast.success("Doctor logged out successfully!");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("doctor logout error:", error);
      toast.error("Logout failed. Try again.");
    }
  };

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src={doctor?.docAvatar?.url} alt="Doctor" />
          <div className="content">
            <div>
              <p>Hello,</p>
              <h5>{`${doctor?.firstName} ${doctor?.lastName}`}</h5>
            </div>
            <p>Your assigned appointments are listed below.</p>
          </div>
        </div>

        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{appointments.length}</h3>
        </div>
      </div>

      <div className="banner">
        <h5>Appointments</h5>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                  <td>{appointment.appointment_date.substring(0, 16)}</td>
                  <td>{appointment.department}</td>
                  <td>{appointment.status}</td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                  <td>
                    <button onClick={() => generatePDF(appointment)}>Download</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
    </section>
  );
};

export default DoctorAppointments;
