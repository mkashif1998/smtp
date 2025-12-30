// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import payrollRoutes from "./routes/payroll.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Allow all origins (*) - CORS configuration
app.use(
  cors({
    origin: "*",
    credentials: false, // Must be false when using wildcard origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/payroll", payrollRoutes);

// Connect DB
connectDB();

// Run locally, but Vercel will ignore this because NODE_ENV=production there
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
