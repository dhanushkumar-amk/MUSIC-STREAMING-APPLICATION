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

// Connect to MongoDB
connectDB();

// Initialize Redis Cache Service (Phase 1)
import cacheService from "./src/services/cacheService.js";
cacheService.connect().then(() => {
  console.log('✅ Cache service initialized');
}).catch(err => {
  console.error('⚠️  Cache service failed to initialize:', err.message);
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
import artistRouter from "./src/routes/artist.route.js";
import presenceRouter from "./src/routes/presence.routes.js";

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
app.use("/api/artist", artistRouter);
app.use("/api/presence", presenceRouter); // Phase 2: Presence System




/* DEFAULT ROUTE */
app.get("/", (req, res) => res.send("API Working - Production Optimized"));

/* GLOBAL ERROR HANDLER (Phase 1) */
import errorHandler from "./src/middleware/errorHandler.js";
app.use(errorHandler);

/* START SERVER WITH DISTRIBUTED SOCKET.IO (Phase 2) */
import { createServer } from 'http';
import { initializeSocket } from './src/socket/distributedSocket.js';

const httpServer = createServer(app);

// Initialize Socket.io with Redis adapter
initializeSocket(httpServer).then(() => {
  console.log('✅ Distributed Socket.IO initialized');
}).catch(err => {
  console.error('⚠️  Socket.IO initialization failed:', err.message);
});

httpServer.listen(port, () =>
  console.log(`🚀 Server running on PORT: ${port}`)
);
