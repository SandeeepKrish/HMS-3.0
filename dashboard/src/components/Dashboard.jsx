import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated, admin } = useContext(Context);

  useEffect(() => {
    const fetchAppointmentsAndDoctors = async () => {
      try {
        const [appointmentRes, doctorRes] = await Promise.all([
          axios.get("http://localhost:4001/api/v1/appointment/getall", {
            withCredentials: true,
          }),
          axios.get("http://localhost:4001/api/v1/user/doctors", {
            withCredentials: true,
          }),
        ]);

        setAppointments(appointmentRes.data.appointments);
        setDoctors(doctorRes.data.doctors);
      } catch (error) {
        setAppointments([]);
        setDoctors([]);
        toast.error("Failed to fetch data");
      }
    };

    fetchAppointmentsAndDoctors();
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
    const logoWidth = 50;
    const logoHeight = 40;
    const logoX = (pageWidth - logoWidth) / 2;

    doc.addImage(logo, "JPEG", logoX, 10, logoWidth, logoHeight);

    doc.setFontSize(18);
    doc.text("Life Line Medical College", pageWidth / 2, 60, { align: "center" });

    const leftX = 20;
    const rightX = pageWidth - 80;

    doc.setFontSize(12);
    doc.text(`Doctor: ${appointment.doctor.firstName} ${appointment.doctor.lastName}`, rightX, 80);
    doc.text(`Dept: ${appointment.department}`, rightX, 90);

    doc.text(`Date of Issue: ${currentDate}`, leftX, 80);
    doc.text(`Patient Name: ${appointment.firstName} ${appointment.lastName}`, leftX, 90);
    doc.text(`Appointment Date: ${appointment.appointment_date.substring(0, 10)}`, leftX, 100);

    doc.setFontSize(14);
    doc.text("", leftX, 120);

    doc.setFontSize(12);
    doc.text("Consultation fee : Rs:100 ", leftX, 130);
    doc.line(leftX, 135, pageWidth - 20, 135);

    doc.setFontSize(14);
    doc.text("Case Study", leftX, 145);

    doc.setFontSize(12);
    doc.text("Doctor's Signature", pageWidth - 60, 280);

    doc.save(`${appointment.firstName}_Appointment.pdf`);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:4001/api/v1/appointment/update/${appointmentId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      setAppointments((prevAppointments) =>
        prevAppointments.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );

      toast.success("Status updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // ✅ Razorpay payment handler
  const handlePayment = async (appointment) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4001/api/v1/payment/create-order",
        {},
        { withCredentials: true }
      );

      const options = {
        key: "RAZORPAY_KEY_ID", // 🔁 Replace this with your actual Razorpay Key ID
        amount: data.order.amount,
        currency: "INR",
        name: "Life Line Hospital",
        description: "Doctor Consultation Fee",
        image: `${window.location.origin}/lifelogo.jpg`,
        order_id: data.order.id,
        handler: function (response) {
          toast.success("Payment Successful!");
          // Optional: You can update appointment payment status here
        },
        prefill: {
          name: `${appointment.firstName} ${appointment.lastName}`,
          email: appointment.email || "test@example.com",
          contact: appointment.phone || "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment Failed!");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="docImg" />
          <div className="content">
            <div>
              <p>Hello ,</p>
              <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
            </div>
            <p>A patient is the most important visitor in our premises.</p>
          </div>
        </div>
        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{appointments.length}</h3>
        </div>
        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{doctors.length}</h3>
        </div>
      </div>

      <div className="banner">
        <h5>Appointments</h5>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
              <th>PDF</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                  <td>{appointment.appointment_date.substring(0, 16)}</td>
                  <td>{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</td>
                  <td>{appointment.department}</td>
                  <td>
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pending" className="value-pending">
                        Pending
                      </option>
                      <option value="Accepted" className="value-accepted">
                        Accepted
                      </option>
                      <option value="Rejected" className="value-rejected">
                        Rejected
                      </option>
                    </select>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                  <td>
                    <button onClick={() => generatePDF(appointment)}>
                      Download
                    </button>
                  </td>
                  <td>
                    <button onClick={() => handlePayment(appointment)}>
                      Pay
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No Appointments Found!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
