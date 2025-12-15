import express from "express";
import {
  getUserSettings,
  updateAudioQuality,
  updateCrossfade,
  toggleGapless,
  toggleNormalize,
  updatePlaybackSpeed,
  toggleEqualizer,
  updateEqualizerPreset,
  updateEqualizerBands,
  getEqualizerPresets,
  updateAllSettings
} from "../controllers/userSettings.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user settings
router.get("/", getUserSettings);

// Update all settings
router.put("/", updateAllSettings);

// Audio quality
router.patch("/audio-quality", updateAudioQuality);

// Crossfade
router.patch("/crossfade", updateCrossfade);

// Gapless playback
router.patch("/gapless", toggleGapless);

// Normalize volume
router.patch("/normalize", toggleNormalize);

// Playback speed
router.patch("/playback-speed", updatePlaybackSpeed);

// Equalizer
router.patch("/equalizer/toggle", toggleEqualizer);
router.patch("/equalizer/preset", updateEqualizerPreset);
router.patch("/equalizer/bands", updateEqualizerBands);
router.get("/equalizer/presets", getEqualizerPresets);

export default router;
