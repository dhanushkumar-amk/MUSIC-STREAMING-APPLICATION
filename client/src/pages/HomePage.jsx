import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AuthNavbar from '../components/layout/AuthNavbar'
import AlbumItem from '../components/AlbumItem'
import SongItem from '../components/SongItem'
import { PlayerContext } from '../context/PlayerContext'
import { albumService, songService, recommendationService, recentlyPlayedService } from '../services/music'
import { Play, Clock, TrendingUp } from 'lucide-react'

const HomePage = () => {
  const { songsData, getSongsData, playWithId } = useContext(PlayerContext);
  const [albumsData, setAlbumsData] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <AuthNavbar />

      {/* Hero Section - Featured Track */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">Listen Now</h1>
            <p className="text-gray-500 text-lg">Discover new music</p>
          </div>
        </div>

        {/* Featured Track */}
        {songsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl overflow-hidden shadow-xl group cursor-pointer"
            onClick={() => playWithId(songsData[0]._id)}
          >
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-8 md:p-12">
              <img
                src={songsData[0].image}
                alt={songsData[0].name}
                className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl object-cover"
              />
              <div className="flex-1 text-center md:text-left text-white">
                <p className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">Featured Track</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-3">{songsData[0].name}</h2>
                <p className="text-lg opacity-90 mb-6">{songsData[0].desc}</p>
                <button className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg">
                  <Play className="w-5 h-5 fill-current" />
                  Play
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='mb-12'
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-emerald-600" />
            <h2 className='text-3xl font-bold text-gray-900'>Recently Played</h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            {recentlyPlayed.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
              >
                <SongItem
                  name={item.song.name}
                  desc={item.song.desc}
                  id={item.song._id}
                  image={item.song.image}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trending Now */}
      {recommendations?.trendingNow && recommendations.trendingNow.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='mb-12'
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className='text-3xl font-bold text-gray-900'>Trending Now</h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
            {recommendations.trendingNow.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
              >
                <SongItem
                  name={item.name}
                  desc={item.desc}
                  id={item._id}
                  image={item.image}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Releases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className='mb-12'
      >
        <div className="flex items-end justify-between mb-6">
          <h2 className='text-3xl font-bold text-gray-900'>New Releases</h2>
          <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">See All</button>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'>
          {albumsData.length > 0 ? (
            albumsData.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
              >
                <AlbumItem
                  name={item.name}
                  desc={item.desc}
                  id={item._id}
                  image={item.image}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400 text-lg">No albums available</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Songs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className='mb-24'
      >
        <div className="flex items-end justify-between mb-6">
          <h2 className='text-3xl font-bold text-gray-900'>Top Songs</h2>
          <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">See All</button>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
          {songsData.length > 0 ? (
            songsData.slice(1).map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.4 }}
              >
                <SongItem
                  name={item.name}
                  desc={item.desc}
                  id={item._id}
                  image={item.image}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400 text-lg">No songs available</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default HomePage
