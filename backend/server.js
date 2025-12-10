import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import connectCloudinary from "./src/config/cloudinary.js";
import connectDB from "./src/config/mongodb.js";
import redis from "./src/config/redis.js";

// ROUTES
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";
import authRouter from "./src/routes/auth.route.js";
import userRouter from "./src/routes/user.route.js";

// CREATE APP
const app = express();
const port = process.env.PORT || 4000;

/* -----------------------------------------------------
   GLOBAL SECURITY + PERFORMANCE MIDDLEWARE
----------------------------------------------------- */

// 1) SECURITY HEADERS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    xssFilter: true,
    hidePoweredBy: true
  })
);

// 2) ENABLE CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 3) JSON BODY PARSER (WITH LIMIT)
app.use(express.json({ limit: "10mb" }));

// 4) COMPRESSION (boosts performance)
app.use(compression());

// 5) GLOBAL RATE LIMITER (all routes)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 300,                // 300 requests per IP per minute
  message: {
    success: false,
    message: "Too many requests — please try again later."
  }
});
app.use(globalLimiter);

/* -----------------------------------------------------
   DATABASE + CLOUDINARY + REDIS INITIALIZATION
----------------------------------------------------- */

connectCloudinary();
connectDB();



/* -----------------------------------------------------
   ROUTES
----------------------------------------------------- */

app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API Working - Production Optimized");
});

/* -----------------------------------------------------
   GLOBAL ERROR HANDLER
----------------------------------------------------- */

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

/* -----------------------------------------------------
   START SERVER
----------------------------------------------------- */

app.listen(port, () => {
  console.log(`✅ Production Server Running on PORT: ${port}`);
});
