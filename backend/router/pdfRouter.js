// backend/router/pdfRouter.js

import express from "express";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const router = express.Router();

router.get("/generate-pdf", async (req, res) => {
  // Static data for now (replace later with dynamic values from DB)
  const patientName = "Ramesh Kumar";
  const doctorName = "Dr. Nisha Sharma";
  const appointmentDate = "10 April 2025";
  const currentDate = new Date().toLocaleDateString();
  const hospitalName = "Healing Touch Hospital";
  const paymentAmount = "₹500";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text, x, y, size = 12, isBold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0, 0, 0),
    });
  };

  // Header
  drawText(hospitalName, 200, 800, 18, true);
  drawText("Appointment Confirmation Slip", 180, 780, 14, true);

  // Details
  drawText(`Patient Name: ${patientName}`, 50, 730);
  drawText(`Doctor Name: ${doctorName}`, 50, 710);
  drawText(`Appointment Date: ${appointmentDate}`, 50, 690);
  drawText(`Generated On: ${currentDate}`, 50, 670);

  // Payment Info
  drawText("Payment Slip", 250, 630, 14, true);
  drawText(`Amount Paid: ${paymentAmount}`, 50, 600);
  drawText("Mode of Payment: UPI", 50, 580);

  // Footer
  drawText("Thank you for choosing us!", 200, 100, 12, true);

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=appointment-slip.pdf");
  res.send(Buffer.from(pdfBytes));
});

export default router;
