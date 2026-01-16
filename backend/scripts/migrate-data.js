import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Import your MongoDB models
import User from '../src/models/user.model.js';
import UserSettings from '../src/models/userSettings.model.js';
import Playlist from '../src/models/playlist.model.js';
import Library from '../src/models/library.model.js';
import Session from '../src/models/session.model.js';
import ChatMessage from '../src/models/chatMessage.model.js';
import RecentlyPlayed from '../src/models/recentlyPlayed.model.js';
import RecentSearch from '../src/models/recentSearch.model.js';
import Recommendation from '../src/models/recommendation.model.js';
import Lyrics from '../src/models/lyrics.model.js';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Migration statistics
const stats = {
  users: 0,
  userSettings: 0,
  playlists: 0,
  libraries: 0,
  sessions: 0,
  sessionParticipants: 0,
  chatMessages: 0,
  recentlyPlayed: 0,
  recentSearches: 0,
  recommendations: 0,
  lyrics: 0,
  errors: 0,
};

// ==================== MIGRATION FUNCTIONS ====================

async function migrateUsers() {
  log('\n📦 Migrating Users...', 'blue');
  const users = await User.find({});
  log(`Found ${users.length} users to migrate`, 'cyan');

  for (const user of users) {
    try {
      await prisma.user.create({
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          password: user.password,
          avatar: user.avatar,
          bio: user.bio,
          isEmailVerified: user.isEmailVerified,
          refreshToken: user.refreshToken,
          otp: user.otp,
          otpExpiry: user.otpExpiry,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      stats.users++;
    } catch (error) {
      log(`❌ Error migrating user ${user.email}: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.users} users`, 'green');
}

async function migrateUserSettings() {
  log('\n📦 Migrating User Settings...', 'blue');
  const settings = await UserSettings.find({});
  log(`Found ${settings.length} user settings to migrate`, 'cyan');

  for (const setting of settings) {
    try {
      await prisma.userSettings.create({
        data: {
          userId: setting.userId.toString(),
          audioQuality: setting.audioQuality,
          crossfadeDuration: setting.crossfadeDuration,
          gaplessPlayback: setting.gaplessPlayback,
          normalizeVolume: setting.normalizeVolume,
          playbackSpeed: setting.playbackSpeed,
          equalizerEnabled: setting.equalizerEnabled,
          equalizerPreset: setting.equalizerPreset,
          band32: setting.equalizerBands?.band32 || 0,
          band64: setting.equalizerBands?.band64 || 0,
          band125: setting.equalizerBands?.band125 || 0,
          band250: setting.equalizerBands?.band250 || 0,
          band500: setting.equalizerBands?.band500 || 0,
          band1k: setting.equalizerBands?.band1k || 0,
          band2k: setting.equalizerBands?.band2k || 0,
          band4k: setting.equalizerBands?.band4k || 0,
          band8k: setting.equalizerBands?.band8k || 0,
          band16k: setting.equalizerBands?.band16k || 0,
          lyricsEnabled: setting.lyricsEnabled,
          lyricsLanguage: setting.lyricsLanguage,
          createdAt: setting.createdAt,
          updatedAt: setting.updatedAt,
        },
      });
      stats.userSettings++;
    } catch (error) {
      log(`❌ Error migrating user settings: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.userSettings} user settings`, 'green');
}

async function migratePlaylists() {
  log('\n📦 Migrating Playlists...', 'blue');
  const playlists = await Playlist.find({});
  log(`Found ${playlists.length} playlists to migrate`, 'cyan');

  for (const playlist of playlists) {
    try {
      const data = {
        id: playlist._id.toString(),
        userId: playlist.userId.toString(),
        name: playlist.name,
        desc: playlist.desc || '',
        banner: playlist.banner,
        songIds: playlist.songs ? playlist.songs.map(id => id.toString()) : [],
        isPublic: playlist.isPublic,
        collaborative: playlist.collaborative,
        shuffleEnabled: playlist.shuffleEnabled,
        loopMode: playlist.loopMode,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
      };

      // Create playlist
      const created = await prisma.playlist.create({ data });

      // Connect collaborators if any
      if (playlist.collaborators && playlist.collaborators.length > 0) {
        await prisma.playlist.update({
          where: { id: created.id },
          data: {
            collaborators: {
              connect: playlist.collaborators.map(id => ({ id: id.toString() })),
            },
          },
        });
      }

      stats.playlists++;
    } catch (error) {
      log(`❌ Error migrating playlist ${playlist.name}: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.playlists} playlists`, 'green');
}

async function migrateLibraries() {
  log('\n📦 Migrating Libraries...', 'blue');
  const libraries = await Library.find({});
  log(`Found ${libraries.length} libraries to migrate`, 'cyan');

  for (const library of libraries) {
    try {
      await prisma.library.create({
        data: {
          userId: library.userId.toString(),
          likedSongIds: library.likedSongs ? library.likedSongs.map(id => id.toString()) : [],
          likedAlbumIds: library.likedAlbums ? library.likedAlbums.map(id => id.toString()) : [],
          createdAt: library.createdAt,
          updatedAt: library.updatedAt,
        },
      });
      stats.libraries++;
    } catch (error) {
      log(`❌ Error migrating library: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.libraries} libraries`, 'green');
}

async function migrateSessions() {
  log('\n📦 Migrating Sessions...', 'blue');
  const sessions = await Session.find({});
  log(`Found ${sessions.length} sessions to migrate`, 'cyan');

  for (const session of sessions) {
    try {
      // Create session
      const created = await prisma.session.create({
        data: {
          id: session._id.toString(),
          sessionCode: session.sessionCode,
          name: session.name,
          hostId: session.hostId.toString(),
          isActive: session.isActive,
          privacy: session.privacy,
          currentSongId: session.currentSong?.toString(),
          currentTime: session.currentTime || 0,
          isPlaying: session.isPlaying,
          queueIds: session.queue ? session.queue.map(id => id.toString()) : [],
          allowGuestControl: session.settings?.allowGuestControl ?? true,
          allowQueueAdd: session.settings?.allowQueueAdd ?? true,
          maxParticipants: session.settings?.maxParticipants ?? 10,
          lastUpdate: session.lastUpdate,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        },
      });

      stats.sessions++;

      // Migrate participants
      if (session.participants && session.participants.length > 0) {
        for (const participant of session.participants) {
          try {
            await prisma.sessionParticipant.create({
              data: {
                sessionId: created.id,
                userId: participant.userId.toString(),
                joinedAt: participant.joinedAt,
                isOnline: participant.isOnline,
                canControl: participant.permissions?.canControl ?? true,
                canAddToQueue: participant.permissions?.canAddToQueue ?? true,
              },
            });
            stats.sessionParticipants++;
          } catch (error) {
            log(`❌ Error migrating session participant: ${error.message}`, 'red');
            stats.errors++;
          }
        }
      }
    } catch (error) {
      log(`❌ Error migrating session ${session.sessionCode}: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.sessions} sessions with ${stats.sessionParticipants} participants`, 'green');
}

async function migrateChatMessages() {
  log('\n📦 Migrating Chat Messages...', 'blue');
  const messages = await ChatMessage.find({});
  log(`Found ${messages.length} chat messages to migrate`, 'cyan');

  for (const message of messages) {
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId: message.sessionId.toString(),
          userId: message.userId.toString(),
          message: message.message,
          type: message.type,
          songContextId: message.songContext?.songId?.toString(),
          songTimestamp: message.songContext?.timestamp,
          reactions: message.reactions || [],
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        },
      });
      stats.chatMessages++;
    } catch (error) {
      log(`❌ Error migrating chat message: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.chatMessages} chat messages`, 'green');
}

async function migrateRecentlyPlayed() {
  log('\n📦 Migrating Recently Played...', 'blue');
  const records = await RecentlyPlayed.find({});
  log(`Found ${records.length} recently played records to migrate`, 'cyan');

  for (const record of records) {
    try {
      await prisma.recentlyPlayed.create({
        data: {
          userId: record.userId.toString(),
          songId: record.songId.toString(),
          playDuration: record.playDuration || 0,
          skipped: record.skipped || false,
          contextType: record.contextType,
          contextId: record.contextId,
          playedAt: record.playedAt,
          createdAt: record.createdAt || record.playedAt,
          updatedAt: record.updatedAt || record.playedAt,
        },
      });
      stats.recentlyPlayed++;
    } catch (error) {
      log(`❌ Error migrating recently played: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.recentlyPlayed} recently played records`, 'green');
}

async function migrateRecentSearches() {
  log('\n📦 Migrating Recent Searches...', 'blue');
  const searches = await RecentSearch.find({});
  log(`Found ${searches.length} recent searches to migrate`, 'cyan');

  for (const search of searches) {
    try {
      await prisma.recentSearch.create({
        data: {
          userId: search.userId.toString(),
          query: search.query,
          type: search.type,
          resultId: search.resultId?.toString(),
          searchedAt: search.searchedAt,
          createdAt: search.createdAt || search.searchedAt,
        },
      });
      stats.recentSearches++;
    } catch (error) {
      log(`❌ Error migrating recent search: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.recentSearches} recent searches`, 'green');
}

async function migrateRecommendations() {
  log('\n📦 Migrating Recommendations...', 'blue');
  const recommendations = await Recommendation.find({});
  log(`Found ${recommendations.length} recommendations to migrate`, 'cyan');

  for (const rec of recommendations) {
    try {
      await prisma.recommendation.create({
        data: {
          songId: rec.songId.toString(),
          globalPlayCount: rec.globalPlayCount || 0,
          globalSkipCount: rec.globalSkipCount || 0,
          weightedScore: rec.weightedScore || 0,
        },
      });
      stats.recommendations++;
    } catch (error) {
      log(`❌ Error migrating recommendation: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.recommendations} recommendations`, 'green');
}

async function migrateLyrics() {
  log('\n📦 Migrating Lyrics...', 'blue');
  const lyrics = await Lyrics.find({});
  log(`Found ${lyrics.length} lyrics to migrate`, 'cyan');

  for (const lyric of lyrics) {
    try {
      await prisma.lyrics.create({
        data: {
          songId: lyric.songId.toString(),
          plainLyrics: lyric.plainLyrics || '',
          syncedLyrics: lyric.syncedLyrics || [],
          language: lyric.language,
          source: lyric.source,
          isVerified: lyric.isVerified,
          createdAt: lyric.createdAt,
          updatedAt: lyric.updatedAt,
        },
      });
      stats.lyrics++;
    } catch (error) {
      log(`❌ Error migrating lyrics: ${error.message}`, 'red');
      stats.errors++;
    }
  }

  log(`✅ Migrated ${stats.lyrics} lyrics`, 'green');
}

// ==================== MAIN MIGRATION ====================

async function main() {
  const startTime = Date.now();

  try {
    log('\n🚀 Starting migration from MongoDB to PostgreSQL...\n', 'bright');
    log('⚠️  Make sure you have backed up your MongoDB database!', 'yellow');
    log('⚠️  This process may take a while depending on data size.\n', 'yellow');

    // Connect to MongoDB
    log('📡 Connecting to MongoDB...', 'blue');
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB\n', 'green');

    // Run migrations in order (respecting foreign key constraints)
    await migrateUsers();
    await migrateUserSettings();
    await migratePlaylists();
    await migrateLibraries();
    await migrateSessions();
    await migrateChatMessages();
    await migrateRecentlyPlayed();
    await migrateRecentSearches();
    await migrateRecommendations();
    await migrateLyrics();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('\n' + '='.repeat(60), 'bright');
    log('📊 MIGRATION SUMMARY', 'bright');
    log('='.repeat(60), 'bright');
    log(`Users:                ${stats.users}`, 'cyan');
    log(`User Settings:        ${stats.userSettings}`, 'cyan');
    log(`Playlists:            ${stats.playlists}`, 'cyan');
    log(`Libraries:            ${stats.libraries}`, 'cyan');
    log(`Sessions:             ${stats.sessions}`, 'cyan');
    log(`Session Participants: ${stats.sessionParticipants}`, 'cyan');
    log(`Chat Messages:        ${stats.chatMessages}`, 'cyan');
    log(`Recently Played:      ${stats.recentlyPlayed}`, 'cyan');
    log(`Recent Searches:      ${stats.recentSearches}`, 'cyan');
    log(`Recommendations:      ${stats.recommendations}`, 'cyan');
    log(`Lyrics:               ${stats.lyrics}`, 'cyan');
    log('='.repeat(60), 'bright');
    log(`Total Records:        ${Object.values(stats).reduce((a, b) => a + b, 0) - stats.errors}`, 'green');
    log(`Errors:               ${stats.errors}`, stats.errors > 0 ? 'red' : 'green');
    log(`Duration:             ${duration}s`, 'cyan');
    log('='.repeat(60) + '\n', 'bright');

    if (stats.errors === 0) {
      log('✅ Migration completed successfully!', 'green');
      log('\n📝 Next steps:', 'bright');
      log('  1. Verify data in Prisma Studio: npx prisma studio', 'cyan');
      log('  2. Update your controllers to use Prisma', 'cyan');
      log('  3. Test your application thoroughly', 'cyan');
      log('  4. Keep MongoDB backup for at least 30 days\n', 'cyan');
    } else {
      log('⚠️  Migration completed with errors. Please review the logs above.', 'yellow');
      log('   You may need to manually fix some records.\n', 'yellow');
    }

  } catch (error) {
    log('\n❌ Migration failed:', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
    log('👋 Disconnected from databases\n', 'cyan');
  }
}

// Run migration
main();
