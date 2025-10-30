// router/userRouter.js
import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  getDoctorProfile,
  login,
  logoutAdmin,
  logoutPatient,
  logoutDoctor,
  patientRegister,
  deleteDoctor,
} from "../controller/userController.js";

import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isDoctorAuthenticated,
  isAuthenticated,
  isAdmin,
} from "../middlewares/auth.js";

import { getAllAppointments } from "../controller/appointmentController.js";

const router = express.Router();

// Public
router.post("/patient/register", patientRegister);
router.post("/login", login);

// Admin (bootstrap handled in controller)
router.post("/admin/addnew", addNewAdmin);

// Doctor add is admin-only
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// Admin-only routes
router.delete("/admin/doctor/:id", isAdminAuthenticated, deleteDoctor);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

// other routes
router.get("/appointment/getall", isAuthenticated, isAdmin, getAllAppointments);
router.get("/doctor/me", isDoctorAuthenticated, getDoctorProfile);
router.get("/doctor/logout", isDoctorAuthenticated, logoutDoctor);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/doctors", getAllDoctors);

export default router;
