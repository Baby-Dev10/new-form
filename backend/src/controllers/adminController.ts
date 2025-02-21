import { Request, Response, NextFunction } from "express";
import Session from "../models/session";
import User from "../models/user";
import SessionPlan from "../models/sessionPlan";
export const getAllSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessions = await Session.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const updateSessionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id).populate(
      "user",
      "email"
    );

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    session.status = status;
    await session.save();

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pricePerSession } = req.body;

    res.json({ pricePerSession });
  } catch (error) {
    next(error);
  }
};

export const updatePremiumPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { plans } = req.body;

    res.json({ plans });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalSessions = await Session.aggregate([
      { $group: { _id: null, total: { $sum: "$sessions" } } },
    ]);
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalRevenue = await Session.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalSessions: totalSessions[0]?.total || 0,
      totalCustomers,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// Get all session plans
export const getSessionPlans = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const plans = await SessionPlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session plans" });
  }
};

// Create a new session plan
export const createSessionPlan = async (
  req: Request,
  res: Response
): Promise<any> => {
  const data: {
    name: string;
    price: number;
    sessions: number;
    features: string[];
  } = req.body;

  if (!["gold", "platinum"].includes(data.name)) {
    return res.status(400).json({ error: "Invalid session plan name" });
  }

  if (
    typeof data.price !== "number" ||
    data.price <= 0 ||
    typeof data.sessions !== "number" ||
    data.sessions <= 0 ||
    !Array.isArray(data.features) ||
    data.features.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid price, session count or features" });
  }

  try {
    const newPlan = new SessionPlan(data);
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: "Failed to create session plan" });
  }
};

// Update session plan price
export const updateSessionPlanPrice = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.params;
  const { price } = req.body;

  if (!["gold", "platinum"].includes(name)) {
    return res.status(400).json({ error: "Invalid session plan name" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Invalid price value" });
  }

  try {
    const updatedPlan = await SessionPlan.findOneAndUpdate(
      { name },
      { price },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ error: "Session plan not found" });
    }

    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: "Failed to update session plan price" });
  }
};

// New: Update session plan features
export const updateSessionPlanFeatures = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.params;
  const { features } = req.body;

  if (!["gold", "platinum"].includes(name)) {
    return res.status(400).json({ error: "Invalid session plan name" });
  }

  if (!Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: "Invalid features value" });
  }

  try {
    const updatedPlan = await SessionPlan.findOneAndUpdate(
      { name },
      { features },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ error: "Session plan not found" });
    }
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: "Failed to update session plan features" });
  }
};

// New: Create a plain session plan (no features)
export const createPlainSessionPlan = async (
  req: Request,
  res: Response
): Promise<any> => {
  const data: { price: number; sessions: number } = req.body;
  if (
    typeof data.price !== "number" ||
    data.price <= 0 ||
    typeof data.sessions !== "number" ||
    data.sessions <= 0
  ) {
    return res.status(400).json({ error: "Invalid price or session count" });
  }
  try {
    const newPlan = new SessionPlan({
      name: "session",
      price: data.price,
      sessions: data.sessions,
      features: [],
    });
    await newPlan.save();
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: "Failed to create plain session plan" });
  }
};

// New: Update plain session plan price
export const updatePlainSessionPlanPrice = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { price } = req.body;
  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Invalid price value" });
  }
  try {
    const updatedPlan = await SessionPlan.findOneAndUpdate(
      { name: "session" },
      { price },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ error: "Plain session plan not found" });
    }
    res.json(updatedPlan);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update plain session plan price" });
  }
};

// New: Get plain session plan
export const getPlainSessionPlan = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const plan = await SessionPlan.findOne({ name: "session" });
    if (!plan) {
      return res.status(404).json({ error: "Plain session plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch plain session plan" });
  }
};
