// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import sessionRoutes from "./routes/session";
import morgan from "morgan";
dotenv.config();
import adminRoutes from "./routes/admin";
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
app.use(morgan("dev"));
// Middleware to set headers to fix CORS error
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173", // Your React frontend URL
    methods: "GET,POST,PUT,DELETE", // Allowed methods
    allowedHeaders: "Content-Type,Authorization", // Allowed headers
    credentials: true, // If using cookies or authentication
  })
);

// Optionally handle preflight requests explicitly
app.options("*", cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api", sessionRoutes);
app.use("/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
