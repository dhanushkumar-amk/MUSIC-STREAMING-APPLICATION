import Lyrics from "../models/lyrics.model.js";
import songModel from "../models/songModel.js";

// Get lyrics for a song
export const getLyrics = async (req, res) => {
  try {
    const { songId } = req.params;

    // Check if song exists
    const song = await songModel.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }

    const lyrics = await Lyrics.findOne({ songId });

    if (!lyrics) {
      return res.status(404).json({
        success: false,
        message: "Lyrics not found for this song"
      });
    }

    res.json({
      success: true,
      lyrics
    });
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lyrics"
    });
  }
};

// Add or update lyrics (Admin)
export const upsertLyrics = async (req, res) => {
  try {
    const { songId, plainLyrics, syncedLyrics, language, source } = req.body;

    // Check if song exists
    const song = await songModel.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }

    // Validate synced lyrics format
    if (syncedLyrics && Array.isArray(syncedLyrics)) {
      for (const line of syncedLyrics) {
        if (typeof line.time !== 'number' || typeof line.text !== 'string') {
          return res.status(400).json({
            success: false,
            message: "Invalid synced lyrics format. Each line must have 'time' (number) and 'text' (string)"
          });
        }
      }

      // Sort by time
      syncedLyrics.sort((a, b) => a.time - b.time);
    }

    const lyrics = await Lyrics.findOneAndUpdate(
      { songId },
      {
        songId,
        plainLyrics: plainLyrics || "",
        syncedLyrics: syncedLyrics || [],
        language: language || "en",
        source: source || "manual",
        isVerified: true
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Lyrics saved successfully",
      lyrics
    });
  } catch (error) {
    console.error("Error saving lyrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save lyrics"
    });
  }
};

// Delete lyrics (Admin)
export const deleteLyrics = async (req, res) => {
  try {
    const { songId } = req.params;

    const result = await Lyrics.findOneAndDelete({ songId });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Lyrics not found"
      });
    }

    res.json({
      success: true,
      message: "Lyrics deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting lyrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lyrics"
    });
  }
};

// Parse LRC format lyrics
export const parseLRC = (lrcText) => {
  const lines = lrcText.split('\n');
  const syncedLyrics = [];

  for (const line of lines) {
    // Match [mm:ss.xx] or [mm:ss] format
    const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2}))?\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = match[3] ? parseInt(match[3]) : 0;
      const text = match[4].trim();

      const time = minutes * 60 + seconds + centiseconds / 100;

      if (text) {
        syncedLyrics.push({ time, text });
      }
    }
  }

  return syncedLyrics;
};

// Import LRC format lyrics
export const importLRC = async (req, res) => {
  try {
    const { songId, lrcText, language } = req.body;

    if (!lrcText) {
      return res.status(400).json({
        success: false,
        message: "LRC text is required"
      });
    }

    // Check if song exists
    const song = await songModel.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found"
      });
    }

    const syncedLyrics = parseLRC(lrcText);

    if (syncedLyrics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid lyrics found in LRC format"
      });
    }

    // Extract plain text
    const plainLyrics = syncedLyrics.map(l => l.text).join('\n');

    const lyrics = await Lyrics.findOneAndUpdate(
      { songId },
      {
        songId,
        plainLyrics,
        syncedLyrics,
        language: language || "en",
        source: "lrclib",
        isVerified: true
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "LRC lyrics imported successfully",
      lyrics
    });
  } catch (error) {
    console.error("Error importing LRC:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import LRC lyrics"
    });
  }
};

// Get all songs with lyrics
export const getSongsWithLyrics = async (req, res) => {
  try {
    const lyrics = await Lyrics.find()
      .populate('songId', 'name artist image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: lyrics.length,
      lyrics
    });
  } catch (error) {
    console.error("Error fetching songs with lyrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch songs with lyrics"
    });
  }
};
