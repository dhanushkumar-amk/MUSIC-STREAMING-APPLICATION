import Playlist from "../models/playlist.model.js";
import Song from "../models/songModel.js";

/* CREATE PLAYLIST */
export const createPlaylist = async (req, res) => {
    try {
        const { name, desc } = req.body;
        const userId = req.userId;

        const playlist = new Playlist({
            name,
            desc,
            userId,
            songs: []
        });

        await playlist.save();
        res.json({ success: true, playlist, message: "Playlist created" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* GET USER PLAYLISTS (Renamed from getUserPlaylists) */
export const getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ userId: req.userId })
            .populate("songs")
            .sort({ createdAt: -1 });

        res.json({ success: true, playlists });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* RENAME PLAYLIST */
export const renamePlaylist = async (req, res) => {
    try {
        const { playlistId, name, desc } = req.body;
        const playlist = await Playlist.findOneAndUpdate(
            { _id: playlistId, userId: req.userId },
            { name, desc },
            { new: true }
        );
        res.json({ success: true, playlist, message: "Playlist updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

/* ADD SONG TO PLAYLIST */
export const addSongToPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;

        const playlist = await Playlist.findOne({ _id: playlistId, userId: req.userId });
        if(!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        if(playlist.songs.includes(songId)) {
            return res.status(400).json({ success: false, message: "Song already in playlist" });
        }

        playlist.songs.push(songId);
        await playlist.save();

        res.json({ success: true, message: "Song added to playlist" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* REMOVE SONG FROM PLAYLIST */
export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId, songId } = req.body;

        const playlist = await Playlist.findOne({ _id: playlistId, userId: req.userId });
        if(!playlist) return res.status(404).json({ success: false, message: "Playlist not found" });

        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();

        res.json({ success: true, message: "Song removed" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* DELETE PLAYLIST */
export const deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.body;
        await Playlist.findOneAndDelete({ _id: playlistId, userId: req.userId });
        res.json({ success: true, message: "Playlist deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* --- STUB FUNCTIONS FOR PLAYBACK ROUTES (To satisfy imports) --- */
export const startPlaylistPlayback = async (req, res) => res.json({ success: true });
export const togglePlaylistShuffle = async (req, res) => res.json({ success: true });
export const updatePlaylistLoop = async (req, res) => res.json({ success: true });
export const playlistPlayNext = async (req, res) => res.json({ success: true });
export const playlistAddToQueue = async (req, res) => res.json({ success: true });
