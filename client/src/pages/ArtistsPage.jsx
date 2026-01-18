import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Music, Search, Filter, TrendingUp, Star, Globe, CheckCircle2 } from 'lucide-react';
import artistAPI from '../services/artist';

const ArtistsPage = () => {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('-followerCount');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, [filterType, sortBy]);

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        searchArtists();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchArtists();
    }
  }, [searchQuery]);

  const fetchArtists = async (pageNum = 1) => {
    try {
      setLoading(true);

      let data;
      if (filterType === 'featured') {
        data = await artistAPI.getFeaturedArtists();
      } else if (filterType === 'top') {
        data = await artistAPI.getTopArtists(50);
      } else {
        const params = {
          page: pageNum,
          limit: 20,
          sort: sortBy
        };

        if (filterType === 'verified') {
          params.verified = true;
        }

        data = await artistAPI.getAllArtists(params);
      }

      if (pageNum === 1) {
        setArtists(data.artists || []);
      } else {
        setArtists(prev => [...prev, ...(data.artists || [])]);
      }

      setHasMore(data.pagination?.page < data.pagination?.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const searchArtists = async () => {
    try {
      setLoading(true);
      const data = await artistAPI.searchArtists(searchQuery, 50);
      setArtists(data.artists || []);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching artists:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchArtists(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Artists</h1>
              <p className="text-sm sm:text-base text-gray-500">
                Discover and follow your favorite artists
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-600">Filter:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Artists', icon: Globe },
                { value: 'featured', label: 'Featured', icon: Star },
                { value: 'top', label: 'Top Artists', icon: TrendingUp },
                { value: 'verified', label: 'Verified', icon: CheckCircle2 }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFilterType(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    filterType === value
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Sort */}
            {filterType === 'all' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer text-sm"
              >
                <option value="-followerCount">Most Followers</option>
                <option value="-totalPlays">Most Plays</option>
                <option value="-monthlyListeners">Most Listeners</option>
                <option value="name">Name (A-Z)</option>
                <option value="-createdAt">Recently Added</option>
              </select>
            )}
          </div>
        </motion.div>

        {/* Artists Grid */}
        {loading && artists.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading artists...</p>
            </div>
          </div>
        ) : artists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl p-12 text-center shadow-sm"
          >
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            >
              {artists.map((artist, index) => (
                <motion.div
                  key={artist._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/artist/${artist._id}`)}
                  className="bg-white p-4 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="relative mb-4">
                    <div className="w-full aspect-square rounded-full overflow-hidden shadow-md">
                      {artist.avatar ? (
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <Music className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    {artist.verified && (
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold truncate mb-1 text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {artist.followerCount?.toLocaleString()} followers
                    </p>
                    {artist.genres && artist.genres.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {artist.genres[0]}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Load More
                </button>
              </div>
            )}

            {loading && artists.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;
