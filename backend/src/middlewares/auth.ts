//Auth middleware

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

export const auth = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => { // explicitly return void
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return; // exit without returning a Response
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedUser;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
