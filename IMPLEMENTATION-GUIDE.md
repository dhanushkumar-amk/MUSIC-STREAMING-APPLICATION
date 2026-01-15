# 🏗️ Detailed Implementation Guide - PostgreSQL Migration
## Step-by-Step Technical Implementation

---

## 📋 Prerequisites Checklist

### Accounts to Create (All Free)
- [ ] **Neon** - https://neon.tech (PostgreSQL)
- [ ] **Upstash** - https://upstash.com (Redis)
- [ ] **Railway** - https://railway.app (Backend hosting)
- [ ] **Cloudflare** - https://cloudflare.com (CDN + Pages)
- [ ] **MeiliSearch Cloud** - https://cloud.meilisearch.com (Search)
- [ ] **Better Stack** - https://betterstack.com (Monitoring)

### Environment Variables Needed
```env
# Database
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# Redis Cache
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXxxx"

# MeiliSearch
MEILI_HOST="https://xxx.meilisearch.io"
MEILI_MASTER_KEY="xxx"

# Cloudinary (existing)
CLOUDINARY_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"

# JWT (existing)
JWT_SECRET="xxx"
JWT_REFRESH_SECRET="xxx"

# Email (existing)
RESEND_API_KEY="xxx"
```

---

## 🗄️ Phase 1: Database Setup (Day 1)

### Step 1.1: Create Neon Database

1. **Sign up at Neon.tech**
   ```
   - Go to https://neon.tech
   - Sign up with GitHub/Google
   - Create new project: "music-streaming-app"
   - Select region: US East (lowest latency)
   ```

2. **Get Connection String**
   ```
   - Click "Connection Details"
   - Copy "Connection string"
   - Format: postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

3. **Configure Connection Pooling**
   ```
   Add to connection string:
   ?sslmode=require&connection_limit=100&pool_timeout=20&statement_timeout=30000
   ```

### Step 1.2: Install Prisma

```bash
cd backend

# Install dependencies
npm install @prisma/client@latest prisma@latest
npm install pg

# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env (with DATABASE_URL)
```

### Step 1.3: Create Prisma Schema

**File: `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
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
  collaboratingOn  Playlist[] @relation("PlaylistCollaborators")
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
  audioQuality        String   @default("high")

  // Playback Settings
  crossfadeDuration   Int      @default(0)
  gaplessPlayback     Boolean  @default(true)
  normalizeVolume     Boolean  @default(false)
  playbackSpeed       Float    @default(1.0)

  // Equalizer
  equalizerEnabled    Boolean  @default(false)
  equalizerPreset     String   @default("flat")
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

  songIds         String[]  @default([])

  isPublic        Boolean   @default(false)
  collaborative   Boolean   @default(false)

  collaborators   User[]    @relation("PlaylistCollaborators")

  shuffleEnabled  Boolean   @default(false)
  loopMode        String    @default("off")

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

  isActive        Boolean   @default(true)
  privacy         String    @default("private")

  currentSongId   String?
  currentTime     Float     @default(0)
  isPlaying       Boolean   @default(false)

  queueIds        String[]  @default([])

  allowGuestControl Boolean @default(true)
  allowQueueAdd     Boolean @default(true)
  maxParticipants   Int     @default(10)

  lastUpdate      DateTime  @default(now())
  expiresAt       DateTime

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

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
  type            String    @default("text")

  songContextId   String?
  songTimestamp   Float?

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

  playDuration    Int       @default(0)
  skipped         Boolean   @default(false)
  contextType     String?   @db.VarChar(50)
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
  type            String    @default("query")
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

  syncedLyrics    Json      @default("[]")

  language        String    @default("en") @db.VarChar(10)
  source          String    @default("manual")
  isVerified      Boolean   @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([songId])
  @@map("lyrics")
}
```

### Step 1.4: Generate and Push Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio to verify
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🔄 Phase 2: Data Migration (Day 2-3)

### Step 2.1: Create Migration Script

**File: `backend/scripts/migrate-mongodb-to-postgres.js`**

```javascript
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const prisma = new PrismaClient();
const limit = pLimit(10); // Max 10 concurrent operations

// Import MongoDB models
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

