import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { createError } from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

// Send message
export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !phone || !message) {
    return next(createError("Please Fill Full Form!", 400));
  }

  await Message.create({ firstName, lastName, email, phone, message });

  res.status(200).json({
    success: true,
    message: "Message Sent!",
  });
});

// Get all messages
export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();

  res.status(200).json({
    success: true,
    messages,
  });
});

// Delete a message by ID
export const deleteMessage = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const message = await Message.findById(id);

  if (!message) {
    return next(createError("Message not found!", 404));
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: "Message Deleted Successfully!",
  });
});
