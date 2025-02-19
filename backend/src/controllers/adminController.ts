import { Request, Response, NextFunction } from "express";
import Session from "../models/session";

// import { sendEmail } from "../utils/sendEmail";

export const getAllSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id).populate(
      "user",
      "email"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = status;
    await session.save();

    // Send email notification
    const emailSubject =
      status === "approved"
        ? "Session Booking Approved"
        : "Session Booking Cancelled";
    const emailText =
      status === "approved"
        ? `Your session booking has been approved. You can now access your sessions.`
        : `Your session booking has been cancelled. Please contact support for more information.`;

    if (session.user && "email" in session.user) {
      await sendEmail({
        to: session.user.email as string,
        subject: emailSubject,
        text: emailText,
      });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
) => {
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
) => {
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
