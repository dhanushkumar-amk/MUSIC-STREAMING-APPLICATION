import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import connectCloudinary from "./src/config/cloudinary.js";
import connectDB from "./src/config/mongodb.js";

import register from "./src/config/prometheus.js";

import { createIndexes } from "./src/search/createIndexes.js";
import { applyAutocompleteSettings } from "./src/search/applyAutocompleteSettings.js";



const app = express();
const port = process.env.PORT || 4000;

/* METRICS ENDPOINT */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* MIDDLEWARE */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    hidePoweredBy: true
  })
);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(compression());

/* GLOBAL RATE LIMITER */
const globalLimiter = rateLimit({
  windowMs: 60000,
  max: 300,
  message: { success: false, message: "Too many requests" }
});
app.use(globalLimiter);

/* INIT SERVICES */
connectCloudinary();
connectDB();

/* CREATE INDEXES AND APPLY AUTOCOMPLETE SETTINGS */
createIndexes();
applyAutocompleteSettings();


/* ROUTES */
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";
import authRouter from "./src/routes/auth.route.js";
import userRouter from "./src/routes/user.route.js";
import libraryRouter from "./src/routes/library.route.js";
import playlistRouter from "./src/routes/playlist.route.js";
import searchRouter from "./src/routes/search.route.js"
import autocompleteRouter from "./src/routes/autocomplete.route.js";
import recentlyPlayedRouter from "./src/routes/recentlyPlayed.route.js";


app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/library", libraryRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api/search", searchRouter);
app.use("/api/autocomplete", autocompleteRouter);
app.use("/api/recently-played", recentlyPlayedRouter);



/* DEFAULT ROUTE */
app.get("/", (req, res) => res.send("API Working - Production Optimized"));

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* START */
app.listen(port, () =>
  console.log(`🚀 Server running on PORT: ${port}`)
);
