import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
// import userRouter from "./routes/user"

dotenv.config();

const app = express();

// Use Helmet for setting security-related HTTP headers
app.use(helmet());

// Use Morgan for logging HTTP requests
app.use(morgan("dev"));

// Middleware to parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});
// app.use('/api/user',userRouter)
export default app;
