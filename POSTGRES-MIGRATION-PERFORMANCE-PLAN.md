# 🚀 PostgreSQL Migration & Performance Optimization Plan
## Music Streaming Application - Complete System Design

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [High-Level Design (HLD)](#high-level-design-hld)
4. [Low-Level Design (LLD)](#low-level-design-lld)
5. [Database Migration Strategy](#database-migration-strategy)
6. [Performance Optimization](#performance-optimization)
7. [Free-Tier Cloud Services](#free-tier-cloud-services)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Monitoring & Observability](#monitoring--observability)

---

## 🎯 Executive Summary

### Objectives
- ✅ **Migrate from MongoDB to PostgreSQL** (Neon serverless)
- ✅ **Achieve <100ms latency** for all API endpoints
- ✅ **Scalable architecture** supporting 10,000+ concurrent users
- ✅ **100% free-tier** cloud services (AWS, Cloudflare, etc.)
- ✅ **Maintain all existing features** without breaking changes
- ✅ **Production-ready** with monitoring and observability

### Target Metrics
| Metric | Current | Target |
|--------|---------|--------|
| API Response Time | ~300-500ms | <100ms |
| Database Query Time | ~50-200ms | <20ms |
| Concurrent Users | ~100 | 10,000+ |
| Uptime | 95% | 99.9% |
| CDN Cache Hit Rate | N/A | >90% |

---

## 🔍 Current Architecture Analysis

### Existing Stack
```
Frontend (React + Vite)
    ↓
Backend (Node.js + Express)
    ↓
MongoDB (Mongoose ORM)
    ↓
External Services:
  - Cloudinary (Media Storage)
  - MeiliSearch (Search)
  - Redis/Upstash (Caching)
  - Socket.io (Real-time)
```

### Current Features
1. **Authentication** - JWT + OTP (email-based)
2. **User Management** - Profile, settings, avatar
3. **Music Library** - Songs, albums, playlists
4. **Playback** - Queue, shuffle, loop, equalizer
5. **Social** - Collaborative sessions, chat
6. **Search** - MeiliSearch integration
7. **Analytics** - Recently played, recommendations
8. **Lyrics** - Plain & synced lyrics

### Current Models (10 MongoDB Collections)
- User, UserSettings
- Playlist, Library
- Session, SessionParticipant, ChatMessage
- RecentlyPlayed, RecentSearch
- Recommendation, Lyrics

---

## 🏗️ High-Level Design (HLD)

### Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                           │
│  - Static Assets Caching                                    │
│  - DDoS Protection                                          │
│  - SSL/TLS Termination                                      │
│  - Geographic Distribution                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   AWS CloudFront (Free Tier)                │
│  - Media Delivery (Audio/Images)                            │
│  - Edge Caching                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite)                        │
│  Hosting: Cloudflare Pages / Vercel (Free)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js + Express)                │
│  Hosting: Railway / Render (Free Tier)                     │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  API Gateway Layer                          │           │
│  │  - Rate Limiting (express-rate-limit)       │           │
│  │  - Request Validation                       │           │
│  │  - Authentication Middleware                │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Business Logic Layer                       │           │
│  │  - Controllers                              │           │
│  │  - Services                                 │           │
│  │  - Validators                               │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Data Access Layer                          │           │
│  │  - Prisma ORM                               │           │
│  │  - Query Optimization                       │           │
│  │  - Connection Pooling                       │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  CACHING LAYER   │                  │  SEARCH ENGINE   │
│  Upstash Redis   │                  │  MeiliSearch     │
│  (Free Tier)     │                  │  (Cloud Free)    │
│                  │                  │                  │
│  - Session Cache │                  │  - Song Search   │
│  - Query Cache   │                  │  - Autocomplete  │
│  - Rate Limiting │                  │  - Fuzzy Match   │
└──────────────────┘                  └──────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│           PRIMARY DATABASE - PostgreSQL (Neon)              │
│  Free Tier: 0.5GB Storage, 3GB Data Transfer               │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Connection Pooling (PgBouncer)             │           │
│  │  - Max 100 connections                      │           │
│  │  - Transaction mode                         │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │  Optimized Schema                           │           │
│  │  - Indexed columns                          │           │
│  │  - Materialized views                       │           │
│  │  - Partitioned tables                       │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│              MEDIA STORAGE (Cloudinary)                     │
│  Free Tier: 25GB Storage, 25GB Bandwidth                   │
│  - Audio Files (MP3/FLAC)                                  │
│  - Album/Avatar Images                                      │
│  - Automatic Optimization                                   │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│         REAL-TIME COMMUNICATION (Socket.io)                 │
│  - Collaborative Sessions                                   │
│  - Live Chat                                                │
│  - Playback Sync                                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

#### 1. **Multi-Layer Caching Strategy**
```
Browser Cache (60s)
    ↓
Cloudflare CDN (1 hour)
    ↓
Redis Cache (5 mins)
    ↓
PostgreSQL (Source of Truth)
```

#### 2. **Database Connection Pooling**
- Use **PgBouncer** (built into Neon)
- Transaction pooling mode
- Max 100 connections
- Connection reuse

#### 3. **Query Optimization**
- Indexed queries
- Prepared statements
- Batch operations
- Pagination (limit/offset)

#### 4. **CDN Strategy**
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare CDN** - Static assets
- **CloudFront** - Media delivery
- **Cloudinary** - Image optimization

---

## 🔧 Low-Level Design (LLD)

### 1. Database Schema Design (PostgreSQL)

#### **Optimized Prisma Schema**

```prisma
// High-performance indexes and constraints

model User {
  id              String    @id @default(cuid())
  email           String    @unique @db.VarChar(255)
  password        String    @db.VarChar(255)
  name            String?   @db.VarChar(100)
  avatar          String?
  bio             String?   @db.VarChar(500)
  isEmailVerified Boolean   @default(false)
  refreshToken    String?   @db.Text
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  settings         UserSettings?
  playlists        Playlist[]
  library          Library?
  sessions         Session[]
  recentlyPlayed   RecentlyPlayed[]

  // Composite indexes for performance
  @@index([email])
  @@index([createdAt(sort: Desc)])
  @@map("users")
}

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

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Performance indexes
  @@index([userId, createdAt(sort: Desc)])
  @@index([isPublic, createdAt(sort: Desc)])
  @@map("playlists")
}

model Library {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  likedSongIds    String[]  @default([])
  likedAlbumIds   String[]  @default([])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@map("libraries")
}

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

  // Optimized for "recently played" queries
  @@index([userId, playedAt(sort: Desc)])
  @@index([songId, playedAt(sort: Desc)])
  @@map("recently_played")
}

model Session {
  id              String    @id @default(cuid())
  sessionCode     String    @unique @db.VarChar(10)
  name            String    @default("Listening Party") @db.VarChar(255)
  hostId          String

  isActive        Boolean   @default(true)
  currentSongId   String?
  currentTime     Float     @default(0)
  isPlaying       Boolean   @default(false)
  queueIds        String[]  @default([])

  expiresAt       DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  participants    SessionParticipant[]
  chatMessages    ChatMessage[]

  @@index([sessionCode])
  @@index([isActive, expiresAt])
  @@map("sessions")
}
```

### 2. Caching Strategy (Redis)

#### **Cache Keys Structure**
```javascript
// User data
user:{userId}                    // TTL: 5 mins
user:{userId}:settings           // TTL: 10 mins
user:{userId}:library            // TTL: 5 mins

// Songs & Albums
songs:all                        // TTL: 5 mins
song:{songId}                    // TTL: 10 mins
albums:all                       // TTL: 5 mins
album:{albumId}                  // TTL: 10 mins

// Playlists
playlist:{playlistId}            // TTL: 3 mins
user:{userId}:playlists          // TTL: 3 mins

// Recently Played
user:{userId}:recent             // TTL: 2 mins

// Search Results
search:{query}                   // TTL: 10 mins

// Session Data
session:{sessionCode}            // TTL: 1 hour
```

#### **Cache Invalidation Strategy**
```javascript
// Write-through cache pattern
async function updatePlaylist(playlistId, data) {
  // 1. Update database
  const playlist = await prisma.playlist.update({
    where: { id: playlistId },
    data
  });

  // 2. Invalidate cache
  await redis.del(`playlist:${playlistId}`);
  await redis.del(`user:${playlist.userId}:playlists`);

  // 3. Optionally pre-warm cache
  await redis.set(
    `playlist:${playlistId}`,
    JSON.stringify(playlist),
    { ex: 180 }
  );

  return playlist;
}
```

### 3. Query Optimization Patterns

#### **Batch Loading (DataLoader Pattern)**
```javascript
import DataLoader from 'dataloader';

// Batch load songs by IDs
const songLoader = new DataLoader(async (songIds) => {
  const songs = await prisma.song.findMany({
    where: { id: { in: songIds } }
  });

  // Return in same order as requested
  const songMap = new Map(songs.map(s => [s.id, s]));
  return songIds.map(id => songMap.get(id));
});

// Usage
const songs = await songLoader.loadMany(playlist.songIds);
```

#### **Pagination with Cursor**
```javascript
// More efficient than offset pagination
async function getRecentlyPlayed(userId, cursor, limit = 20) {
  const where = {
    userId,
    ...(cursor && { playedAt: { lt: new Date(cursor) } })
  };

  const items = await prisma.recentlyPlayed.findMany({
    where,
    take: limit + 1,
    orderBy: { playedAt: 'desc' }
  });

  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, -1) : items;

  return {
    items: results,
    nextCursor: hasMore ? results[results.length - 1].playedAt : null
  };
}
```

#### **Materialized Views for Analytics**
```sql
-- Create materialized view for popular songs
CREATE MATERIALIZED VIEW popular_songs AS
SELECT
  song_id,
  COUNT(*) as play_count,
  COUNT(DISTINCT user_id) as unique_listeners,
  AVG(play_duration) as avg_duration
FROM recently_played
WHERE played_at > NOW() - INTERVAL '30 days'
GROUP BY song_id
ORDER BY play_count DESC;

-- Refresh periodically (via cron job)
REFRESH MATERIALIZED VIEW popular_songs;
```

### 4. API Response Optimization

#### **Response Compression**
```javascript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

#### **Selective Field Loading**
```javascript
// Only load required fields
async function getUserProfile(userId, fields = []) {
  const select = fields.length > 0
    ? Object.fromEntries(fields.map(f => [f, true]))
    : undefined;

  return await prisma.user.findUnique({
    where: { id: userId },
    select: select || {
      id: true,
      email: true,
      name: true,
      avatar: true,
      bio: true
    }
  });
}
```

### 5. Real-time Optimization (Socket.io)

#### **Room-based Broadcasting**
```javascript
// Efficient session updates
io.to(`session:${sessionCode}`).emit('playback:update', {
  currentSongId,
  currentTime,
  isPlaying
});

// Only send to specific user
io.to(`user:${userId}`).emit('notification', data);
```

#### **Message Throttling**
```javascript
// Prevent spam
const messageThrottle = new Map();

socket.on('chat:message', async (data) => {
  const userId = socket.userId;
  const lastMessage = messageThrottle.get(userId);

  if (lastMessage && Date.now() - lastMessage < 1000) {
    return socket.emit('error', 'Too many messages');
  }

  messageThrottle.set(userId, Date.now());

  // Process message
  await handleChatMessage(data);
});
```

---

## 🗄️ Database Migration Strategy

### Phase 1: Schema Migration (Day 1)

#### **Step 1: Setup Neon PostgreSQL**
```bash
# 1. Create Neon account (free tier)
# Visit: https://neon.tech

# 2. Create project
# Get connection string

# 3. Add to .env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
```

#### **Step 2: Install Dependencies**
```bash
cd backend
npm install @prisma/client prisma pg
npm install dataloader
npm uninstall mongoose
```

#### **Step 3: Initialize Prisma**
```bash
npx prisma init
# Copy schema from MONGODB-TO-POSTGRESQL-MIGRATION-GUIDE.md
npx prisma generate
npx prisma db push
```

### Phase 2: Data Migration (Day 2-3)

#### **Migration Script Structure**
```javascript
// scripts/migrate-to-postgres.js
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import pLimit from 'p-limit';

const prisma = new PrismaClient();
const limit = pLimit(10); // Concurrent operations

async function migrateUsers() {
  const users = await User.find({}).lean();

  await Promise.all(
    users.map(user => limit(async () => {
      await prisma.user.create({
        data: {
          id: user._id.toString(),
          email: user.email,
          password: user.password,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }))
  );

  console.log(`✅ Migrated ${users.length} users`);
}

// Run all migrations
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  await migrateUsers();
  await migrateUserSettings();
  await migratePlaylists();
  await migrateLibraries();
  await migrateSessions();
  await migrateRecentlyPlayed();

  console.log('✅ Migration complete!');
}

main();
```

### Phase 3: Code Migration (Day 4-5)

#### **Controller Update Pattern**
```javascript
// Before (MongoDB + Mongoose)
const getPlaylists = async (req, res) => {
  const playlists = await Playlist.find({ userId: req.userId });
  res.json({ success: true, playlists });
};

// After (PostgreSQL + Prisma)
const getPlaylists = async (req, res) => {
  // Check cache first
  const cached = await redis.get(`user:${req.userId}:playlists`);
  if (cached) {
    return res.json({ success: true, playlists: JSON.parse(cached) });
  }

  // Query database
  const playlists = await prisma.playlist.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' }
  });

  // Cache result
  await redis.set(
    `user:${req.userId}:playlists`,
    JSON.stringify(playlists),
    { ex: 180 }
  );

  res.json({ success: true, playlists });
};
```

---

## ⚡ Performance Optimization

### 1. Database Optimizations

#### **Connection Pooling**
```javascript
// src/config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Connection pool settings (via DATABASE_URL)
// ?connection_limit=100&pool_timeout=20
```

#### **Query Performance**
```javascript
// Use select to reduce data transfer
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    avatar: true
    // Don't load password, refreshToken, etc.
  }
});

