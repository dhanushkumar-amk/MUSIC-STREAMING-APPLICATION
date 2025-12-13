import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../App';
import { toast } from 'react-toastify';
import { Trash2, Music, Loader2, AlertCircle, Search, X, Edit2, CheckSquare, Square } from 'lucide-react';

const ListSong = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${url}/api/song/list`);

      if (response.data.success) {
        setData(response.data.songs);
        setFilteredData(response.data.songs);
      } else {
        setError('Failed to fetch songs');
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      setError(error.response?.data?.message || 'Failed to load songs');
      toast.error('Error loading songs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const filtered = data.filter(song =>
      (song.name && song.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (song.desc && song.desc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const removeSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    try {
      const response = await axios.post(`${url}/api/song/remove`, { id });

      if (response.data.success) {
        toast.success('Song deleted successfully');
        await fetchSongs();
      }
    } catch (error) {
      console.error('Error removing song:', error);
      toast.error(error.response?.data?.message || 'Failed to delete song');
    }
  };

  const bulkDelete = async () => {
    if (selectedSongs.length === 0) {
      toast.error('No songs selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedSongs.length} selected song(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedSongs.map(id =>
        axios.post(`${url}/api/song/remove`, { id })
      ));
      toast.success(`${selectedSongs.length} song(s) deleted`);
      setSelectedSongs([]);
      await fetchSongs();
    } catch (error) {
      toast.error('Failed to delete some songs');
    }
  };

  const toggleSelect = (id) => {
    setSelectedSongs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSongs.length === filteredData.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(filteredData.map(song => song._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading songs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-red-700 font-semibold">Error Loading Songs</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchSongs}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Songs</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your music library</p>
      </div>

      {/* Search and Bulk Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {selectedSongs.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedSongs.length})
          </button>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No songs found' : 'No songs yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Start by adding your first song'}
          </p>
          {!searchTerm && (
            <a
              href="/add-song"
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Song
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[50px_80px_1fr_1fr_120px_100px] items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            <div className="flex items-center justify-center">
              <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-800">
                {selectedSongs.length === filteredData.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </div>
            <div>Image</div>
            <div>Name</div>
            <div>Album</div>
            <div>Duration</div>
            <div>Action</div>
          </div>

          {/* Songs List */}
          <div className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 sm:grid-cols-[50px_80px_1fr_1fr_120px_100px] items-center gap-4 p-4 hover:bg-gray-50 transition ${
                  selectedSongs.includes(item._id) ? 'bg-green-50' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="hidden sm:flex items-center justify-center">
                  <button
                    onClick={() => toggleSelect(item._id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {selectedSongs.includes(item._id) ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Image */}
                <img
                  className="w-16 h-16 rounded-lg object-cover shadow-sm mx-auto sm:mx-0"
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/64?text=Song';
                  }}
                />

                {/* Name */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500 truncate">{item.desc || 'No description'}</p>
                </div>

                {/* Album */}
                <p className="text-gray-600 truncate text-center sm:text-left">{item.album || 'No Album'}</p>

                {/* Duration */}
                <p className="text-gray-600 text-center sm:text-left">{item.duration || 'N/A'}</p>

                {/* Actions */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => removeSong(item._id)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete song"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold">{filteredData.length}</span> song{filteredData.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtered from ${data.length})`}
            </p>
            {selectedSongs.length > 0 && (
              <p className="text-sm text-green-600 font-semibold">
                {selectedSongs.length} selected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSong;
