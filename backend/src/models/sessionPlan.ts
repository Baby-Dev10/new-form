import mongoose, { Schema } from "mongoose";

const sessionPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["session", "gold", "platinum"], // updated enum
    },
    price: {
      type: Number,
      required: true,
    },
    sessions: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [], // not required for plain "session"
    },
  },
  {
    timestamps: true,
  }
);

const SessionPlan = mongoose.model("SessionPlan", sessionPlanSchema);

export default SessionPlan;
