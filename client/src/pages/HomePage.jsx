import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AlbumItem from '../components/AlbumItem'
import SongItem from '../components/SongItem'
import { PlayerContext } from '../context/PlayerContext'
import { albumService, songService, recommendationService, recentlyPlayedService } from '../services/music'
import { Play, Clock, TrendingUp, Music } from 'lucide-react'
import CreateSessionDialog from '../components/session/CreateSessionDialog'
import JoinSessionDialog from '../components/session/JoinSessionDialog'

const HomePage = () => {
  const { songsData, getSongsData, playWithId } = useContext(PlayerContext);
  const [albumsData, setAlbumsData] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showJoinSession, setShowJoinSession] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [albumRes, songRes, recentRes, recomRes] = await Promise.all([
          albumService.getAll(),
          songService.getAll(),
          recentlyPlayedService.getList().catch(() => ({ success: false, recent: [] })),
          recommendationService.getHomeFeed().catch(() => ({ success: false })),
        ]);

        if (albumRes.success) {
          setAlbumsData(albumRes.albums);
        }

        if (songRes.success) {
          getSongsData(songRes.songs);
        }

        if (recentRes.success) {
          setRecentlyPlayed(recentRes.recent.slice(0, 6));
        }

        if (recomRes.success) {
          setRecommendations(recomRes.feed);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative grid md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 md:p-12 lg:p-16">
              {/* Left - Content */}
              <div className="text-white flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                    Listen<br />Now
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-md">
                    Discover millions of songs and create your perfect playlist
                  </p>

                  {/* Stats with icons */}
                  <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold">{songsData.length}</p>
                          <p className="text-xs sm:text-sm text-white/70">Songs</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold">{albumsData.length}</p>
                          <p className="text-xs sm:text-sm text-white/70">Albums</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="inline-flex items-center gap-2 sm:gap-3 bg-white text-emerald-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm sm:text-base">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    Start Listening
                  </button>
                </motion.div>
              </div>

              {/* Right - Featured Songs Grid */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex items-center"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                  {songsData.slice(0, 4).map((song, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="group bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg sm:rounded-xl">
                        <img
                          src={song.image}
                          alt={song.name}
                          className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                        </div>
                      </div>
                      <p className="font-semibold text-xs sm:text-sm truncate text-white">{song.name}</p>
                      <p className="text-xs text-white/60 truncate">{song.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recently Played</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recentlyPlayed.map((item, index) => {
                  const song = item.item || item;
                  console.log('Recently played item:', song); // Debug log

                  // Create a proper image URL or use a music note SVG as fallback
                  const imageUrl = song?.image || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='80' fill='%239ca3af'%3E♪%3C/text%3E%3C/svg%3E`;

                  return (
                    <SongItem
                      key={index}
                      name={song?.name || 'Unknown Song'}
                      desc={song?.desc || song?.album || 'Unknown Artist'}
                      id={song?._id}
                      image={imageUrl}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Trending Music */}
        {recommendations?.trending && recommendations.trending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Trending Music</h2>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {recommendations.trending.map((item, index) => (
                  <div key={index} className="w-40 sm:w-44 md:w-48 shrink-0">
                    <SongItem
                      name={item.name}
                      desc={item.desc}
                      id={item._id}
                      image={item.image}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Tracks */}
        {songsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Tracks</h2>
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {songsData.slice(0, 10).map((item, index) => (
                  <div key={index} className="w-40 sm:w-44 md:w-48 shrink-0">
                    <SongItem
                      name={item.name}
                      desc={item.desc}
                      id={item._id}
                      image={item.image}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Made For You */}
        {recommendations?.forYou && recommendations.forYou.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Made For You</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {recommendations.forYou.map((item, index) => (
                  <div key={index} className="w-[180px] flex-shrink-0">
                    <SongItem
                      name={item.name}
                      desc={item.desc}
                      id={item._id}
                      image={item.image}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* New Album Releases */}
        {albumsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Album Releases</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {albumsData.map((item, index) => (
                  <AlbumItem
                    key={index}
                    name={item.name}
                    desc={item.desc}
                    id={item._id}
                    image={item.image}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Session Dialogs */}
      <CreateSessionDialog open={showCreateSession} onOpenChange={setShowCreateSession} />
      <JoinSessionDialog open={showJoinSession} onOpenChange={setShowJoinSession} />
    </div>
  )
}

export default HomePage
