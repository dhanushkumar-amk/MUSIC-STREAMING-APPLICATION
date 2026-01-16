import prisma from "../config/database.js";

// EQ Presets
const EQ_PRESETS = {
  flat: { band32: 0, band64: 0, band125: 0, band250: 0, band500: 0, band1k: 0, band2k: 0, band4k: 0, band8k: 0, band16k: 0 },
  rock: { band32: 5, band64: 4, band125: -3, band250: -4, band500: -2, band1k: 2, band2k: 4, band4k: 5, band8k: 5, band16k: 5 },
  pop: { band32: -2, band64: -1, band125: 0, band250: 2, band500: 4, band1k: 4, band2k: 2, band4k: 0, band8k: -1, band16k: -2 },
  jazz: { band32: 4, band64: 3, band125: 2, band250: 2, band500: -2, band1k: -2, band2k: 0, band4k: 2, band8k: 3, band16k: 4 },
  classical: { band32: 5, band64: 4, band125: 3, band250: 2, band500: -2, band1k: -2, band2k: 0, band4k: 2, band8k: 3, band16k: 4 },
  electronic: { band32: 6, band64: 5, band125: 2, band250: 0, band500: -2, band1k: 2, band2k: 0, band4k: 2, band8k: 5, band16k: 6 },
  "hip-hop": { band32: 6, band64: 5, band125: 2, band250: 3, band500: -1, band1k: -1, band2k: 2, band4k: -1, band8k: 2, band16k: 3 }
};

// Get user settings
export const getUserSettings = async (req, res) => {
  try {
    const userId = req.userId;

    let settings = await prisma.userSettings.findUnique({ where: { userId } });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId } });
    }

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings"
    });
  }
};

// Update audio quality
export const updateAudioQuality = async (req, res) => {
  try {
    const userId = req.userId;
    const { quality } = req.body;

    if (!["low", "medium", "high", "very_high"].includes(quality)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audio quality"
      });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { audioQuality: quality },
      create: { userId, audioQuality: quality }
    });

    res.json({
      success: true,
      message: "Audio quality updated",
      settings
    });
  } catch (error) {
    console.error("Error updating audio quality:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update audio quality"
    });
  }
};

// Update crossfade duration
export const updateCrossfade = async (req, res) => {
  try {
    const userId = req.userId;
    const { duration } = req.body;

    if (duration < 0 || duration > 12) {
      return res.status(400).json({
        success: false,
        message: "Crossfade duration must be between 0 and 12 seconds"
      });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { crossfadeDuration: duration },
      create: { userId, crossfadeDuration: duration }
    });

    res.json({
      success: true,
      message: "Crossfade updated",
      settings
    });
  } catch (error) {
    console.error("Error updating crossfade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update crossfade"
    });
  }
};

// Toggle gapless playback
export const toggleGapless = async (req, res) => {
  try {
    const userId = req.userId;
    const { enabled } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { gaplessPlayback: enabled },
      create: { userId, gaplessPlayback: enabled }
    });

    res.json({
      success: true,
      message: `Gapless playback ${enabled ? 'enabled' : 'disabled'}`,
      settings
    });
  } catch (error) {
    console.error("Error toggling gapless:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle gapless playback"
    });
  }
};

// Toggle normalize volume
export const toggleNormalize = async (req, res) => {
  try {
    const userId = req.userId;
    const { enabled } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { normalizeVolume: enabled },
      create: { userId, normalizeVolume: enabled }
    });

    res.json({
      success: true,
      message: `Volume normalization ${enabled ? 'enabled' : 'disabled'}`,
      settings
    });
  } catch (error) {
    console.error("Error toggling normalize:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle volume normalization"
    });
  }
};

// Update playback speed
export const updatePlaybackSpeed = async (req, res) => {
  try {
    const userId = req.userId;
    const { speed } = req.body;

    if (speed < 0.5 || speed > 2.0) {
      return res.status(400).json({
        success: false,
        message: "Playback speed must be between 0.5 and 2.0"
      });
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { playbackSpeed: speed },
      create: { userId, playbackSpeed: speed }
    });

    res.json({
      success: true,
      message: "Playback speed updated",
      settings
    });
  } catch (error) {
    console.error("Error updating playback speed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update playback speed"
    });
  }
};

// Toggle equalizer
export const toggleEqualizer = async (req, res) => {
  try {
    const userId = req.userId;
    const { enabled } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: { equalizerEnabled: enabled },
      create: { userId, equalizerEnabled: enabled }
    });

    res.json({
      success: true,
      message: `Equalizer ${enabled ? 'enabled' : 'disabled'}`,
      settings
    });
  } catch (error) {
    console.error("Error toggling equalizer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle equalizer"
    });
  }
};

// Update equalizer preset
export const updateEqualizerPreset = async (req, res) => {
  try {
    const userId = req.userId;
    const { preset } = req.body;

    if (!EQ_PRESETS[preset] && preset !== "custom") {
      return res.status(400).json({
        success: false,
        message: "Invalid equalizer preset"
      });
    }

    const updateData = { equalizerPreset: preset };

    // Apply preset bands if not custom
    if (preset !== "custom" && EQ_PRESETS[preset]) {
      Object.assign(updateData, EQ_PRESETS[preset]);
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData }
    });

    res.json({
      success: true,
      message: "Equalizer preset updated",
      settings
    });
  } catch (error) {
    console.error("Error updating equalizer preset:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update equalizer preset"
    });
  }
};

// Update custom equalizer bands
export const updateEqualizerBands = async (req, res) => {
  try {
    const userId = req.userId;
    const { bands } = req.body;

    // Validate bands
    const validBands = ["band32", "band64", "band125", "band250", "band500", "band1k", "band2k", "band4k", "band8k", "band16k"];
    const updateBands = {};

    for (const [key, value] of Object.entries(bands)) {
      if (!validBands.includes(key)) {
        return res.status(400).json({
          success: false,
          message: `Invalid band: ${key}`
        });
      }

      if (value < -12 || value > 12) {
        return res.status(400).json({
          success: false,
          message: `Band value must be between -12 and 12`
        });
      }

      updateBands[key] = value;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...updateBands,
        equalizerPreset: "custom"
      },
      create: {
        userId,
        ...updateBands,
        equalizerPreset: "custom"
      }
    });

    res.json({
      success: true,
      message: "Equalizer bands updated",
      settings
    });
  } catch (error) {
    console.error("Error updating equalizer bands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update equalizer bands"
    });
  }
};

// Get available EQ presets
export const getEqualizerPresets = async (req, res) => {
  try {
    res.json({
      success: true,
      presets: Object.keys(EQ_PRESETS),
      presetsData: EQ_PRESETS
    });
  } catch (error) {
    console.error("Error fetching EQ presets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch EQ presets"
    });
  }
};

// Update all settings at once
export const updateAllSettings = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updates,
      create: { userId, ...updates }
    });

    res.json({
      success: true,
      message: "Settings updated",
      settings
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update settings"
    });
  }
};
