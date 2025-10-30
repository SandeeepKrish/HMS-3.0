// controllers/appointmentController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { createError } from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

// Allow Doctor, Patient, Admin to book appointments
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    pid, // numeric patient identifier from UI (optional if patient is logged in)
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;

  // Basic presence checks (pid may be provided by Admin; logged-in Patient's DID will be used)
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    (!pid && !req.user) || // require pid OR an authenticated user
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(createError("Please Fill Full Form!", 400));
  }

  // Find doctor by name + department
  const doctor = await User.findOne({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(createError("Doctor not found", 404));
  }

  // Determine patientId as a NUMBER:
  // - If logged-in Patient or Doctor use req.user.did (user DID stored as Number)
  // - If Admin creating appointment use pid provided in body (coerce to Number)
  let patientId = null;

  if (req.user && req.user.role === "Patient") {
    // ensure req.user.did exists and is numeric
    if (req.user.did === undefined || req.user.did === null) {
      return next(createError("Logged-in patient does not have a numeric DID.", 400));
    }
    patientId = Number(req.user.did);
  } else if (req.user && req.user.role === "Doctor") {
    // If a doctor is creating an appointment, you might still want to link to a numeric pid
    // Use the supplied pid from body if present
    patientId = pid ? Number(pid) : null;
  } else if (req.user && req.user.role === "Admin") {
    // Admin must supply pid in the form (numeric)
    if (!pid) return next(createError("PID is required when admin creates appointment.", 400));
    patientId = Number(pid);
  } else {
    // If there is no authenticated user (public booking) accept pid from body
    patientId = pid ? Number(pid) : null;
  }

  if (patientId !== null && Number.isNaN(patientId)) {
    return next(createError("PID must be a valid number.", 400));
  }

  // Create appointment — appointmentSchema expects `pid` (Number) and `patientId` (Number)
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    pid: Number(pid), // keep pid numeric for record (may be duplicate of patientId)
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited: Boolean(hasVisited),
    address,
    doctorId: doctor._id, // ObjectId referencing doctor
    patientId, // numeric patient identifier
  });

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent!",
  });
});

// ... (other functions unchanged)
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id;
  if (!doctorId) {
    return next(createError("Doctor ID not found", 400));
  }
  const appointments = await Appointment.find({ doctorId });
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(createError("Appointment not found!", 404));
  }
  appointment = await Appointment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Appointment Status Updated!",
    appointment,
  });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(createError("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
