// backend/app.js
import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";

import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import pdfRouter from "./router/pdfRouter.js";
import paymentRouter from "./router/paymentRouter.js";

import { errorMiddleware } from "./middlewares/error.js";

const app = express();

// ===================== ENV SETUP =====================
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

console.log("Loaded ENV file:", envPath);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONTEND_URL_ONE:", process.env.FRONTEND_URL_ONE);
console.log("FRONTEND_URL_TWO:", process.env.FRONTEND_URL_TWO);

// ===================== FRONTEND ORIGINS =====================
const normalize = (url) => {
  if (!url) return url;
  try {
    return url.replace(/\/+$/, ""); // remove trailing slashes
  } catch {
    return url;
  }
};

// Fallbacks if environment variables missing
const FALLBACK_FRONTEND_URL_ONE = "https://hmsfjmu.netlify.app";
const FALLBACK_FRONTEND_URL_TWO = "https://hmsjm.netlify.app";

const allowedOrigins = [
  normalize(process.env.FRONTEND_URL_ONE || FALLBACK_FRONTEND_URL_ONE),
  normalize(process.env.FRONTEND_URL_TWO || FALLBACK_FRONTEND_URL_TWO),
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

console.log("Allowed Origins (normalized):", allowedOrigins);

// ===================== CORS CONFIG =====================
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser tools (curl, Postman) which send no Origin
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true, // allow cookies
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["set-cookie"],
  })
);

// Always respond to OPTIONS preflight quickly
app.options("*", cors());

// ===================== BASIC HEALTH ROUTE =====================
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ===================== CORE MIDDLEWARES =====================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ===================== ROUTES =====================
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/pdf", pdfRouter);
app.use("/api/v1/payment", paymentRouter);

// ===================== ERROR HANDLER =====================
app.use(errorMiddleware);

// ===================== DATABASE CONNECTION =====================
dbConnection();

export default app;
