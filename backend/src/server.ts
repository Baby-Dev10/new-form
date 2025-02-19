// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import sessionRoutes from "./routes/session";

dotenv.config();

const corsOptions = {
  origin: ["http://localhost:5173", ""], // or an array of allowed origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // if you need to send cookies or auth headers
  // Optionally, you can specify allowed headers
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Connect to MongoDB
connectDB();

const app = express();

app.use(
  cors({
    origin: "https://form-session-iota.vercel.app", // Your React frontend URL
    methods: "GET,POST", // Allowed methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // If using cookies or authentication
  })
);
app.use(cors());

// Optionally handle preflight requests explicitly
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", sessionRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
