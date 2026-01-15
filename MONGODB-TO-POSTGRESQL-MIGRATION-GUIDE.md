# MongoDB to PostgreSQL (Neon) Migration Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Set Up Neon PostgreSQL](#step-1-set-up-neon-postgresql)
4. [Step 2: Install Required Dependencies](#step-2-install-required-dependencies)
5. [Step 3: Create PostgreSQL Schema](#step-3-create-postgresql-schema)
6. [Step 4: Update Models with Prisma](#step-4-update-models-with-prisma)
7. [Step 5: Data Migration Script](#step-5-data-migration-script)
8. [Step 6: Update Backend Code](#step-6-update-backend-code)
9. [Step 7: Testing](#step-7-testing)
10. [Rollback Plan](#rollback-plan)

---

## Overview

This guide will help you migrate your music streaming application from MongoDB to PostgreSQL using Neon (a serverless PostgreSQL platform). We'll use **Prisma ORM** for database management, which provides excellent TypeScript support and migration tools.

### Why PostgreSQL?
- ✅ ACID compliance for data integrity
- ✅ Better support for complex queries and joins
- ✅ Strong typing and constraints
- ✅ Better performance for relational data
- ✅ Neon provides serverless PostgreSQL with auto-scaling

### Current MongoDB Models
Your application has the following models:
1. **User** - User accounts and authentication
2. **UserSettings** - User preferences and playback settings
3. **Playlist** - User playlists with songs
4. **Library** - Liked songs and albums
5. **Session** - Collaborative listening sessions
6. **ChatMessage** - Session chat messages
7. **RecentlyPlayed** - User listening history
8. **RecentSearch** - Search history
9. **Recommendation** - Song recommendations
10. **Lyrics** - Song lyrics (plain and synced)

---

## Prerequisites

Before starting:
- ✅ Backup your MongoDB database
- ✅ Have a Neon account (free tier available)
- ✅ Node.js installed
- ✅ Access to your current MongoDB connection string

---

## Step 1: Set Up Neon PostgreSQL

### 1.1 Create a Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 1.2 Get Your Connection String
After creating a project, you'll get a connection string like:
```
postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 1.3 Update .env File
Add the following to your `.env` file:
```env
# Keep your old MongoDB connection for migration
MONGODB_URI=your_existing_mongodb_uri

# Add new PostgreSQL connection
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## Step 2: Install Required Dependencies

### 2.1 Install Prisma and PostgreSQL Driver
```bash
cd backend
npm install prisma @prisma/client
npm install pg
npm uninstall mongoose
```

### 2.2 Initialize Prisma
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- Updates `.env` with `DATABASE_URL`

---

## Step 3: Create PostgreSQL Schema

### 3.1 Update `prisma/schema.prisma`

Replace the content with the following schema that matches your MongoDB models:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER MODELS ====================

model User {
  id              String    @id @default(cuid())
  name            String?   @db.VarChar(100)
  email           String    @unique @db.VarChar(255)
  password        String    @db.VarChar(255)
  avatar          String?
  bio             String?   @db.VarChar(500)
  isEmailVerified Boolean   @default(false)
  refreshToken    String?   @db.Text
  otp             String?   @db.VarChar(10)
  otpExpiry       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  settings         UserSettings?
  playlists        Playlist[]
  library          Library?
  sessions         Session[]
  chatMessages     ChatMessage[]
  recentlyPlayed   RecentlyPlayed[]
  recentSearches   RecentSearch[]

  // Collaborative playlists
  collaboratingOn  Playlist[] @relation("PlaylistCollaborators")

  // Session participants
  sessionParticipants SessionParticipant[]

  @@index([email])
  @@index([createdAt(sort: Desc)])
  @@map("users")
}

model UserSettings {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Audio Quality
  audioQuality        String   @default("high") // low, medium, high, very_high

  // Playback Settings
  crossfadeDuration   Int      @default(0) // 0-12 seconds
  gaplessPlayback     Boolean  @default(true)
  normalizeVolume     Boolean  @default(false)
  playbackSpeed       Float    @default(1.0) // 0.5-2.0

  // Equalizer
  equalizerEnabled    Boolean  @default(false)
  equalizerPreset     String   @default("flat") // flat, rock, pop, jazz, classical, electronic, hip-hop, custom

  // Equalizer Bands (-12 to +12)
  band32              Int      @default(0)
  band64              Int      @default(0)
  band125             Int      @default(0)
  band250             Int      @default(0)
  band500             Int      @default(0)
  band1k              Int      @default(0)
  band2k              Int      @default(0)
  band4k              Int      @default(0)
  band8k              Int      @default(0)
  band16k             Int      @default(0)

  // Lyrics
  lyricsEnabled       Boolean  @default(true)
  lyricsLanguage      String   @default("en") @db.VarChar(10)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@map("user_settings")
}

// ==================== PLAYLIST MODELS ====================

model Playlist {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String    @db.VarChar(255)
  desc            String    @default("") @db.Text
  banner          String?

  // Songs stored as array of IDs (referencing external song collection)
  songIds         String[]  @default([])

  isPublic        Boolean   @default(false)
  collaborative   Boolean   @default(false)

  // Collaborators
  collaborators   User[]    @relation("PlaylistCollaborators")

  shuffleEnabled  Boolean   @default(false)
  loopMode        String    @default("off") // off, one, all

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, createdAt(sort: Desc)])
  @@index([isPublic])
  @@map("playlists")
}

// ==================== LIBRARY MODEL ====================

model Library {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Store as arrays of song/album IDs
  likedSongIds    String[]  @default([])
  likedAlbumIds   String[]  @default([])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("libraries")
}

// ==================== SESSION MODELS ====================

model Session {
  id              String    @id @default(cuid())
  sessionCode     String    @unique @db.VarChar(10)
  name            String    @default("Listening Party") @db.VarChar(255)
  hostId          String
  host            User      @relation(fields: [hostId], references: [id], onDelete: Cascade)

  isActive        Boolean   @default(true)
  privacy         String    @default("private") // public, private, friends-only

  // Current playback state
  currentSongId   String?
  currentTime     Float     @default(0)
  isPlaying       Boolean   @default(false)

  // Queue (array of song IDs)
  queueIds        String[]  @default([])

  // Settings
  allowGuestControl Boolean @default(true)
  allowQueueAdd     Boolean @default(true)
  maxParticipants   Int     @default(10)

  lastUpdate      DateTime  @default(now())
  expiresAt       DateTime  @default(dbgenerated("NOW() + INTERVAL '24 hours'"))

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  participants    SessionParticipant[]
  chatMessages    ChatMessage[]

  @@index([sessionCode])
  @@index([expiresAt])
  @@map("sessions")
}

model SessionParticipant {
  id              String    @id @default(cuid())
  sessionId       String
  session         Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  joinedAt        DateTime  @default(now())
  isOnline        Boolean   @default(true)

  // Permissions
  canControl      Boolean   @default(true)
  canAddToQueue   Boolean   @default(true)

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@map("session_participants")
}

model ChatMessage {
  id              String    @id @default(cuid())
  sessionId       String
  session         Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  message         String    @db.VarChar(500)
  type            String    @default("text") // text, system, reaction, song

  // Song context (optional)
  songContextId   String?
  songTimestamp   Float?

  // Reactions stored as JSON
  reactions       Json      @default("[]")

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([sessionId, createdAt(sort: Desc)])
  @@map("chat_messages")
}

// ==================== HISTORY MODELS ====================

model RecentlyPlayed {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  songId          String

  playDuration    Int       @default(0) // seconds
  skipped         Boolean   @default(false)
  contextType     String?   @db.VarChar(50) // playlist, album, liked, search
  contextId       String?

  playedAt        DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, playedAt(sort: Desc)])
  @@map("recently_played")
}

model RecentSearch {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  query           String    @db.VarChar(255)
  type            String    @default("query") // song, album, user, query
  resultId        String?

  searchedAt      DateTime  @default(now())
  createdAt       DateTime  @default(now())

  @@index([userId, searchedAt(sort: Desc)])
  @@map("recent_searches")
}

// ==================== RECOMMENDATION MODEL ====================

model Recommendation {
  id                String    @id @default(cuid())
  songId            String    @unique

  globalPlayCount   Int       @default(0)
  globalSkipCount   Int       @default(0)
  weightedScore     Float     @default(0)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([songId])
  @@index([weightedScore(sort: Desc)])
  @@map("recommendations")
}

// ==================== LYRICS MODEL ====================

model Lyrics {
  id              String    @id @default(cuid())
  songId          String    @unique

  plainLyrics     String    @default("") @db.Text

  // Synced lyrics stored as JSON array
  syncedLyrics    Json      @default("[]")

  language        String    @default("en") @db.VarChar(10)
  source          String    @default("manual") // manual, musixmatch, genius, lrclib, other
  isVerified      Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([songId])
  @@map("lyrics")
}
```

### 3.2 Generate Prisma Client
```bash
npx prisma generate
```

### 3.3 Create Database Tables
```bash
npx prisma db push
```

Or use migrations (recommended for production):
```bash
npx prisma migrate dev --name init
```

---

## Step 4: Update Models with Prisma

### 4.1 Create Prisma Client Instance

Create `src/config/database.js`:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

### 4.2 Remove MongoDB Connection

Update `server.js` - remove:
```javascript
import connectDB from "./src/config/mongodb.js";
connectDB();
```

Add:
```javascript
import prisma from "./src/config/database.js";

// Test database connection
prisma.$connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));
```

---

## Step 5: Data Migration Script

Create `scripts/migrate-data.js`:

```javascript
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

async function migrateUsers() {
  console.log('📦 Migrating Users...');
  const users = await User.find({});

  for (const user of users) {
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
  }

  console.log(`✅ Migrated ${users.length} users`);
}

async function migrateUserSettings() {
  console.log('📦 Migrating User Settings...');
  const settings = await UserSettings.find({});

  for (const setting of settings) {
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
  }

  console.log(`✅ Migrated ${settings.length} user settings`);
}

async function migratePlaylists() {
  console.log('📦 Migrating Playlists...');
  const playlists = await Playlist.find({});

  for (const playlist of playlists) {
    const data = {
      id: playlist._id.toString(),
      userId: playlist.userId.toString(),
      name: playlist.name,
      desc: playlist.desc,
      banner: playlist.banner,
      songIds: playlist.songs.map(id => id.toString()),
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
  }

  console.log(`✅ Migrated ${playlists.length} playlists`);
}

async function migrateLibraries() {
  console.log('📦 Migrating Libraries...');
  const libraries = await Library.find({});

  for (const library of libraries) {
    await prisma.library.create({
      data: {
        userId: library.userId.toString(),
        likedSongIds: library.likedSongs.map(id => id.toString()),
        likedAlbumIds: library.likedAlbums.map(id => id.toString()),
        createdAt: library.createdAt,
        updatedAt: library.updatedAt,
      },
    });
  }

  console.log(`✅ Migrated ${libraries.length} libraries`);
}

async function migrateSessions() {
  console.log('📦 Migrating Sessions...');
  const sessions = await Session.find({});

  for (const session of sessions) {
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
        currentTime: session.currentTime,
        isPlaying: session.isPlaying,
        queueIds: session.queue.map(id => id.toString()),
        allowGuestControl: session.settings?.allowGuestControl ?? true,
        allowQueueAdd: session.settings?.allowQueueAdd ?? true,
        maxParticipants: session.settings?.maxParticipants ?? 10,
        lastUpdate: session.lastUpdate,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });

    // Migrate participants
    if (session.participants && session.participants.length > 0) {
      for (const participant of session.participants) {
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
      }
    }
  }

  console.log(`✅ Migrated ${sessions.length} sessions`);
}

