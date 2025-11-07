// backend/app.js
import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import pdfRouter from "./router/pdfRouter.js";
import paymentRouter from "./router/paymentRouter.js";

import { errorMiddleware } from "./middlewares/error.js";

const app = express();

// Load environment variables from backend/.env (use process.cwd() so it's stable)
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Helpful debug: show that env loaded (remove or reduce in production)
console.log("Loaded ENV file:", envPath);
console.log("NODE ENV:", process.env.DEV_MODE || process.env.NODE_ENV);
console.log("FRONTEND_URL_ONE (env):", process.env.FRONTEND_URL_ONE);
console.log("FRONTEND_URL_TWO (env):", process.env.FRONTEND_URL_TWO);

// FALLBACK values — your deployed Netlify sites.
// These are only fallbacks; preferred is to set the env vars on Render.
const FALLBACK_FRONTEND_URL_ONE = "https://hmsfjmu.netlify.app";
const FALLBACK_FRONTEND_URL_TWO = "https://hmsjm.netlify.app";

const allowedOrigins = [
  process.env.FRONTEND_URL_ONE || FALLBACK_FRONTEND_URL_ONE,
  process.env.FRONTEND_URL_TWO || FALLBACK_FRONTEND_URL_TWO,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// Strict CORS middleware that handles preflight and sets proper headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow non-browser tools (curl, Postman)
  if (!origin) {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    // echo the origin back (cannot use '*' when credentials are true)
    res.setHeader("Access-Control-Allow-Origin", origin);
    // Tell caches to vary by Origin
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );

    // Preflight: respond quickly
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
  } else {
    console.error("Blocked by CORS:", origin);
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  next();
});

// Basic health route (useful to test that the service is reachable)
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// standard middleware / parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/pdf", pdfRouter);
app.use("/api/v1/payment", paymentRouter);

// Error Handling Middleware
app.use(errorMiddleware);

// Database
dbConnection();

export default app;
