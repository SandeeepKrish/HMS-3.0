// src/components/AppointmentForm.jsx
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pid, setPid] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");

  // Instead of storing names joined, store the selected doctor id and names separately
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");

  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
    "urology",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/user/doctors", {
          withCredentials: true,
        });
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // When department changes, clear selected doctor
  useEffect(() => {
    setSelectedDoctorId("");
    setDoctorFirstName("");
    setDoctorLastName("");
  }, [department]);

  // Called when user selects a doctor option (value is doctor._id)
  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctorId(doctorId || "");
    if (!doctorId) {
      setDoctorFirstName("");
      setDoctorLastName("");
      return;
    }
    const doc = doctors.find((d) => String(d._id) === String(doctorId));
    if (doc) {
      setDoctorFirstName(doc.firstName || "");
      setDoctorLastName(doc.lastName || "");
    } else {
      setDoctorFirstName("");
      setDoctorLastName("");
    }
  };

  const handleAppointment = async (e) => {
    e.preventDefault();

    try {
      // Basic client-side validation (you can expand)
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !phone ||
        !dob ||
        !gender ||
        !appointmentDate ||
        !department ||
        !doctorFirstName ||
        !doctorLastName ||
        !address.trim()
      ) {
        toast.error("Please fill all required fields.");
        return;
      }

      // Normalize values
      const hasVisitedBool = Boolean(hasVisited);
      const pidNumber = pid !== "" && pid !== null ? Number(pid) : null;
      const phoneString = String(phone);

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phoneString,
        pid: pidNumber,
        dob,
        gender,
        appointment_date: appointmentDate,
        department,
        // send doctor names (backend expects these two fields)
        doctor_firstName: doctorFirstName,
        doctor_lastName: doctorLastName,
        // optional: also send the doctorId so backend can find doctor quickly
        doctorId: selectedDoctorId || undefined,
        hasVisited: hasVisitedBool,
        address: address.trim(),
      };

      const { data } = await axios.post("http://localhost:4001/api/v1/appointment/post", payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      toast.success(data.message || "Appointment created");

      // reset
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPid("");
      setDob("");
      setGender("");
      setAppointmentDate("");
      setDepartment("Pediatrics");
      setSelectedDoctorId("");
      setDoctorFirstName("");
      setDoctorLastName("");
      setHasVisited(false);
      setAddress("");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Something went wrong";
      toast.error(msg);
      console.error("appointment error:", error);
    }
  };

  // Filter doctors by department for the select list
  const doctorsForDepartment = doctors.filter((d) => d.doctorDepartment === department);

  return (
    <div className="container form-component appointment-form">
      <h2>Appointment</h2>
      <form onSubmit={handleAppointment}>
        <div>
          <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div>
          <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="number" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <input type="number" placeholder="PID" value={pid} onChange={(e) => setPid(e.target.value)} />
          <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} />
        </div>

        <div>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input type="date" placeholder="Appointment Date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
            }}
          >
            {departmentsArray.map((depart, idx) => (
              <option value={depart} key={idx}>
                {depart}
              </option>
            ))}
          </select>

          <select
            value={selectedDoctorId}
            onChange={(e) => handleDoctorSelect(e.target.value)}
            disabled={!department || doctorsForDepartment.length === 0}
          >
            <option value="">Select Doctor</option>
            {doctorsForDepartment.map((doctor) => (
              <option value={doctor._id} key={doctor._id}>
                {doctor.firstName} {doctor.lastName}
              </option>
            ))}
          </select>
        </div>

        <textarea rows="10" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />

        <div style={{ gap: "10px", justifyContent: "flex-end", flexDirection: "row" }}>
          <p style={{ marginBottom: 0 }}>Have you visited before?</p>
          <input type="checkbox" checked={hasVisited} onChange={(e) => setHasVisited(e.target.checked)} style={{ flex: "none", width: "25px" }} />
        </div>

        <button style={{ margin: "0 auto" }}>GET APPOINTMENT</button>
      </form>
    </div>
  );
};

export default AppointmentForm;
