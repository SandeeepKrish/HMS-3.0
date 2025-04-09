import express from "express";
import { createOrder } from "../controller/paymentController.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", createOrder);

export default router;
