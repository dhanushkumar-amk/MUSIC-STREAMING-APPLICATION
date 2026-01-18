import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v2 as cloudinary } from 'cloudinary';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

class HLSService {
    constructor() {
        this.tempDir = path.join(process.cwd(), 'temp', 'hls');
        this.ensureTempDir();
    }

    async ensureTempDir() {
        try {
            await mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Error creating temp directory:', error);
        }
    }

    /**
     * Transcode audio file to HLS format with multiple quality levels
     * @param {string} inputPath - Path to input audio file
     * @param {string} songId - Unique song identifier
     * @returns {Promise<Object>} - HLS playlist URLs and metadata
     */
    async transcodeToHLS(inputPath, songId) {
        const outputDir = path.join(this.tempDir, songId);

        try {
            // Create output directory
            await mkdir(outputDir, { recursive: true });

            // Define quality levels (bitrates in kbps)
            const qualities = [
                { name: 'low', bitrate: '64k', suffix: '_64k' },
                { name: 'medium', bitrate: '128k', suffix: '_128k' },
                { name: 'high', bitrate: '256k', suffix: '_256k' },
                { name: 'ultra', bitrate: '320k', suffix: '_320k' }
            ];

            // Transcode each quality level
            const transcodePromises = qualities.map(quality =>
                this.transcodeQuality(inputPath, outputDir, songId, quality)
            );

            await Promise.all(transcodePromises);

            // Create master playlist
            const masterPlaylist = this.createMasterPlaylist(qualities, songId);
            const masterPath = path.join(outputDir, 'master.m3u8');
            fs.writeFileSync(masterPath, masterPlaylist);

            // Upload to Cloudinary
            const hlsUrls = await this.uploadToCloudinary(outputDir, songId);

            // Cleanup temp files
            await this.cleanupDirectory(outputDir);

            return {
                success: true,
                masterPlaylistUrl: hlsUrls.masterPlaylist,
                qualities: hlsUrls.qualities,
                metadata: {
                    songId,
                    format: 'hls',
                    qualityLevels: qualities.length
                }
            };

        } catch (error) {
            console.error('HLS transcoding error:', error);
            // Cleanup on error
            try {
                await this.cleanupDirectory(outputDir);
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
            throw error;
        }
    }

    /**
     * Transcode single quality level
     */
    transcodeQuality(inputPath, outputDir, songId, quality) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(outputDir, `${songId}${quality.suffix}.m3u8`);

            ffmpeg(inputPath)
                .audioCodec('aac')
                .audioBitrate(quality.bitrate)
                .audioChannels(2)
                .audioFrequency(44100)
                .format('hls')
                .outputOptions([
                    '-hls_time 10',                    // 10 second segments
                    '-hls_list_size 0',                // Keep all segments in playlist
                    '-hls_segment_filename',
                    path.join(outputDir, `${songId}${quality.suffix}_%03d.ts`)
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log(`Transcoding ${quality.name}: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    console.log(`${quality.name}: ${progress.percent?.toFixed(2)}% done`);
                })
                .on('end', () => {
                    console.log(`${quality.name} transcoding completed`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error(`${quality.name} transcoding error:`, err);
                    reject(err);
                })
                .run();
        });
    }

    /**
     * Create master playlist for adaptive bitrate streaming
     */
    createMasterPlaylist(qualities, songId) {
        let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

        qualities.forEach(quality => {
            const bandwidth = parseInt(quality.bitrate) * 1000; // Convert to bits
            playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=0x0\n`;
            playlist += `${songId}${quality.suffix}.m3u8\n\n`;
        });

        return playlist;
    }

    /**
     * Upload HLS files to Cloudinary
     */
    async uploadToCloudinary(outputDir, songId) {
        try {
            const files = await readdir(outputDir);
            const uploadPromises = [];
            const urls = {
                masterPlaylist: null,
                qualities: {}
            };

            for (const file of files) {
                const filePath = path.join(outputDir, file);
                const cloudinaryPath = `hls/${songId}/${file}`;

                // Determine resource type
                const resourceType = file.endsWith('.m3u8') ? 'raw' : 'raw';

                const uploadPromise = cloudinary.uploader.upload(filePath, {
                    resource_type: resourceType,
                    public_id: cloudinaryPath,
                    folder: 'music-streaming/hls',
                    overwrite: true
                }).then(result => {
                    if (file === 'master.m3u8') {
                        urls.masterPlaylist = result.secure_url;
                    } else if (file.endsWith('.m3u8')) {
                        const qualityMatch = file.match(/_(\d+k)/);
                        if (qualityMatch) {
                            urls.qualities[qualityMatch[1]] = result.secure_url;
                        }
                    }
                    return result;
                });

                uploadPromises.push(uploadPromise);
            }

            await Promise.all(uploadPromises);
            return urls;

        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    /**
     * Cleanup temporary directory
     */
    async cleanupDirectory(dirPath) {
        try {
            const files = await readdir(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                await unlink(filePath);
            }

            await rmdir(dirPath);
            console.log(`Cleaned up directory: ${dirPath}`);
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Get audio metadata using FFmpeg
     */
    getAudioMetadata(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                    resolve({
                        duration: metadata.format.duration,
                        bitrate: metadata.format.bit_rate,
                        sampleRate: audioStream?.sample_rate,
                        channels: audioStream?.channels,
                        codec: audioStream?.codec_name
                    });
                }
            });
        });
    }

    /**
     * Check if FFmpeg is available
     */
    async checkFFmpegAvailability() {
        return new Promise((resolve) => {
            ffmpeg.getAvailableFormats((err, formats) => {
                if (err) {
                    resolve({ available: false, error: err.message });
                } else {
                    resolve({ available: true, formats: Object.keys(formats).length });
                }
            });
        });
    }
}

export default new HLSService();
