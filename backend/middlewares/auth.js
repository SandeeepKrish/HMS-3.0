// 

import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import { createError } from "./error.js";
import jwt from "jsonwebtoken";

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return next(createError("Dashboard User is not authenticated!", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);

  if (!req.user || req.user.role !== "Admin") {
    return next(createError(`${req.user?.role || "User"} not authorized for this resource!`, 403));
  }

  next();
});

// Middleware to authenticate frontend users
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.patientToken;
  if (!token) {
    return next(createError("User is not authenticated!", 400));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);

  if (!req.user || req.user.role !== "Patient") {
    return next(createError(`${req.user?.role || "User"} not authorized for this resource!`, 403));
  }

  next();
});

// Middleware for role-based authorization
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(`${req.user?.role || "User"} not allowed to access this resource!`, 403));
    }
    next();
  };
};
