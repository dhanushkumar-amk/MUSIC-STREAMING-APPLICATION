import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SongItem from '../components/SongItem';
import { Search, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AllSongsPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalSongs: 0,
    hasNext: false,
    hasPrev: false
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Fetch songs
  const fetchSongs = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/song/paginated`, {
        params: {
          page,
          limit: 15,  // 5 rows × 3 songs = 15 songs per page
          search
        }
      });

      if (response.data.success) {
        setSongs(response.data.songs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSongs(currentPage, searchQuery);
  }, [currentPage]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSongs(1, searchQuery);
  };

  // Page navigation
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">All Songs</h1>
              <p className="text-sm sm:text-base text-gray-500">
                {pagination.totalSongs} songs available
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-1.5 sm:py-2 bg-emerald-600 text-white rounded-lg sm:rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm sm:text-base"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Songs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading songs...</p>
            </div>
          </div>
        ) : songs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No songs found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No songs available yet'}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
            >
              {songs.map((song, index) => (
                <motion.div
                  key={song._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="max-w-[200px]"
                >
                  <SongItem
                    name={song.name}
                    desc={song.desc}
                    id={song._id}
                    image={song.image}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mt-8"
              >
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium text-gray-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-500'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium text-gray-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllSongsPage;
