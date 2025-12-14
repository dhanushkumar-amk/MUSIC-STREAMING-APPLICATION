import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { songService } from '../../services/music';

export default function AddSongsModal({ playlistId, existingSongIds = [], onClose, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allSongs, setAllSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef(null);

  useEffect(() => {
    loadSongs();
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(allSongs);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allSongs.filter(song =>
        song.name.toLowerCase().includes(query) ||
        (song.artist && song.artist.toLowerCase().includes(query)) ||
        (song.desc && song.desc.toLowerCase().includes(query))
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const response = await songService.getAll();
      if (response.success) {
        // Filter out songs already in playlist
        const availableSongs = response.songs.filter(
          song => !existingSongIds.includes(song._id)
        );
        setAllSongs(availableSongs);
        setFilteredSongs(availableSongs);
      }
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSong = (songId) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const handleAdd = () => {
    if (selectedSongs.length > 0) {
      onAdd(selectedSongs);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] z-50 animate-in zoom-in-95 duration-200">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Add Songs to Playlist</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {searchQuery ? 'No songs found' : 'All songs are already in this playlist'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSongs.map((song) => {
                  const isSelected = selectedSongs.includes(song._id);
                  return (
                    <button
                      key={song._id}
                      onClick={() => toggleSong(song._id)}
                      className={`w-full p-3 rounded-lg transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-emerald-600/20 border-2 border-emerald-500'
                          : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600'
                            : 'border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>

                      {/* Song Image */}
                      <img
                        src={song.image}
                        alt={song.name}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />

                      {/* Song Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-medium truncate ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                          {song.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {song.artist || song.desc}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-gray-400 flex-shrink-0">
                        {formatTime(song.duration)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <p className="text-gray-400">
              {selectedSongs.length > 0 ? (
                <span>
                  <span className="text-emerald-400 font-semibold">{selectedSongs.length}</span> song{selectedSongs.length !== 1 ? 's' : ''} selected
                </span>
              ) : (
                'Select songs to add'
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={selectedSongs.length === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add {selectedSongs.length > 0 && `(${selectedSongs.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
