import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import connectCloudinary from "./src/config/cloudinary.js";
import connectDB from "./src/config/mongodb.js";
import prisma from "./src/config/database.js";

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

/* VERY IMPORTANT:
   UPLOAD ROUTES MUST BE REGISTERED BEFORE express.json(), cors(), helmet()
   OTHERWISE req.files WILL BE UNDEFINED for multer uploads
*/

/* ROUTES THAT HANDLE FILE UPLOADS FIRST */
import songRouter from "./src/routes/songRoute.js";
import albumRouter from "./src/routes/albumRoute.js";

// Enable CORS for file upload routes
app.use(cors());

// Enable JSON parsing for all routes (needed for remove endpoints)
app.use(express.json({ limit: "10mb" }));

app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);


/* --- NOW JSON + SECURITY MIDDLEWARE CAN LOAD --- */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    hidePoweredBy: true
  })
);

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

// Connect to MongoDB (for songs & albums)
connectDB();

// Connect to PostgreSQL via Prisma (for migrated features)
prisma.$connect()
  .then(() => console.log('✅ PostgreSQL (Neon) connected via Prisma'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err);
    process.exit(1);
  });

/* CREATE SEARCH INDEXES */
createIndexes();
applyAutocompleteSettings();

/* REMAINING ROUTES (NO FILE UPLOADS) */
import authRouter from "./src/routes/auth.route.js";
import userRouter from "./src/routes/user.route.js";
import libraryRouter from "./src/routes/library.route.js";
import playlistRouter from "./src/routes/playlist.route.js";
import searchRouter from "./src/routes/search.route.js";
import autocompleteRouter from "./src/routes/autocomplete.route.js";
import recentlyPlayedRouter from "./src/routes/recentlyPlayed.route.js";
import playStatsRouter from "./src/routes/playStats.route.js";
import recommendationRoutes from "./src/routes/recommendation.route.js";
import queueRoutes from "./src/routes/queue.route.js";
import statsRouter from "./src/routes/stats.route.js";
import userSettingsRouter from "./src/routes/userSettings.route.js";
import lyricsRouter from "./src/routes/lyrics.route.js";
import sessionRouter from "./src/routes/session.route.js";


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/library", libraryRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api/search", searchRouter);
app.use("/api/autocomplete", autocompleteRouter);
app.use("/api/recently-played", recentlyPlayedRouter);
app.use("/api/plays", playStatsRouter);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/stats", statsRouter);
app.use("/api/settings", userSettingsRouter);
app.use("/api/lyrics", lyricsRouter);
app.use("/api/session", sessionRouter);




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

/* START SERVER WITH SOCKET.IO */
import { createServer } from 'http';
import { initializeSocket } from './src/socket/sessionSocket.js';

const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

httpServer.listen(port, () =>
  console.log(`🚀 Server running on PORT: ${port}`)
);
