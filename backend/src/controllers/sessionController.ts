import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Session from "../models/session";
import generatePDF from "../utils/generatePDF";

export const createSession = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return; // changed: do not return res.status(...)
    }

    const { name, age, sessions, paymentMethod, premiumPlan, totalAmount } = req.body;
    const premiumExpiry = premiumPlan ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined;

    const session = new Session({
      user: req.user?.id,
      name,
      age,
      sessions,
      paymentMethod,
      premiumPlan: premiumPlan || "none",
      totalAmount,
      premiumExpiry, // added premiumExpiry for premium plans
    });

    await session.save();

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await Session.find({ user: req.user?.id }).sort({
      createdAt: -1,
    });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return; // changed early return
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return; // changed early return
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
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user?.id,
    }).populate("user", "name email");

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return; // changed early return
    }

    const pdfBuffer = await generatePDF(session, res);

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
