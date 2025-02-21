import express from "express";
import {
  getAllSessions,
  updateSessionStatus,
  updatePricing,
  updatePremiumPlans,
  getStats,
  getSessionPlans,
  createSessionPlan,
  updateSessionPlanPrice,
  getPlainSessionPlan,
  createPlainSessionPlan,
  updatePlainSessionPlanPrice,
} from "../controllers/adminController";

import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();

// All routes require authentication and admin role
router.use(isAdmin);

router.get("/sessions", getAllSessions);
router.patch("/sessions/:id/status", updateSessionStatus);
// router.patch("/pricing", updatePricing);
// router.patch("/premium-plans", updatePremiumPlans);
router.get("/stats", getStats);
// Get session plans
router.get("/session-plans", getSessionPlans);

// Update session plan price
router.put("/session-plans/:name/price", updateSessionPlanPrice);
// Create a new session plan
// router.post("/session-plans", createSessionPlan);

// Routes for plain session plan
router.get("/session-plans/session", getPlainSessionPlan);
router.post("/session-plans/session", createPlainSessionPlan);
router.put("/session-plans/session/price", updatePlainSessionPlanPrice);

export default router;