// Use include wisely
const playlist = await prisma.playlist.findUnique({
  where: { id: playlistId },
  include: {
    user: {
      select: { id: true, name: true, avatar: true }
    }
  }
});
```

#### **Batch Operations**
```javascript
// Instead of multiple queries
for (const songId of songIds) {
  await prisma.song.findUnique({ where: { id: songId } });
}

// Use single query
const songs = await prisma.song.findMany({
  where: { id: { in: songIds } }
});
```

### 2. Caching Optimizations

#### **Multi-level Cache**
```javascript
async function getSong(songId) {
  // L1: Memory cache (Node.js)
  if (memoryCache.has(songId)) {
    return memoryCache.get(songId);
  }

  // L2: Redis cache
  const cached = await redis.get(`song:${songId}`);
  if (cached) {
    const song = JSON.parse(cached);
    memoryCache.set(songId, song);
    return song;
  }

  // L3: Database
  const song = await prisma.song.findUnique({
    where: { id: songId }
  });

  // Warm caches
  await redis.set(`song:${songId}`, JSON.stringify(song), { ex: 600 });
  memoryCache.set(songId, song);

  return song;
}
```

### 3. API Optimizations

#### **Response Caching Headers**
```javascript
app.get('/api/song/list', async (req, res) => {
  // Set cache headers
  res.set({
    'Cache-Control': 'public, max-age=60',
    'ETag': generateETag(songs)
  });

  const songs = await getSongs();
  res.json({ success: true, songs });
});
```

#### **Request Deduplication**
```javascript
import { AsyncLocalStorage } from 'async_hooks';

