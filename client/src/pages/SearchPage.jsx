import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/music';
import { usePlayer } from '../context/PlayerContext';
import { Search, Music, Disc, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SongItem from '../components/SongItem';
import AlbumItem from '../components/AlbumItem';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { playWithId } = usePlayer();

  // Debounced autocomplete
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions(null);
        return;
      }

      try {
        const data = await searchService.autocomplete(searchQuery);
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Autocomplete failed:', error);
      }
    }, 300),
    []
  );

  // Full search
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    try {
      const data = await searchService.search(searchQuery);
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value) => {
    setQuery(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setSuggestions(null);
    setShowSuggestions(false);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'songs', label: 'Songs' },
    { id: 'albums', label: 'Albums' },
  ];

  const getFilteredResults = () => {
    if (!results) return null;

    if (activeTab === 'all') return results;
    if (activeTab === 'songs') return { songs: results.songs || [] };
    if (activeTab === 'albums') return { albums: results.albums || [] };
    return results;
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-full bg-white p-3 sm:p-6">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Search</h1>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="What do you want to listen to?"
              className="w-full pl-12 pr-12 py-3 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm sm:text-base"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions && query && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
              >
                {suggestions.songs?.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      Songs
                    </p>
                    {suggestions.songs.slice(0, 3).map((song) => (
                      <button
                        key={song._id}
                        onClick={() => {
                          playWithId(song._id);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <img
                          src={song.image}
                          alt={song.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{song.name}</p>
                          <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.albums?.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      Albums
                    </p>
                    {suggestions.albums.slice(0, 3).map((album) => (
                      <button
                        key={album._id}
                        onClick={() => {
                          setQuery(album.name);
                          handleSearch(album.name);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">{album.name}</p>
                          <p className="text-xs text-gray-500 truncate">Album</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold transition-colors relative whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Top Result */}
          {activeTab === 'all' && filteredResults.songs?.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Result</h2>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors cursor-pointer max-w-md"
                onClick={() => playWithId(filteredResults.songs[0]._id)}
              >
                <img
                  src={filteredResults.songs[0].image}
                  alt={filteredResults.songs[0].name}
                  className="w-24 h-24 rounded-xl object-cover mb-4 shadow-lg"
                />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {filteredResults.songs[0].name}
                </h3>
                <p className="text-gray-600 mb-4">{filteredResults.songs[0].desc}</p>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Song</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Songs */}
          {filteredResults.songs?.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredResults.songs.slice(activeTab === 'all' ? 1 : 0).map((song, index) => (
                  <motion.div
                    key={song._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongItem
                      name={song.name}
                      desc={song.desc}
                      id={song._id}
                      image={song.image}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Albums */}
          {filteredResults.albums?.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredResults.albums.map((album, index) => (
                  <motion.div
                    key={album._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AlbumItem
                      name={album.name}
                      desc={album.desc}
                      id={album._id}
                      image={album.image}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!filteredResults.songs?.length && !filteredResults.albums?.length && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try searching for something else</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !results && !query && (
        <div className="text-center py-20">
          <Search className="w-20 h-20 mx-auto mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Search for music</h2>
          <p className="text-gray-500">Find your favorite songs, albums, and artists</p>
        </div>
      )}
    </div>
  );
}
