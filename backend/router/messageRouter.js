import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js"; // ✅ Updated import
import {
  sendMessage,
  getAllMessages,
  deleteMessage,
} from "../controller/messageController.js";

const router = express.Router();

// Only authenticated users can send messages
router.post("/send", isAuthenticated, sendMessage);

// Only Admin can access all messages and delete them
router.get("/getall", isAuthenticated, isAuthorized("Admin"), getAllMessages);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteMessage);

export default router;
