//auth middleware

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    (req as any).user = decoded; // casting to allow new property
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
