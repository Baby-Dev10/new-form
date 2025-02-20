import { Request, Response, NextFunction } from "express";
import Session from "../models/session";
import User from "../models/user";

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