// Migration functions
async function migrateUsers() {
  console.log('📦 Migrating Users...');
  const users = await User.find({}).lean();

  let migrated = 0;
  await Promise.all(
    users.map(user => limit(async () => {
      try {
        await prisma.user.create({
          data: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            avatar: user.avatar,
            bio: user.bio,
            isEmailVerified: user.isEmailVerified || false,
            refreshToken: user.refreshToken,
            otp: user.otp,
            otpExpiry: user.otpExpiry,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date()
          }
        });
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate user ${user.email}:`, error.message);
      }
    }))
  );

  console.log(`✅ Migrated ${migrated}/${users.length} users`);
}

async function migrateUserSettings() {
  console.log('📦 Migrating User Settings...');
  const settings = await UserSettings.find({}).lean();

  let migrated = 0;
  await Promise.all(
    settings.map(setting => limit(async () => {
      try {
        await prisma.userSettings.create({
          data: {
            userId: setting.userId.toString(),
            audioQuality: setting.audioQuality || 'high',
            crossfadeDuration: setting.crossfadeDuration || 0,
            gaplessPlayback: setting.gaplessPlayback !== false,
            normalizeVolume: setting.normalizeVolume || false,
            playbackSpeed: setting.playbackSpeed || 1.0,
            equalizerEnabled: setting.equalizerEnabled || false,
            equalizerPreset: setting.equalizerPreset || 'flat',
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
            lyricsEnabled: setting.lyricsEnabled !== false,
            lyricsLanguage: setting.lyricsLanguage || 'en',
            createdAt: setting.createdAt || new Date(),
            updatedAt: setting.updatedAt || new Date()
          }
        });
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate settings for user ${setting.userId}:`, error.message);
      }
    }))
  );

  console.log(`✅ Migrated ${migrated}/${settings.length} user settings`);
}

async function migratePlaylists() {
  console.log('📦 Migrating Playlists...');
  const playlists = await Playlist.find({}).lean();

  let migrated = 0;
  for (const playlist of playlists) {
    try {
      const data = {
        id: playlist._id.toString(),
        userId: playlist.userId.toString(),
        name: playlist.name,
        desc: playlist.desc || '',
        banner: playlist.banner,
        songIds: (playlist.songs || []).map(id => id.toString()),
        isPublic: playlist.isPublic || false,
        collaborative: playlist.collaborative || false,
        shuffleEnabled: playlist.shuffleEnabled || false,
        loopMode: playlist.loopMode || 'off',
        createdAt: playlist.createdAt || new Date(),
        updatedAt: playlist.updatedAt || new Date()
      };

      const created = await prisma.playlist.create({ data });

      // Connect collaborators
      if (playlist.collaborators && playlist.collaborators.length > 0) {
        await prisma.playlist.update({
          where: { id: created.id },
          data: {
            collaborators: {
              connect: playlist.collaborators.map(id => ({ id: id.toString() }))
            }
          }
        });
      }

      migrated++;
    } catch (error) {
      console.error(`Failed to migrate playlist ${playlist.name}:`, error.message);
    }
  }

  console.log(`✅ Migrated ${migrated}/${playlists.length} playlists`);
}

