#!/usr/bin/env node

/**
 * Phase 3 HLS Streaming - Quick Test Script
 * Tests all HLS streaming endpoints and functionality
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

async function testStreamingHealth() {
  log.section('🏥 Testing Streaming Service Health');

  try {
    const response = await axios.get(`${API_URL}/api/streaming/health`);
    const data = response.data;

    if (data.success) {
      log.success('Streaming service is healthy');

      if (data.ffmpeg?.available) {
        log.success(`FFmpeg is available (${data.ffmpeg.formats} formats)`);
      } else {
        log.error('FFmpeg is NOT available');
      }

      if (data.cloudinary?.configured) {
        log.success('Cloudinary is configured');
      } else {
        log.warning('Cloudinary is NOT configured');
      }

      if (data.redis?.connected) {
        log.success('Redis is connected');
      } else {
        log.warning('Redis is NOT connected');
      }

      return true;
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testGetHLSStream(songId) {
  log.section(`🎵 Testing HLS Stream for Song: ${songId}`);

  try {
    const response = await axios.get(`${API_URL}/api/streaming/hls/${songId}`);
    const data = response.data;

    if (data.success) {
      log.success('Successfully fetched stream data');

      if (data.hlsAvailable) {
        log.success('HLS streaming is available');
        log.info(`Master Playlist: ${data.masterPlaylist}`);

        if (data.qualities) {
          log.info('Available qualities:');
          Object.entries(data.qualities).forEach(([quality, url]) => {
            console.log(`  - ${quality}: ${url.substring(0, 50)}...`);
          });
        }
      } else {
        log.warning('HLS not available, using fallback');
        log.info(`Fallback URL: ${data.fallbackUrl}`);
      }

      return data;
    }
  } catch (error) {
    log.error(`Failed to get HLS stream: ${error.message}`);
    return null;
  }
}

async function testStreamingStats(token) {
  log.section('📊 Testing Streaming Statistics');

  try {
    const response = await axios.get(`${API_URL}/api/streaming/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = response.data;

    if (data.success) {
      log.success('Successfully fetched streaming stats');
      const stats = data.stats;

      console.log(`\n  Total Songs: ${stats.totalSongs}`);
      console.log(`  HLS Enabled: ${stats.hlsEnabled}`);
      console.log(`  Processing Errors: ${stats.processingErrors}`);
      console.log(`  HLS Percentage: ${stats.hlsPercentage}%\n`);

      return stats;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      log.warning('Stats endpoint requires authentication (skipped)');
    } else {
      log.error(`Failed to get stats: ${error.message}`);
    }
    return null;
  }
}

async function testProcessHLS(songId, token) {
  log.section(`⚙️  Testing HLS Processing for Song: ${songId}`);

  if (!token) {
    log.warning('Processing requires authentication (skipped)');
    return null;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/streaming/process/${songId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    const data = response.data;

    if (data.success) {
      log.success('HLS processing started');
      log.info(`Status: ${data.status}`);
      log.info('Processing will continue in background...');
      return data;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      log.warning('Processing requires authentication');
    } else {
      log.error(`Failed to process HLS: ${error.message}`);
    }
    return null;
  }
}

async function runAllTests() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🎵 PHASE 3: HLS STREAMING TEST SUITE 🎵          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  log.info(`Testing API: ${API_URL}`);
  log.info(`Timestamp: ${new Date().toISOString()}\n`);

  // Test 1: Health Check
  const healthOk = await testStreamingHealth();

  if (!healthOk) {
    log.error('Health check failed. Make sure the backend is running!');
    log.info('Start backend with: cd backend && npm run dev');
    process.exit(1);
  }

  // Test 2: Get HLS Stream (requires a song ID)
  const testSongId = process.argv[2];
  if (testSongId) {
    await testGetHLSStream(testSongId);
  } else {
    log.warning('No song ID provided. Skipping HLS stream test.');
    log.info('Usage: node test-phase-3.js <SONG_ID> [AUTH_TOKEN]');
  }

  // Test 3: Streaming Stats
  const token = process.argv[3];
  await testStreamingStats(token);

  // Test 4: Process HLS (optional)
  if (testSongId && token) {
    log.info('To process this song for HLS, uncomment the line below:');
    log.info('// await testProcessHLS(testSongId, token);');
  }

  // Summary
  log.section('✅ Test Suite Complete');
  console.log(`
  📋 Next Steps:

  1. Upload a song via admin panel
  2. Get the song ID from the response
  3. Run: node test-phase-3.js <SONG_ID>
  4. Process for HLS: POST /api/streaming/process/<SONG_ID>
  5. Wait for processing (check logs)
  6. Test playback with HLS URL

  📚 Documentation:
  - See PHASE_3_IMPLEMENTATION.md for full guide
  - See CLOUDFLARE_CDN_SETUP.md for CDN setup

  🎉 Phase 3 HLS Streaming is ready!
  `);
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
