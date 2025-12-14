import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Music, Disc, User, Command } from 'lucide-react';
import { searchService } from '../services/music';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState({ songs: [], albums: [], users: [] });
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  const { playSong } = usePlayer();
  const navigate = useNavigate();

  // Keyboard shortcut to open/close (Ctrl+F or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    } else {
      setQuery('');
      setResults({ songs: [], albums: [], users: [] });
      setIsSearching(false);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const allResults = [
        ...results.songs.map(s => ({ ...s, type: 'song' })),
        ...results.albums.map(a => ({ ...a, type: 'album' })),
        ...results.users.map(u => ({ ...u, type: 'user' }))
      ];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        e.preventDefault();
        handleResultClick(allResults[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

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
        setSelectedIndex(0);
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
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleResultClick = async (item) => {
    if (item.type === 'song') {
      await playSong(item, [item], 0);
      await handleSaveSearch(item.name, 'song', item.id || item._id);
    } else if (item.type === 'album') {
      navigate(`/album/${item.id || item._id}`);
      await handleSaveSearch(item.name, 'album', item.id || item._id);
    } else if (item.type === 'user') {
      navigate(`/profile/${item.id || item._id}`);
      await handleSaveSearch(item.email, 'user', item.id || item._id);
    }
    setIsOpen(false);
  };

  const handleRecentSearchClick = (search) => {
    setQuery(search.query);
    handleSearch(search.query);
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

  if (!isOpen) return null;

  const hasResults = results.songs.length > 0 || results.albums.length > 0 || results.users.length > 0;
  const allResults = [
    ...results.songs.map(s => ({ ...s, type: 'song' })),
    ...results.albums.map(a => ({ ...a, type: 'album' })),
    ...results.users.map(u => ({ ...u, type: 'user' }))
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search songs, albums, artists..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
            />
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                <Command className="w-3 h-3" />
                F
              </kbd>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : isSearching && hasResults ? (
              <div className="p-2">
                {/* Songs */}
                {results.songs.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Songs
                    </div>
                    {results.songs.map((song, idx) => {
                      const globalIdx = idx;
                      return (
                        <button
                          key={song.id || song._id}
                          onClick={() => handleResultClick({ ...song, type: 'song' })}
                          className={`w-full px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedIndex === globalIdx ? 'bg-emerald-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <img
                            src={song.image}
                            alt={song.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-medium truncate ${
                              selectedIndex === globalIdx ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {song.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{song.artist || song.desc}</p>
                          </div>
                          <Music className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Albums */}
                {results.albums.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Albums
                    </div>
                    {results.albums.map((album, idx) => {
                      const globalIdx = results.songs.length + idx;
                      return (
                        <button
                          key={album.id || album._id}
                          onClick={() => handleResultClick({ ...album, type: 'album' })}
                          className={`w-full px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedIndex === globalIdx ? 'bg-emerald-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <img
                            src={album.image}
                            alt={album.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-medium truncate ${
                              selectedIndex === globalIdx ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {album.name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{album.desc}</p>
                          </div>
                          <Disc className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Users
                    </div>
                    {results.users.map((user, idx) => {
                      const globalIdx = results.songs.length + results.albums.length + idx;
                      return (
                        <button
                          key={user.id || user._id}
                          onClick={() => handleResultClick({ ...user, type: 'user' })}
                          className={`w-full px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                            selectedIndex === globalIdx ? 'bg-emerald-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.email} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`font-medium truncate ${
                              selectedIndex === globalIdx ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {user.email}
                            </p>
                          </div>
                          <User className="w-4 h-4 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : isSearching && !hasResults ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No results found for "{query}"</p>
              </div>
            ) : (
              /* Recent Searches */
              <div className="p-2">
                {recentSearches.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase">
                        Recent Searches
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
                        className="w-full px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{search.query}</p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No recent searches</p>
                    <p className="text-sm text-gray-400 mt-1">Start searching to see your history</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↵</kbd>
                  to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
