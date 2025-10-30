import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  getDoctorAppointments,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/auth.js"; // ✅ Use updated exports

const router = express.Router();

// Anyone logged in can attempt to post
router.post("/post", isAuthenticated, isAuthorized("Patient", "Doctor", "Admin"), postAppointment);

// Only admin can access all appointments and make updates
router.get("/getall", isAuthenticated, isAuthorized("Admin"), getAllAppointments);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateAppointmentStatus);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteAppointment);
// Get appointments for logged-in doctor
router.get("/doctor", isAuthenticated, isAuthorized("Doctor"), getDoctorAppointments);


export default router;
