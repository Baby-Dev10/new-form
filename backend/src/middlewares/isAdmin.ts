import { Request, Response, NextFunction } from "express";
import Session from "../models/session";


export const isAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user:any = await Session.findById(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
