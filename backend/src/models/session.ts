import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  age: number;
  sessions: number;
  paymentMethod: "card" | "bank";
  premiumPlan: "none" | "gold" | "platinum";
  status: "pending" | "approved" | "cancelled";
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
    },
    sessions: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank"],
      required: true,
    },
    premiumPlan: {
      type: String,
      enum: ["none", "gold", "platinum"],
      default: "none",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
