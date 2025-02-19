import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Session from "../models/session";
import generatePDF from "../utils/generatePDF";

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age, sessions, paymentMethod, premiumPlan, totalAmount } =
      req.body;

    const session = new Session({
      user: req.user?.userId,
      name,
      age,
      sessions,
      paymentMethod,
      premiumPlan: premiumPlan || "none",
      totalAmount,
    });

    await session.save();

    if (premiumPlan) {
      await User.findByIdAndUpdate(req.user?.userId, {
        premiumPlan,
        premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    // const user = await User.findById(req.user?.userId);
    // if (user) {
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Session Booking Confirmation",
    //     text: `Thank you for booking ${sessions} session(s). Your booking is pending approval.`,
    //   });
    // }

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await Session.find({ user: req.user?.userId }).sort({
      createdAt: -1,
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.userId,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const allowedUpdates = ["sessions", "paymentMethod"];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj: Record<string, any>, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(session, updates);
    await session.save();

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const downloadReceipt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.userId,
    }).populate("user", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const pdfBuffer = await generatePDF(session);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${session._id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
