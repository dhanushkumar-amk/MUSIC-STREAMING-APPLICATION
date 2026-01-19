import { useState, useEffect } from 'react';
import { albumService, libraryService } from '../services/music';
import { motion } from 'framer-motion';
import AlbumItem from '../components/AlbumItem';
import { Disc, Heart, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filter, setFilter] = useState('all'); // 'all' or 'liked'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [albumsRes, likedRes] = await Promise.all([
        albumService.getAll(),
        libraryService.getLikedAlbums().catch(() => ({ success: false, albums: [] })),
      ]);

      if (albumsRes.success) {
        setAlbums(albumsRes.albums);
      }

      if (likedRes.success) {
        setLikedAlbums(likedRes.albums.map(a => a._id));
      }
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeAlbum = async (albumId) => {
    try {
      const isLiked = likedAlbums.includes(albumId);

      if (isLiked) {
        await libraryService.unlikeAlbum(albumId);
        setLikedAlbums(likedAlbums.filter(id => id !== albumId));
        toast.success('Removed from library');
      } else {
        await libraryService.likeAlbum(albumId);
        setLikedAlbums([...likedAlbums, albumId]);
        toast.success('Added to library');
      }
    } catch (error) {
      console.error('Failed to like/unlike album:', error);
      toast.error('Failed to update');
    }
  };

  const getDisplayedAlbums = () => {
    if (filter === 'liked') {
      return albums.filter(album => likedAlbums.includes(album._id));
    }
    return albums;
  };

  const displayedAlbums = getDisplayedAlbums();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Disc className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Albums</h1>
                <p className="text-sm sm:text-base text-gray-500">{displayedAlbums.length} albums</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Filter Buttons */}
              <div className="flex bg-gray-100 rounded-xl p-1 flex-1 sm:flex-initial">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('liked')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                    filter === 'liked'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  Liked
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Albums Grid/List */}
        {displayedAlbums.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'
                : 'flex flex-col gap-2'
            }
          >
            {displayedAlbums.map((album, index) => (
              <motion.div
                key={album._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="relative group"
              >
                {viewMode === 'grid' ? (
                  <>
                    <AlbumItem
                      name={album.name}
                      desc={album.desc}
                      id={album._id}
                      image={album.image}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeAlbum(album._id);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 ${
                        likedAlbums.includes(album._id) ? 'text-emerald-500' : 'text-gray-600'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedAlbums.includes(album._id) ? 'fill-current' : ''}`}
                      />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <img
                      src={album.image}
                      alt={album.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{album.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{album.desc}</p>
                    </div>
                    <button
                      onClick={() => handleLikeAlbum(album._id)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        likedAlbums.includes(album._id) ? 'text-emerald-500' : 'text-gray-400'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${likedAlbums.includes(album._id) ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl p-12 text-center shadow-sm">
            <Disc className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'liked' ? 'No liked albums yet' : 'No albums available'}
            </h3>
            <p className="text-gray-500">
              {filter === 'liked'
                ? 'Albums you like will appear here'
                : 'Check back later for new releases'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
