# SoundWave - Complete Music Streaming Application

A full-featured music streaming application built with React and Node.js, featuring real-time playback, playlists, recommendations, and more.

## 🎵 Features Implemented

### ✅ Authentication & User Management
- **OTP-based Login** - Secure email verification
- **Registration** - Create new accounts
- **Password Reset** - Forgot password flow with OTP
- **Profile Management** - Update profile and avatar
- **Password Change** - Secure password updates

### ✅ Music Playback
- **Full Audio Player** - Play, pause, skip, seek
- **Queue Management** - Add to queue, play next
- **Shuffle & Repeat** - All loop modes (off, one, all)
- **Volume Control** - Adjustable volume with mute
- **Progress Bar** - Visual playback progress
- **Play Tracking** - Automatic play count and session tracking

### ✅ Library Management
- **Liked Songs** - Save and manage favorite tracks
- **Liked Albums** - Save favorite albums
- **Recently Played** - Track listening history
- **Smart Recommendations** - Personalized home feed

### ✅ Playlists
- **Create Playlists** - Build custom collections
- **Add/Remove Songs** - Manage playlist content
- **Playlist Playback** - Play entire playlists
- **Shuffle & Loop** - Per-playlist settings
- **Auto Banner** - First song image as playlist cover

### ✅ Search & Discovery
- **Global Search** - Search songs, albums, and users
- **Autocomplete** - Real-time search suggestions
- **Category Browsing** - Browse by genre
- **Tabbed Results** - Organized search results

### ✅ Albums
- **Album Browsing** - View all albums
- **Album Details** - (Ready for implementation)
- **Like Albums** - Save favorite albums

### ✅ User Interface
- **Modern Design** - Glassmorphism and gradients
- **Dark/Light Mode** - Full theme support
- **Responsive** - Works on all devices
- **Floating Player** - Dynamic Island style
- **Smooth Animations** - Polished interactions

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── RequireAuth.jsx          # Route protection
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx           # App shell
│   │   │   ├── Navbar.jsx               # Landing navbar
│   │   │   └── Sidebar.jsx              # App navigation
│   │   ├── landing/
│   │   │   ├── Hero.jsx                 # Landing hero
│   │   │   ├── Features.jsx             # Features section
│   │   │   ├── Pricing.jsx              # Pricing cards
│   │   │   └── ...                      # Other landing components
│   │   ├── player/
│   │   │   └── Player.jsx               # Audio player
│   │   └── ui/                          # Shadcn components
│   ├── context/
│   │   └── PlayerContext.jsx            # Global player state
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── AuthLayout.jsx           # Auth page wrapper
│   │   │   ├── LoginPage.jsx            # Login
│   │   │   ├── RegisterPage.jsx         # Registration
│   │   │   ├── OTPVerifyPage.jsx        # OTP verification
│   │   │   ├── ForgotPasswordPage.jsx   # Password reset request
│   │   │   └── ResetPasswordPage.jsx    # Password reset
│   │   ├── HomePage.jsx                 # Main feed
│   │   ├── SearchPage.jsx               # Search interface
│   │   ├── AlbumsPage.jsx               # Albums browsing
│   │   ├── PlaylistsPage.jsx            # Playlists management
│   │   ├── LibraryPage.jsx              # Liked songs
│   │   └── Landing.jsx                  # Landing page
│   ├── services/
│   │   ├── api.js                       # Axios instance
│   │   ├── auth.js                      # Auth services
│   │   └── music.js                     # Music services
│   └── App.jsx                          # Main app component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend server running on port 4000

### Installation

```bash
cd client
npm install
```

### Environment Setup

The app connects to `http://localhost:4000/api` by default. Update `src/services/api.js` if your backend is on a different URL.

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` or `http://localhost:5174`

## 🎨 Design System

### Colors
- **Primary**: Green (#1DB954) - Accent color
- **Background**: Dynamic (light/dark)
- **Card**: Glassmorphism with backdrop blur
- **Borders**: Subtle with transparency

### Components
- **Buttons**: Rounded with hover effects
- **Cards**: Floating with shadows
- **Inputs**: Rounded with focus states
- **Player**: Floating capsule design

## 🔧 API Integration

All backend endpoints are integrated:

### Authentication
- ✅ Register
- ✅ Login (OTP)
- ✅ Verify OTP
- ✅ Refresh Token
- ✅ Forgot Password
- ✅ Reset Password
- ✅ Logout

### User
- ✅ Get Profile
- ✅ Update Profile
- ✅ Change Password
- ✅ Upload Avatar

### Music
- ✅ List Songs
- ✅ List Albums

### Library
- ✅ Like/Unlike Songs
- ✅ Like/Unlike Albums
- ✅ Get Liked Songs
- ✅ Get Liked Albums

### Playlists
- ✅ Create Playlist
- ✅ Rename Playlist
- ✅ Delete Playlist
- ✅ Add Song
- ✅ Remove Song
- ✅ List Playlists
- ✅ Start Playback
- ✅ Toggle Shuffle
- ✅ Update Loop Mode

### Queue
- ✅ Start Queue
- ✅ Get State
- ✅ Next Song
- ✅ Previous Song
- ✅ Toggle Shuffle
- ✅ Update Loop
- ✅ Add to Queue
- ✅ Play Next
- ✅ Remove from Queue
- ✅ Clear Queue

### Search
- ✅ Global Search
- ✅ Autocomplete

### Play Tracking
- ✅ Start Session
- ✅ End Session
- ✅ Get Recently Played

### Statistics
- ✅ Increment Play Count
- ✅ Get Stats

### Recommendations
- ✅ Get Home Feed

## 📝 Usage

### Playing Music
1. Navigate to Home, Search, or Albums
2. Click the play button on any song
3. Use the floating player to control playback

### Creating Playlists
1. Go to Playlists page
2. Click "Create Playlist"
3. Add songs from any page using the context menu

### Liking Songs
1. Click the heart icon on any song
2. View all liked songs in Library

### Queue Management
1. Right-click any song
2. Choose "Add to queue" or "Play next"
3. Songs will play in order

## 🎯 Next Steps (Optional Enhancements)

- [ ] Album detail page
- [ ] Playlist detail page
- [ ] User profile page
- [ ] Settings page
- [ ] Lyrics display
- [ ] Social features
- [ ] Download for offline
- [ ] Equalizer
- [ ] Crossfade
- [ ] Keyboard shortcuts

## 🐛 Known Issues

- Browser may require user interaction before audio playback
- Some features require backend to be running
- Theme toggle needs to be added to main app

## 📄 License

This project is part of a music streaming application portfolio.

## 🙏 Credits

- UI Components: Shadcn/ui
- Icons: Lucide React
- Styling: Tailwind CSS
- Backend: Custom Node.js API
