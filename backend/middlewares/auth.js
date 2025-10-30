// middlewares/auth.js
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import { createError } from "./error.js";
import jwt from "jsonwebtoken";

// Universal Authentication Middleware
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // Authorization header preferred
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = req.cookies?.adminToken || req.cookies?.patientToken || req.cookies?.doctorToken;
  }

  if (!token) {
    return next(createError("User is not authenticated!", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(createError("Invalid or expired token.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(createError("User not found!", 404));
  }

  req.user = user;
  next();
});

// Role-based Authorization
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(`${req.user?.role || "User"} not allowed to access this resource!`, 403));
    }
    next();
  };
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") return next();
  return res.status(403).json({ success: false, message: "Access denied. Admins only." });
};

// Convenience arrays
export const isAdminAuthenticated = [isAuthenticated, isAuthorized("Admin")];
export const isPatientAuthenticated = [isAuthenticated, isAuthorized("Patient")];
export const isDoctorAuthenticated = [isAuthenticated, isAuthorized("Doctor")];
