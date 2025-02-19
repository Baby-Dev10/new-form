import { Request, Response, NextFunction } from "express";

interface ValidationError extends Error {
  errors?: { [key: string]: { message: string } };
}

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

export const errorHandler = (
  err: ValidationError & MongoError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err.name === "ValidationError" && err.errors) {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000 && err.keyPattern) {
    return res.status(400).json({
      message: "Duplicate key error",
      field: Object.keys(err.keyPattern)[0],
    });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
