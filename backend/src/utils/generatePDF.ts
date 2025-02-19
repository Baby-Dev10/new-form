import PDFDocument from "pdfkit";
import { Response } from "express";
import { IBooking } from "../models/Booking";

const generatePDF = (booking: IBooking, res: Response): void => {
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the PDF into the response
  res.setHeader("Content-Disposition", `attachment; filename=receipt.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Header
  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("Session Booking Receipt", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" })
    .moveDown(1);

  // Divider Line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Booking Details (Table-like Structure)
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Booking Details", { underline: true })
    .moveDown(0.5);

  const details = [
    { label: "Full Name", value: booking.name },
    { label: "Age", value: booking.age.toString() },
    { label: "Number of Sessions", value: booking.sessions.toString() },
    { label: "Payment Method", value: booking.paymentMethod },
  ];

  details.forEach(({ label, value }) => {
    doc
      .font("Helvetica-Bold")
      .text(`${label}: `, { continued: true })
      .font("Helvetica")
      .text(value)
      .moveDown(0.3);
  });

  // Divider Line
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Footer
  doc
    .fontSize(12)
    .font("Helvetica-Oblique")
    .text("Thank you for your booking!", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("For any inquiries, contact us at support@example.com", {
      align: "center",
    });

  doc.end();
};

export default generatePDF;
