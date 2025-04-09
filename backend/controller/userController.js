import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import { createError } from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, pid, dob, gender, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !pid || !dob || !gender || !password) {
    return next(createError("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered){
    return next(createError("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    pid,
    dob,
    gender,
    password,
    role: "Patient",
  });

  generateToken(user, "User Registered!", 200, res);

});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;

  if (!email || !password || !confirmPassword || !role) {
    return next(createError("Please Fill Full Form!", 400));
  }
  
  if (password !== confirmPassword) {
    return next(createError("Password & Confirm Password Do Not Match!", 400));
  }

  const user = await User.findOne({ email }).select("+password");//
  if (!user) {
    return next(createError("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(createError("Invalid Email Or Password!", 400));
  }

  if (role !== user.role) {
    return next(createError(`User Not Found With This Role!`, 400));
  }

  generateToken(user, "Login Successfully!", 201, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, Aid, dob, gender, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !Aid || !dob || !gender || !password) {
    return next(createError("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(createError("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    Aid,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(createError("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];

  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(createError("File Format Not Supported!", 400));
  }

  const { firstName, lastName, email, phone, did, dob, gender, password, doctorDepartment } = req.body;

  if (!firstName || !lastName || !email || !phone || !did || !dob || !gender || !password || !doctorDepartment || !docAvatar) {
    return next(createError("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(createError("Doctor With This Email Already Exists!", 400));
  }

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
export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.params.id;

  const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });

  if (!doctor) {
    return next(createError("Doctor Not Found!", 404));
  }

  // Remove avatar from Cloudinary if available
  if (doctor.docAvatar?.public_id) {
    await cloudinary.uploader.destroy(doctor.docAvatar.public_id);
  }

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: "Doctor Deleted Successfully!",
  });
});


export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
});

// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User Logged Out Successfully.",
    });
});
