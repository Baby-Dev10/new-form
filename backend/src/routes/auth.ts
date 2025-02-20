import express from "express";
import { googleAuth, getProfile } from "../controllers/authController";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.post("/google", googleAuth);
router.get("/profile", auth, getProfile);

export default router;
