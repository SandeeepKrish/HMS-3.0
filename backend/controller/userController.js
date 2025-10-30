// controllers/userController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import { createError } from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";

/* -------------------- patient register -------------------- */
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    did,
    dob,
    gender,
    password,
    role: roleFromBody,
  } = req.body || {};

  const role = roleFromBody || "Patient";

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    did === undefined ||
    did === null ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(createError("Please Fill Full Form!", 400));
  }

  if (!/^\d{10}$/.test(String(phone))) {
    return next(createError("Phone Number Must Contain Exactly 10 Digits!", 400));
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return next(createError("Provide A Valid Email!", 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(createError("Email already registered", 400));

  // create user (schema pre-save will hash password once)
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    did,
    dob,
    gender,
    password,
    role,
  });

  generateToken(user, "Registered Successfully", 201, res);
});

/* -------------------- login -------------------- */
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return next(createError("Please Fill Full Form!", 400));
  }

  // find user and include password field
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(createError("Invalid Email Or Password!", 400));

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) return next(createError("Invalid Email Or Password!", 400));

  if (role && role !== user.role) return next(createError(`User Not Found With This Role!`, 400));

  generateToken(user, "Login Successfully!", 200, res);
});

/* -------------------- add new admin (bootstrap) -------------------- */
/*
 - If no admin exists (adminCount === 0) => allow creating first admin without token.
 - If admin exists => require Admin token (Authorization header preferred, else adminToken cookie).
*/
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const adminCount = await User.countDocuments({ role: "Admin" });

  if (adminCount > 0) {
    // Prefer Authorization header first
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.cookies?.adminToken || req.cookies?.patientToken || req.cookies?.doctorToken;
    }

    if (!token) return next(createError("Admin authentication required to add new admin.", 401));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return next(createError("Invalid or expired token.", 401));
    }

    const requestingUser = await User.findById(decoded.id);
    if (!requestingUser || requestingUser.role !== "Admin") {
      return next(createError(`${requestingUser?.role || "User"} not allowed to access this resource!`, 403));
    }
  }

  const { firstName, lastName, email, phone, Aid, dob, gender, password } = req.body || {};

  if (!firstName || !lastName || !email || !phone || (Aid === undefined || Aid === null) || !dob || !gender || !password) {
    return next(createError("Please Fill Full Form!", 400));
  }

  if (!/^\d{10}$/.test(String(phone))) {
    return next(createError("Phone Number Must Contain Exactly 10 Digits!", 400));
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return next(createError("Provide A Valid Email!", 400));
  }

  const existing = await User.findOne({ email });
  if (existing) return next(createError("Email already registered", 400));

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    did: String(Aid),
    dob,
    gender,
    password,
    role: "Admin",
  });

  generateToken(user, "Admin created successfully", 201, res);
});

/* -------------------- add new doctor (admin only route via isAdminAuthenticated) -------------------- */
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(createError("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(createError("File Format Not Supported!", 400));
  }

  const { firstName, lastName, email, phone, did, dob, gender, password, doctorDepartment } = req.body || {};
  if (!firstName || !lastName || !email || !phone || !did || !dob || !gender || !password || !doctorDepartment || !docAvatar) {
    return next(createError("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) return next(createError("Doctor With This Email Already Exists!", 400));

  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
    return next(createError("Failed To Upload Doctor Avatar To Cloudinary", 500));
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    did,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

/* -------------------- other helpers (unchanged) -------------------- */
export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.params.id;
  const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });
  if (!doctor) return next(createError("Doctor Not Found!", 404));
  if (doctor.docAvatar?.public_id) await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
  await doctor.deleteOne();
  res.status(200).json({ success: true, message: "Doctor Deleted Successfully!" });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({ success: true, doctors });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, user });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res.status(201).cookie("adminToken", "", { httpOnly: true, expires: new Date(Date.now()) }).json({ success: true, message: "Admin Logged Out Successfully." });
});
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res.status(201).cookie("patientToken", "", { httpOnly: true, expires: new Date(Date.now()) }).json({ success: true, message: "User Logged Out Successfully." });
});
export const logoutDoctor = catchAsyncErrors(async (req, res, next) => {
  res.status(201).cookie("doctorToken", "", { httpOnly: true, expires: new Date(Date.now()) }).json({ success: true, message: "Doctor Logged Out Successfully." });
});

export const getDoctorProfile = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findById(req.user._id);
  if (!doctor || doctor.role !== "Doctor") return next(createError("Access Denied. Doctor Only Area.", 403));
  res.status(200).json({ success: true, doctor });
});
