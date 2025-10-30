// app.js
import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
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

// Helpful debug: show that env loaded (remove in production)
console.log("Loaded ENV file:", envPath);
console.log("NODE ENV:", process.env.DEV_MODE || process.env.NODE_ENV);
console.log("FRONTEND_URL_ONE:", process.env.FRONTEND_URL_ONE);
console.log("FRONTEND_URL_TWO:", process.env.FRONTEND_URL_TWO);

// Build allowed origins array from env vars (skip empty values)
const allowedOrigins = [
  process.env.FRONTEND_URL_ONE,
  process.env.FRONTEND_URL_TWO,
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools like Postman (origin == undefined)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

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