async function migrateChatMessages() {
  console.log('📦 Migrating Chat Messages...');
  const messages = await ChatMessage.find({});

  for (const message of messages) {
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
  }

  console.log(`✅ Migrated ${messages.length} chat messages`);
}

async function migrateRecentlyPlayed() {
  console.log('📦 Migrating Recently Played...');
  const records = await RecentlyPlayed.find({});

  for (const record of records) {
    await prisma.recentlyPlayed.create({
      data: {
        userId: record.userId.toString(),
        songId: record.songId.toString(),
        playDuration: record.playDuration,
        skipped: record.skipped,
        contextType: record.contextType,
        contextId: record.contextId,
        playedAt: record.playedAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
    });
  }

  console.log(`✅ Migrated ${records.length} recently played records`);
}

async function migrateRecentSearches() {
  console.log('📦 Migrating Recent Searches...');
  const searches = await RecentSearch.find({});

  for (const search of searches) {
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
  }

  console.log(`✅ Migrated ${searches.length} recent searches`);
}

async function migrateRecommendations() {
  console.log('📦 Migrating Recommendations...');
  const recommendations = await Recommendation.find({});

  for (const rec of recommendations) {
    await prisma.recommendation.create({
      data: {
        songId: rec.songId.toString(),
        globalPlayCount: rec.globalPlayCount,
        globalSkipCount: rec.globalSkipCount,
        weightedScore: rec.weightedScore,
      },
    });
  }

  console.log(`✅ Migrated ${recommendations.length} recommendations`);
}

async function migrateLyrics() {
  console.log('📦 Migrating Lyrics...');
  const lyrics = await Lyrics.find({});

  for (const lyric of lyrics) {
    await prisma.lyrics.create({
      data: {
        songId: lyric.songId.toString(),
        plainLyrics: lyric.plainLyrics,
        syncedLyrics: lyric.syncedLyrics || [],
        language: lyric.language,
        source: lyric.source,
        isVerified: lyric.isVerified,
        createdAt: lyric.createdAt,
        updatedAt: lyric.updatedAt,
      },
    });
  }

  console.log(`✅ Migrated ${lyrics.length} lyrics`);
}

async function main() {
  try {
    console.log('🚀 Starting migration from MongoDB to PostgreSQL...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

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

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

main();
```

### Run the migration:
```bash
node scripts/migrate-data.js
```

---

## Step 6: Update Backend Code

You'll need to update all your controllers and routes to use Prisma instead of Mongoose. Here's an example:

### Before (Mongoose):
```javascript
// Get user
const user = await User.findById(userId);

// Create user
const newUser = await User.create({ email, password, name });

// Update user
await User.findByIdAndUpdate(userId, { name: newName });

// Delete user
await User.findByIdAndDelete(userId);
```

### After (Prisma):
```javascript
import prisma from '../config/database.js';

// Get user
const user = await prisma.user.findUnique({ where: { id: userId } });

// Create user
const newUser = await prisma.user.create({
  data: { email, password, name }
});

// Update user
await prisma.user.update({
  where: { id: userId },
  data: { name: newName }
});

// Delete user
await prisma.user.delete({ where: { id: userId } });
```

### Key Prisma Methods:
- `findUnique()` - Find by unique field (id, email)
- `findMany()` - Find multiple records
- `create()` - Create new record
- `update()` - Update existing record
- `delete()` - Delete record
- `upsert()` - Update or create
- `count()` - Count records

### Example: Update User Controller

Create `src/controllers/user.controller.prisma.js`:

```javascript
import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        // Exclude password, refreshToken, otp
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Use Prisma aggregations
    const [playlistCount, library, recentlyPlayedCount] = await Promise.all([
      prisma.playlist.count({ where: { userId } }),
      prisma.library.findUnique({ where: { userId } }),
      prisma.recentlyPlayed.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      stats: {
        playlists: playlistCount,
        likedSongs: library?.likedSongIds.length || 0,
        likedAlbums: library?.likedAlbumIds.length || 0,
        recentlyPlayed: recentlyPlayedCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

---

## Step 7: Testing

### 7.1 Test Database Connection
```bash
npx prisma studio
```
This opens a GUI to view your data.

### 7.2 Test API Endpoints
Use Postman or Thunder Client to test:
- User registration/login
- Creating playlists
- Adding songs to library
- Session creation

### 7.3 Run Your Application
```bash
npm run dev
```

---

## Rollback Plan

If something goes wrong:

### 1. Keep MongoDB Running
Don't delete your MongoDB database until you're 100% confident.

### 2. Switch Back to MongoDB
In `server.js`, comment out Prisma and uncomment MongoDB:
```javascript
// import prisma from "./src/config/database.js";
import connectDB from "./src/config/mongodb.js";
connectDB();
```

### 3. Restore from Backup
If needed, restore your MongoDB backup:
```bash
mongorestore --uri="your_mongodb_uri" /path/to/backup
```

---

## Additional Notes

### Performance Optimization
1. **Indexes**: Prisma automatically creates indexes defined in schema
2. **Connection Pooling**: Neon handles this automatically
3. **Query Optimization**: Use `select` to fetch only needed fields

### Neon Features
- **Branching**: Create database branches for testing
- **Auto-scaling**: Scales automatically with traffic
- **Backups**: Automatic daily backups
- **Monitoring**: Built-in query performance monitoring

### Next Steps After Migration
1. Monitor application performance
2. Optimize slow queries using Prisma's query analyzer
3. Set up database backups
4. Configure connection pooling if needed
5. Update documentation

---

## Support Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Neon Docs**: https://neon.tech/docs
- **Prisma Discord**: https://pris.ly/discord
- **Migration Guide**: https://www.prisma.io/docs/guides/migrate-to-prisma

---

## Checklist

- [ ] Neon account created
- [ ] DATABASE_URL added to .env
- [ ] Prisma installed
- [ ] Schema created
- [ ] Database tables created
- [ ] Migration script created
- [ ] Data migrated successfully
- [ ] Controllers updated to use Prisma
- [ ] All routes tested
- [ ] MongoDB backup created
- [ ] Application running successfully
- [ ] Performance monitored

---

**Good luck with your migration! 🚀**
