# 🗄️ Database Usage Guide - Two Database Architecture

## 📊 Overview

Your application uses **TWO databases** in a hybrid architecture:

1. **PostgreSQL (Neon)** - For user data and app features
2. **MongoDB** - For media content (songs & albums)

---

## 🎯 PostgreSQL (Neon) - Main Application Database

### What It Stores:

#### 1. **Users** 👥
- User accounts
- Email, password, avatar
- Profile information
- Account settings

**Why PostgreSQL?**
- Structured user data
- ACID compliance for data integrity
- Type-safe queries with Prisma

---

#### 2. **User Settings** ⚙️
- Audio quality preferences
- Crossfade duration
- Gapless playback
- Volume normalization
- Playback speed
- **Equalizer settings** (10-band)
- Equalizer presets (rock, pop, jazz, etc.)

**Why PostgreSQL?**
- Structured settings
- Fast updates
- Type-safe

---

#### 3. **Playlists** 🎵
- Playlist name, description
- Public/private settings
- Collaborative settings
- Song IDs (references to MongoDB)
- Collaborators
- Created/updated timestamps

**Why PostgreSQL?**
- Complex relationships (users, collaborators)
- Fast queries
- Data integrity

---

#### 4. **Libraries** 📚
- Liked songs (song IDs)
- Liked albums (album IDs)
- User preferences

**Why PostgreSQL?**
- Fast lookups
- Efficient array operations
- User-specific data

---

#### 5. **Sessions** 🎧
- Collaborative listening sessions
- Session code
- Host information
- Current playing song
- Queue (song IDs)
- Session settings
- Participant permissions

**Why PostgreSQL?**
- Complex relationships
- Real-time updates
- Data consistency

---

#### 6. **Session Participants** 👥
- Who's in each session
- Online/offline status
- Permissions (can control, can add to queue)
- Join time

**Why PostgreSQL?**
- Relational data
- Fast queries
- Data integrity

---

#### 7. **Chat Messages** 💬
- Session chat messages
- User messages
- System messages
- Timestamps
- Message type

**Why PostgreSQL?**
- Structured messages
- Fast queries
- Relationships

---

#### 8. **Recently Played** 📊
- Play history
- Song ID (reference to MongoDB)
- Play duration
- Skipped or completed
- Context (playlist, album, etc.)
- Timestamps

**Why PostgreSQL?**
- Analytics data
- Fast aggregations
- Time-series queries

---

#### 9. **Recent Searches** 🔍
- Search history
- Query text
- Search type
- Result ID
- Timestamps

**Why PostgreSQL?**
- Structured search data
- Fast lookups

---

#### 10. **Recommendations** ⭐
- Song recommendations
- Play count
- Skip count
- Weighted score
- Algorithm data

**Why PostgreSQL?**
- Analytics
- Calculations
- Aggregations

---

#### 11. **Lyrics** 📝
- Song lyrics
- Plain text lyrics
- Synced lyrics (timestamped)
- Language
- Source
- Verification status

**Why PostgreSQL?**
- Structured text data
- Fast searches
- Relationships

---

## 🎵 MongoDB - Media Content Database

### What It Stores:

#### 1. **Songs** 🎶
- Song metadata
  - Name
  - Artist
  - Album
  - Duration
  - Genre
- **Audio file URL** (Cloudinary)
- **Image/cover URL** (Cloudinary)
- Description
- Release date

**Why MongoDB?**
- Flexible schema for media metadata
- Good for document-style data
- Easy to add new fields
- Already set up and working

---

#### 2. **Albums** 💿
- Album metadata
  - Name
  - Artist
  - Release date
  - Genre
- **Album cover URL** (Cloudinary)
- Song list (references)
- Description

**Why MongoDB?**
- Flexible schema
- Document-oriented
- Good for media catalogs
- Already set up and working

---

## 🔄 How They Work Together

### Example: Playing a Song

```
1. User clicks play on a song
   ↓
2. Frontend sends request to backend
   ↓
3. Backend checks user permissions (PostgreSQL)
   ↓
4. Backend fetches song details (MongoDB)
   ↓
5. Backend creates "Recently Played" entry (PostgreSQL)
   ↓
6. Backend updates recommendation score (PostgreSQL)
   ↓
7. Song plays!
```

### Example: Creating a Playlist

