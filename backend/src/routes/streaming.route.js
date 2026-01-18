import express from 'express';
import {
    processHLSTranscoding,
    getHLSStream,
    getStreamingStats,
    batchProcessHLS,
    checkStreamingHealth
} from '../controllers/streaming.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/streaming/process/:songId
 * @desc    Process a song for HLS streaming
 * @access  Private (Admin)
 */
router.post('/process/:songId', authenticateToken, processHLSTranscoding);

/**
 * @route   POST /api/streaming/batch-process
 * @desc    Batch process multiple songs for HLS
 * @access  Private (Admin)
 */
router.post('/batch-process', authenticateToken, batchProcessHLS);

/**
 * @route   GET /api/streaming/hls/:songId
 * @desc    Get HLS streaming URL for a song
 * @access  Public
 */
router.get('/hls/:songId', getHLSStream);

/**
 * @route   GET /api/streaming/stats
 * @desc    Get streaming statistics
 * @access  Private (Admin)
 */
router.get('/stats', authenticateToken, getStreamingStats);

/**
 * @route   GET /api/streaming/health
 * @desc    Check streaming service health
 * @access  Public
 */
router.get('/health', checkStreamingHealth);

export default router;
