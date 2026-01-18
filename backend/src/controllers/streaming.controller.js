import hlsService from '../services/hls.service.js';
import songModel from '../models/songModel.js';
import redis from '../config/redis.js';
import fs from 'fs';
import path from 'path';

/**
 * Process song for HLS streaming
 * This can be called after song upload or as a background job
 */
export const processHLSTranscoding = async (req, res) => {
    try {
        const { songId } = req.params;

        // Get song from database
        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }

        // Check if already processed
        if (song.hlsUrl) {
            return res.json({
                success: true,
                message: 'Song already has HLS streaming',
                hlsUrl: song.hlsUrl,
                qualities: song.hlsQualities
            });
        }

        // Download original file temporarily (if from Cloudinary)
        const tempInputPath = path.join(process.cwd(), 'temp', `${songId}_original.mp3`);

        // For now, we'll use the Cloudinary URL directly
        // In production, you might want to download it first

        res.json({
            success: true,
            message: 'HLS transcoding started',
            songId,
            status: 'processing'
        });

        // Process in background
        processHLSInBackground(songId, song.file);

    } catch (error) {
        console.error('HLS processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Background HLS processing
 */
async function processHLSInBackground(songId, audioUrl) {
    try {
        console.log(`Starting HLS transcoding for song: ${songId}`);

        // Download audio file temporarily
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempInputPath = path.join(tempDir, `${songId}_original.mp3`);

        // Download from Cloudinary
        const response = await fetch(audioUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(tempInputPath, Buffer.from(buffer));

        // Transcode to HLS
        const result = await hlsService.transcodeToHLS(tempInputPath, songId);

        // Update song in database
        await songModel.findByIdAndUpdate(songId, {
            hlsUrl: result.masterPlaylistUrl,
            hlsQualities: result.qualities,
            streamingFormat: 'hls',
            hlsProcessedAt: new Date()
        });

        // Cleanup temp file
        fs.unlinkSync(tempInputPath);

        // Clear cache
        await redis.del(`song:${songId}`);
        await redis.del('songs:all');

        console.log(`HLS transcoding completed for song: ${songId}`);

    } catch (error) {
        console.error(`HLS background processing error for ${songId}:`, error);

        // Update song with error status
        await songModel.findByIdAndUpdate(songId, {
            hlsProcessingError: error.message,
            hlsProcessedAt: new Date()
        });
    }
}

/**
 * Get HLS streaming URL for a song
 */
export const getHLSStream = async (req, res) => {
    try {
        const { songId } = req.params;
        const { quality } = req.query; // Optional: specific quality

        // Check cache first
        const cacheKey = `hls:${songId}:${quality || 'master'}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // Get song from database
        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: 'Song not found'
            });
        }

        // Check if HLS is available
        if (!song.hlsUrl) {
            return res.json({
                success: true,
                hlsAvailable: false,
                fallbackUrl: song.file,
                message: 'HLS not available, using original file'
            });
        }

        const response = {
            success: true,
            hlsAvailable: true,
            masterPlaylist: song.hlsUrl,
            qualities: song.hlsQualities || {},
            fallbackUrl: song.file,
            metadata: {
                songId: song._id,
                name: song.name,
                duration: song.duration,
                format: 'hls'
            }
        };

        // Cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(response), { ex: 3600 });

        res.json(response);

    } catch (error) {
        console.error('Get HLS stream error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get streaming statistics
 */
export const getStreamingStats = async (req, res) => {
    try {
        const stats = await songModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalSongs: { $sum: 1 },
                    hlsEnabled: {
                        $sum: { $cond: [{ $ne: ['$hlsUrl', null] }, 1, 0] }
                    },
                    processingErrors: {
                        $sum: { $cond: [{ $ne: ['$hlsProcessingError', null] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || {
            totalSongs: 0,
            hlsEnabled: 0,
            processingErrors: 0
        };

        res.json({
            success: true,
            stats: {
                ...result,
                hlsPercentage: result.totalSongs > 0
                    ? ((result.hlsEnabled / result.totalSongs) * 100).toFixed(2)
                    : 0
            }
        });

    } catch (error) {
        console.error('Streaming stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Batch process multiple songs for HLS
 */
export const batchProcessHLS = async (req, res) => {
    try {
        const { songIds } = req.body;

        if (!Array.isArray(songIds) || songIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'songIds array is required'
            });
        }

        // Limit batch size
        if (songIds.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 songs per batch'
            });
        }

        // Get songs
        const songs = await songModel.find({
            _id: { $in: songIds },
            hlsUrl: { $exists: false } // Only unprocessed songs
        });

        res.json({
            success: true,
            message: `Processing ${songs.length} songs`,
            songIds: songs.map(s => s._id)
        });

        // Process in background
        for (const song of songs) {
            processHLSInBackground(song._id.toString(), song.file);
        }

    } catch (error) {
        console.error('Batch HLS processing error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Check FFmpeg availability
 */
export const checkStreamingHealth = async (req, res) => {
    try {
        const ffmpegStatus = await hlsService.checkFFmpegAvailability();

        res.json({
            success: true,
            ffmpeg: ffmpegStatus,
            cloudinary: {
                configured: !!process.env.CLOUDINARY_NAME
            },
            redis: {
                connected: redis.status === 'ready'
            }
        });

    } catch (error) {
        console.error('Streaming health check error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
