import express from "express";
import { body } from "express-validator";
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  downloadReceipt,
} from "../controllers/sessionController";
import { auth } from "../middlewares/auth";

const router = express.Router();

// Validation middleware
const sessionValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("age").isInt({ min: 18 }).withMessage("Age must be at least 18"),
  body("sessions")
    .isInt({ min: 1, max: 10 })
    .withMessage("Number of sessions must be between 1 and 10"),
  body("paymentMethod")
    .isIn(["card", "bank"])
    .withMessage("Invalid payment method"),
];

// Routes
router.post("/", auth, sessionValidation, createSession);
router.get("/", auth, getSessions);
router.get("/:id", auth, getSessionById);
router.patch("/:id", auth, updateSession);
router.get("/:id/receipt", auth, downloadReceipt);

export default router;
