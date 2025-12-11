import songModel from "../models/songModel.js";

export const getNextSong = async (req, res) => {
  try {
    const { currentSongId } = req.params;

    const current = await songModel.findById(currentSongId);
    if (!current) return res.status(404).json({ message: "Song not found" });

    let next = await songModel.findOne({
      album: current.album,
      _id: { $ne: currentSongId }
    }).sort({ createdAt: 1 });

    if (!next) {
      next = await songModel.findOne({ _id: { $ne: currentSongId } }).sort({ createdAt: 1 });
    }

    res.json({
      success: true,
      preload: next
        ? {
            id: next._id,
            name: next.name,
            audioUrl: next.file,
            image: next.image,
            desc: next.desc
          }
        : null
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to preload next song" });
  }
};
