// dashboard/src/components/Doctors.jsx
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import api from "../lib/api";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/user/doctors", { withCredentials: true });
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error("fetchDoctors error:", error);
        toast.error(error?.response?.data?.message || "Failed to load doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    try {
      console.log("Deleting doctor with ID:", id);
      await api.delete(`/user/admin/doctor/${id}`, { withCredentials: true });
      toast.success("Doctor deleted successfully");
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((element) => {
            return (
              <div className="card" key={element._id}>
                <img
                  src={element.docAvatar && element.docAvatar.url}
                  alt="doctor avatar"
                />
                <h4>{`${element.firstName} ${element.lastName}`}</h4>
                <div className="details">
                  <p>
                    Email: <span>{element.email}</span>
                  </p>
                  <p>
                    Phone: <span>{element.phone}</span>
                  </p>
                  <p>
                    DOB: <span>{element.dob.substring(0, 10)}</span>
                  </p>
                  <p>
                    Department: <span>{element.doctorDepartment}</span>
                  </p>
                  <p>
                    Did: <span>{element.did}</span>
                  </p>
                  <p>
                    Gender: <span>{element.gender}</span>
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(element._id)}
                >
                  Delete
                </button>
              </div>
            );
          })
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>
    </section>
  );
};

export default Doctors;
