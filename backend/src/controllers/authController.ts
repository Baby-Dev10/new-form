import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import Session from "../models/session"; // Added session model import

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
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

    // Find or create session
    let session:any = await Session.findOne({ email });
    if (!session) {
      session = new Session({
        name,
        email,
        googleId,
        role: "customer", // Default role for new sessions
      });
      await session.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: session._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.json({
      token: jwtToken,
      user: { // The response key remains user for consistency
        id: session._id,
        name: session.name,
        email: session.email,
        role: session.role,
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
) => {
  try {
    const session:any = await Session.findById(req.user?.userId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({
      id: session._id,
      name: session.name,
      email: session.email,
      role: session.role,
      premiumPlan: session.premiumPlan,
      premiumExpiry: session.premiumExpiry,
    });
  } catch (error) {
    next(error);
  }
};