async function migrateLibraries() {
  console.log('📦 Migrating Libraries...');
  const libraries = await Library.find({}).lean();

  let migrated = 0;
  await Promise.all(
    libraries.map(library => limit(async () => {
      try {
        await prisma.library.create({
          data: {
            userId: library.userId.toString(),
            likedSongIds: (library.likedSongs || []).map(id => id.toString()),
            likedAlbumIds: (library.likedAlbums || []).map(id => id.toString()),
            createdAt: library.createdAt || new Date(),
            updatedAt: library.updatedAt || new Date()
          }
        });
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate library for user ${library.userId}:`, error.message);
      }
    }))
  );

  console.log(`✅ Migrated ${migrated}/${libraries.length} libraries`);
}

async function migrateRecentlyPlayed() {
  console.log('📦 Migrating Recently Played...');
  const records = await RecentlyPlayed.find({}).lean();

  let migrated = 0;
  await Promise.all(
    records.map(record => limit(async () => {
      try {
        await prisma.recentlyPlayed.create({
          data: {
            userId: record.userId.toString(),
            songId: record.songId.toString(),
            playDuration: record.playDuration || 0,
            skipped: record.skipped || false,
            contextType: record.contextType,
            contextId: record.contextId,
            playedAt: record.playedAt || new Date(),
            createdAt: record.createdAt || new Date(),
            updatedAt: record.updatedAt || new Date()
          }
        });
        migrated++;
      } catch (error) {
        console.error(`Failed to migrate recently played:`, error.message);
      }
    }))
  );

  console.log(`✅ Migrated ${migrated}/${records.length} recently played records`);
}

// Main migration function
async function main() {
  try {
    console.log('🚀 Starting MongoDB to PostgreSQL migration...\\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\\n');

    // Run migrations in order
    await migrateUsers();
    await migrateUserSettings();
    await migratePlaylists();
    await migrateLibraries();
    await migrateRecentlyPlayed();
    // Add other migrations as needed

    console.log('\\n✅ Migration completed successfully!');
    console.log('\\n📊 Summary:');
    console.log('- Users migrated');
    console.log('- Settings migrated');
    console.log('- Playlists migrated');
    console.log('- Libraries migrated');
    console.log('- Recently played migrated');

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

### Step 2.2: Run Migration

```bash
# Install p-limit for concurrency control
npm install p-limit

# Run migration
node scripts/migrate-mongodb-to-postgres.js

# Verify in Prisma Studio
npx prisma studio
```

---

## 💻 Phase 3: Code Migration (Day 4-5)

### Step 3.1: Create Database Client

**File: `backend/src/config/database.js`**

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
```

### Step 3.2: Update Server.js

**File: `backend/server.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './src/config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
prisma.$connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Step 3.3: Update Controllers

**Example: User Controller**

**File: `backend/src/controllers/user.controller.js`**

```javascript
import prisma from '../config/database.js';
import redis from '../config/redis.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Check cache
    const cacheKey = `user:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        user: JSON.parse(cached)
      });
    }

    // Query database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cache result (5 minutes)
    await redis.set(cacheKey, JSON.stringify(user), { ex: 300 });

    res.json({ success: true, user });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user details
export const updateDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true
      }
    });

    // Invalidate cache
    await redis.del(`user:${userId}`);

    res.json({ success: true, user });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};
```

**Example: Playlist Controller**

```javascript
import prisma from '../config/database.js';
import redis from '../config/redis.js';

// Get user playlists
export const getPlaylists = async (req, res) => {
  try {
    const userId = req.userId;

    // Check cache
    const cacheKey = `user:${userId}:playlists`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        playlists: JSON.parse(cached)
      });
    }

    // Query database
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        desc: true,
        banner: true,
        songIds: true,
        isPublic: true,
        collaborative: true,
        shuffleEnabled: true,
        loopMode: true,
        createdAt: true
      }
    });

    // Cache result (3 minutes)
    await redis.set(cacheKey, JSON.stringify(playlists), { ex: 180 });

    res.json({ success: true, playlists });

  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playlists'
    });
  }
};

// Create playlist
export const createPlaylist = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, desc } = req.body;

    const playlist = await prisma.playlist.create({
      data: {
        userId,
        name,
        desc: desc || ''
      }
    });

    // Invalidate cache
    await redis.del(`user:${userId}:playlists`);

    res.json({ success: true, playlist });

  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create playlist'
    });
  }
};
```

---

## ⚡ Phase 4: Performance Optimization (Day 6-7)

### Step 4.1: Implement Caching Layer

**File: `backend/src/config/redis.js`**

```javascript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export default redis;
```

### Step 4.2: Add Query Optimization

```javascript
// Use DataLoader for batch loading
import DataLoader from 'dataloader';

const songLoader = new DataLoader(async (songIds) => {
  const songs = await prisma.song.findMany({
    where: { id: { in: songIds } }
  });

  const songMap = new Map(songs.map(s => [s.id, s]));
  return songIds.map(id => songMap.get(id));
});

// Usage in controller
const songs = await songLoader.loadMany(playlist.songIds);
```

### Step 4.3: Add Response Compression

```javascript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024
}));
```

---

## 🚀 Phase 5: Deployment (Day 8-10)

### Step 5.1: Deploy to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL"
   git push
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - New Project → Deploy from GitHub
   - Select your repo
   - Add environment variables
   - Deploy!

### Step 5.2: Deploy Frontend to Cloudflare Pages

```bash
cd client
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages publish dist
```

---

## ✅ Verification Checklist

- [ ] Database schema created
- [ ] Data migrated successfully
- [ ] All controllers updated
- [ ] Caching implemented
- [ ] Performance optimized
- [ ] Deployed to production
- [ ] Monitoring setup
- [ ] <100ms latency achieved

---

**Ready to start? Follow each phase step-by-step!** 🚀
