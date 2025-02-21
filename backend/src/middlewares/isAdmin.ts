import { Request, Response, NextFunction } from "express";
import User from "../models/user";

// interface AuthRequest extends Request {
//   user?: { userId: string };
// }

export const isAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