const requestCache = new Map();

async function dedupedRequest(key, fn) {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const promise = fn();
  requestCache.set(key, promise);

  try {
    return await promise;
  } finally {
    requestCache.delete(key);
  }
}
```

### 4. Media Delivery Optimization

#### **Cloudinary Transformations**
```javascript
// Optimize images on-the-fly
const optimizedUrl = cloudinary.url(publicId, {
  transformation: [
    { width: 300, height: 300, crop: 'fill' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
});

// Audio streaming
const audioUrl = cloudinary.url(audioPublicId, {
  resource_type: 'video',
  format: 'mp3',
  quality: 'auto'
});
```

---

## ☁️ Free-Tier Cloud Services

### Service Allocation

| Service | Provider | Free Tier | Usage |
|---------|----------|-----------|-------|
| **Database** | Neon | 0.5GB, 3GB transfer | PostgreSQL |
| **Cache** | Upstash | 10K commands/day | Redis |
| **Search** | MeiliSearch Cloud | 100K docs | Search engine |
| **Backend Hosting** | Railway/Render | 500 hrs/month | Node.js API |
| **Frontend Hosting** | Cloudflare Pages | Unlimited | React app |
| **CDN** | Cloudflare | Unlimited | Static assets |
| **Media Storage** | Cloudinary | 25GB storage | Audio/images |
| **Email** | Resend | 3K emails/month | OTP emails |
| **Monitoring** | Better Stack | Free tier | Logs & alerts |
| **Analytics** | PostHog | 1M events/month | User analytics |

### Cost Breakdown (All Free!)

```
✅ Neon PostgreSQL       - $0/month (0.5GB)
✅ Upstash Redis         - $0/month (10K commands)
✅ MeiliSearch Cloud     - $0/month (100K docs)
✅ Railway/Render        - $0/month (500 hrs)
✅ Cloudflare Pages      - $0/month (unlimited)
✅ Cloudflare CDN        - $0/month (unlimited)
✅ Cloudinary            - $0/month (25GB)
✅ Resend                - $0/month (3K emails)
✅ Better Stack          - $0/month (basic)
✅ PostHog               - $0/month (1M events)

TOTAL: $0/month 🎉
```

### Service Configuration

#### **1. Neon PostgreSQL**
```env
# .env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require&connection_limit=100&pool_timeout=20"
```

#### **2. Upstash Redis**
```env
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXxxx"
```

#### **3. Cloudflare Pages**
```yaml
# wrangler.toml
name = "music-app"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
publish = "dist"
```

#### **4. Railway Deployment**
```yaml
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 📅 Implementation Roadmap

### Week 1: Database Migration
- **Day 1-2**: Setup Neon, Prisma schema, test connection
- **Day 3-4**: Data migration script, validate data
- **Day 5**: Parallel testing (MongoDB + PostgreSQL)

### Week 2: Code Migration
- **Day 1-2**: Update auth & user controllers
- **Day 3**: Update playlist & library controllers
- **Day 4**: Update session & chat controllers
- **Day 5**: Update remaining controllers

### Week 3: Performance Optimization
- **Day 1-2**: Implement caching layer
- **Day 3**: Database query optimization
- **Day 4**: API response optimization
- **Day 5**: Load testing & benchmarking

### Week 4: Deployment & Monitoring
- **Day 1-2**: Deploy to staging (Railway)
- **Day 3**: Setup monitoring (Better Stack)
- **Day 4**: Performance testing
- **Day 5**: Production deployment

---

## 📊 Monitoring & Observability

### 1. Application Metrics

```javascript
// src/middleware/metrics.js
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'table']
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
};
```

### 2. Database Monitoring

```javascript
// Prisma query logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query detected: ${e.duration}ms`, e.query);
  }

  dbQueryDuration
    .labels(e.query.split(' ')[0], e.target)
    .observe(e.duration);
});
```

### 3. Health Checks

```javascript
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    meilisearch: false
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {}

  try {
    await redis.ping();
    checks.redis = true;
  } catch (e) {}

  try {
    await meili.health();
    checks.meilisearch = true;
  } catch (e) {}

  const healthy = Object.values(checks).every(v => v);

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  });
});
```

### 4. Performance Targets

| Endpoint | Target Latency | Cache Strategy |
|----------|---------------|----------------|
| `GET /api/song/list` | <50ms | Redis (5 min) |
| `GET /api/playlist/list` | <30ms | Redis (3 min) |
| `GET /api/user/me` | <20ms | Redis (5 min) |
| `POST /api/auth/login` | <100ms | No cache |
| `GET /api/search` | <80ms | Redis (10 min) |
| `GET /api/recently-played` | <40ms | Redis (2 min) |

---

## 🎯 Success Criteria

### Performance Metrics
- ✅ P50 latency < 50ms
- ✅ P95 latency < 100ms
- ✅ P99 latency < 200ms
- ✅ Database query time < 20ms
- ✅ Cache hit rate > 80%
- ✅ Uptime > 99.9%

### Scalability Metrics
- ✅ Support 10,000+ concurrent users
- ✅ Handle 1,000 requests/second
- ✅ Database connections < 100
- ✅ Memory usage < 512MB

### Quality Metrics
- ✅ Zero data loss during migration
- ✅ All features working
- ✅ No breaking changes
- ✅ Comprehensive monitoring

---

## 📝 Next Steps

1. **Review this plan** - Understand all components
2. **Setup accounts** - Neon, Upstash, Cloudflare, Railway
3. **Create Prisma schema** - Copy from migration guide
4. **Test migration** - Run on sample data
5. **Implement caching** - Redis integration
6. **Optimize queries** - Add indexes
7. **Deploy to staging** - Test thoroughly
8. **Monitor performance** - Achieve <100ms
9. **Deploy to production** - Go live!

---

## 🚀 Ready to Start?

This plan provides a complete roadmap for:
- ✅ Migrating from MongoDB to PostgreSQL
- ✅ Achieving <100ms latency
- ✅ Building a scalable architecture
- ✅ Using 100% free-tier services
- ✅ Maintaining all existing features

**Let me know when you're ready to start implementation!** 🎉
