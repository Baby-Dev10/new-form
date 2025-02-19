import { Request, Response, NextFunction } from "express";
import Session from "../models/session";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await Session.findById(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
