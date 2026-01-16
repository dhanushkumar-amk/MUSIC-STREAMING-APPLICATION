import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Music, Search, Filter, TrendingUp, Star, Globe } from 'lucide-react';
import artistAPI from '../services/artist';

const ArtistsPage = () => {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, verified, featured
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
    <div className="min-h-screen p-6 md:p-12 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Artists</h1>
        <p className="text-white/60">Discover and follow your favorite artists</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-full border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <span className="text-sm font-semibold text-white/60">Filter:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Artists', icon: Globe },
              { value: 'featured', label: 'Featured', icon: Star },
              { value: 'top', label: 'Top Artists', icon: TrendingUp },
              { value: 'verified', label: 'Verified', icon: Music }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  filterType === value
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
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
              className="px-4 py-2 bg-white/10 rounded-full border border-white/10 focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="-followerCount">Most Followers</option>
              <option value="-totalPlays">Most Plays</option>
              <option value="-monthlyListeners">Most Listeners</option>
              <option value="name">Name (A-Z)</option>
              <option value="-createdAt">Recently Added</option>
            </select>
          )}
        </div>
      </div>

      {/* Artists Grid */}
      {loading && artists.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Music className="w-16 h-16 text-white/20 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No artists found</h3>
          <p className="text-white/60">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {artists.map((artist) => (
              <div
                key={artist._id}
                onClick={() => navigate(`/artist/${artist._id}`)}
                className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="relative mb-4">
                  <div className="w-full aspect-square rounded-full overflow-hidden shadow-lg">
                    {artist.avatar ? (
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Music className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  {artist.verified && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="font-semibold truncate mb-1 group-hover:text-purple-400 transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-white/60">
                    {artist.followerCount?.toLocaleString()} followers
                  </p>
                  {artist.genres && artist.genres.length > 0 && (
                    <p className="text-xs text-white/40 mt-1 truncate">
                      {artist.genres[0]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && !loading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="btn-secondary px-8 py-3 rounded-full font-semibold"
              >
                Load More
              </button>
            </div>
          )}

          {loading && artists.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArtistsPage;
