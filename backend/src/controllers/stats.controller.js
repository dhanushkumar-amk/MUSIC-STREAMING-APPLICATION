import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import User from "../models/user.model.js";
import Playlist from "../models/playlist.model.js";

/* GET DASHBOARD STATISTICS */
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const totalSongs = await songModel.countDocuments();
        const totalAlbums = await albumModel.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalPlaylists = await Playlist.countDocuments();

        // Get recent songs
        const recentSongs = await songModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name desc image createdAt playCount');

        // Get top songs by play count
        const topSongs = await songModel.find()
            .sort({ playCount: -1 })
            .limit(5)
            .select('name desc image playCount');

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email avatar createdAt');

        // Calculate growth (mock data for now - you can implement real logic)
        const stats = {
            totalSongs,
            totalAlbums,
            totalUsers,
            totalPlaylists,
            songGrowth: 12.5, // Percentage growth
            userGrowth: 8.3,
            albumGrowth: 15.2,
            playlistGrowth: 10.1,
            recentSongs,
            topSongs,
            recentUsers
        };

        res.json({ success: true, stats });

    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/* GET PLAY STATISTICS */
export const getPlayStats = async (req, res) => {
    try {
        const stats = await songModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPlays: { $sum: "$playCount" },
                    avgPlays: { $avg: "$playCount" }
                }
            }
        ]);

        res.json({
            success: true,
            totalPlays: stats[0]?.totalPlays || 0,
            avgPlays: Math.round(stats[0]?.avgPlays || 0)
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