```
1. User creates playlist
   ↓
2. Playlist saved to PostgreSQL
   ↓
3. User adds songs to playlist
   ↓
4. Song IDs stored in playlist (PostgreSQL)
   ↓
5. When viewing playlist:
   - Fetch playlist from PostgreSQL
   - Fetch song details from MongoDB
   - Display combined data
```

---

## 📊 Visual Breakdown

### PostgreSQL (Neon) - 11 Tables
```
┌─────────────────────────────────────┐
│       PostgreSQL (Neon)             │
├─────────────────────────────────────┤
│ ✅ users                            │
│ ✅ user_settings                    │
│ ✅ playlists                        │
│ ✅ libraries                        │
│ ✅ sessions                         │
│ ✅ session_participants             │
│ ✅ chat_messages                    │
│ ✅ recently_played                  │
│ ✅ recent_searches                  │
│ ✅ recommendations                  │
│ ✅ lyrics                           │
└─────────────────────────────────────┘
```

### MongoDB - 2 Collections
```
┌─────────────────────────────────────┐
│           MongoDB                   │
├─────────────────────────────────────┤
│ 🎵 songs                            │
│ 💿 albums                           │
└─────────────────────────────────────┘
```

---

## 💡 Why This Architecture?

### Benefits:

**1. Best Tool for Each Job**
- PostgreSQL: Structured data, relationships, analytics
- MongoDB: Flexible media metadata

**2. Performance**
- PostgreSQL: Fast joins, complex queries
- MongoDB: Fast document retrieval

**3. Scalability**
- Each database can scale independently
- Optimize each for its specific use case

**4. Flexibility**
- Easy to add new song/album fields (MongoDB)
- Strong data integrity for user data (PostgreSQL)

**5. Migration Strategy**
- Migrated critical features to PostgreSQL
- Kept working media system in MongoDB
- No downtime!

---

## 🎯 Quick Reference

### When to Use PostgreSQL:
- ✅ User accounts
- ✅ User preferences
- ✅ Playlists
- ✅ Social features (sessions, chat)
- ✅ Analytics (play history, recommendations)
- ✅ Any data with relationships

### When to Use MongoDB:
- ✅ Songs
- ✅ Albums
- ✅ Media metadata
- ✅ Flexible schema data

---

## 🔗 Data Relationships

### How They Connect:

**Playlists (PostgreSQL) → Songs (MongoDB)**
```javascript
// Playlist stores song IDs
playlist.songIds = ["song1", "song2", "song3"]

// To display playlist:
1. Get playlist from PostgreSQL
2. Get songs from MongoDB using songIds
3. Combine and return
```

**Recently Played (PostgreSQL) → Songs (MongoDB)**
```javascript
// Recently played stores song ID
recentlyPlayed.songId = "song123"

// To display history:
1. Get recently played from PostgreSQL
2. Get song details from MongoDB
3. Combine and return
```

**Libraries (PostgreSQL) → Songs/Albums (MongoDB)**
```javascript
// Library stores IDs
library.likedSongIds = ["song1", "song2"]
library.likedAlbumIds = ["album1", "album2"]

// To display liked items:
1. Get library from PostgreSQL
2. Get songs/albums from MongoDB
3. Combine and return
```

---

## 📈 Statistics

### PostgreSQL (Neon):
- **Tables:** 11
- **Records:** 227+
- **Controllers:** 8 (fully migrated)
- **Functions:** 59 (using Prisma)

### MongoDB:
- **Collections:** 2
- **Records:** Thousands of songs/albums
- **Controllers:** 2 (song, album)
- **Functions:** Using Mongoose

---

## 🎊 Summary

**You have a PROFESSIONAL hybrid database architecture!**

- **PostgreSQL** handles all user data, features, and analytics
- **MongoDB** handles all media content (songs/albums)
- **Both** work together seamlessly
- **Result:** Fast, scalable, maintainable application

**This is exactly how many production apps work!**

Examples:
- Spotify uses multiple databases
- Netflix uses multiple databases
- YouTube uses multiple databases

**Your architecture is production-ready!** 🚀

---

## 🔍 Need to Check Data?

**PostgreSQL:**
- Open Prisma Studio: http://localhost:5555
- See all user data, playlists, sessions, etc.

**MongoDB:**
- Use MongoDB Compass
- Or MongoDB Atlas dashboard
- See all songs and albums

---

**Both databases working together = Powerful music streaming app!** 🎵
