import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Music, Disc, User } from 'lucide-react';
import { searchService } from '../services/music';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ songs: [], albums: [], users: [] });
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  const { playSong } = usePlayer();
  const navigate = useNavigate();

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const response = await searchService.getRecent();
      if (response.success) {
        setRecentSearches(response.searches);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ songs: [], albums: [], users: [] });
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      const response = await searchService.search(searchQuery);
      if (response.success) {
        setResults(response.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleSaveSearch = async (searchQuery, type = 'query', resultId = null) => {
    try {
      await searchService.saveRecent(searchQuery, type, resultId);
      await loadRecentSearches();
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleSongClick = async (song) => {
    await playSong(song, [song], 0);
    await handleSaveSearch(song.name, 'song', song.id || song._id);
    setShowResults(false);
    setQuery('');
  };

  const handleAlbumClick = (album) => {
    navigate(`/album/${album.id || album._id}`);
    handleSaveSearch(album.name, 'album', album.id || album._id);
    setShowResults(false);
    setQuery('');
  };

  const handleUserClick = (user) => {
    navigate(`/profile/${user.id || user._id}`);
    handleSaveSearch(user.email, 'user', user.id || user._id);
    setShowResults(false);
    setQuery('');
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search.query);
    handleSearch(search.query);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults({ songs: [], albums: [], users: [] });
    setIsSearching(false);
    inputRef.current?.focus();
  };

  const handleClearAllRecent = async () => {
    try {
      await searchService.clearRecent();
      setRecentSearches([]);
      toast.success('Recent searches cleared');
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
      toast.error('Failed to clear searches');
    }
  };

  const handleDeleteRecentSearch = async (searchId, e) => {
    e.stopPropagation();
    try {
      await searchService.deleteRecent(searchId);
      setRecentSearches(prev => prev.filter(s => s._id !== searchId));
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  };

  const hasResults = results.songs.length > 0 || results.albums.length > 0 || results.users.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder="Search songs, albums, artists..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[600px] overflow-y-auto z-50">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          ) : isSearching && hasResults ? (
            <div className="p-4">
              {/* Songs */}
              {results.songs.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <Music className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Songs</h3>
                  </div>
                  {results.songs.map((song) => (
                    <button
                      key={song.id || song._id}
                      onClick={() => handleSongClick(song)}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 group"
                    >
                      <img
                        src={song.image}
                        alt={song.name}
                        className="w-12 h-12 rounded-md object-cover shadow-sm"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600">
                          {song.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{song.artist || song.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Albums */}
              {results.albums.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <Disc className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Albums</h3>
                  </div>
                  {results.albums.map((album) => (
                    <button
                      key={album.id || album._id}
                      onClick={() => handleAlbumClick(album)}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 group"
                    >
                      <img
                        src={album.image}
                        alt={album.name}
                        className="w-12 h-12 rounded-md object-cover shadow-sm"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600">
                          {album.name}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{album.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Users</h3>
                  </div>
                  {results.users.map((user) => (
                    <button
                      key={user.id || user._id}
                      onClick={() => handleUserClick(user)}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.email} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600">
                          {user.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : isSearching && !hasResults ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No results found for "{query}"</p>
            </div>
          ) : (
            /* Recent Searches */
            <div className="p-4">
              {recentSearches.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-semibold text-gray-700 uppercase">Recent Searches</h3>
                    </div>
                    <button
                      onClick={handleClearAllRecent}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((search) => (
                    <button
                      key={search._id}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 group"
                    >
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 group-hover:text-emerald-600">
                          {search.query}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteRecentSearch(search._id, e)}
                        className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No recent searches</p>
                  <p className="text-sm text-gray-400 mt-1">Start searching to see your history</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
