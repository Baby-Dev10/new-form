import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Request, Response, NextFunction } from "express";

import User from "../models/user";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { name, email, sub: googleId } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Google account must have an email" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        role: "customer", // Default role for new users
      });
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      premiumPlan: user.premiumPlan,
      premiumExpiry: user.premiumExpiry,
    });
  } catch (error) {
    next(error);
  }
};
