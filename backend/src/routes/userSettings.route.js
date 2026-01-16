import express from "express";
import validate from "../middleware/validate.middleware.js";
import { userSettingsSchemas } from "../validators/misc.validator.js";

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
router.put("/", validate(userSettingsSchemas.updateAllSettings), updateAllSettings);

// Audio quality
router.patch("/audio-quality", validate(userSettingsSchemas.updateAudioQuality), updateAudioQuality);

// Crossfade
router.patch("/crossfade", validate(userSettingsSchemas.updateCrossfade), updateCrossfade);

// Gapless playback
router.patch("/gapless", toggleGapless);

// Normalize volume
router.patch("/normalize", toggleNormalize);

// Playback speed
router.patch("/playback-speed", validate(userSettingsSchemas.updatePlaybackSpeed), updatePlaybackSpeed);

// Equalizer
router.patch("/equalizer/toggle", toggleEqualizer);
router.patch("/equalizer/preset", validate(userSettingsSchemas.updateEqualizerPreset), updateEqualizerPreset);
router.patch("/equalizer/bands", validate(userSettingsSchemas.updateEqualizerBands), updateEqualizerBands);
router.get("/equalizer/presets", getEqualizerPresets);

export default router;
