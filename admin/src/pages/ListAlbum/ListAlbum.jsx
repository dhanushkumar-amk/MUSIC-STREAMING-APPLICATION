import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../App';
import { toast } from 'react-toastify';
import { Trash2, Disc, Loader2, AlertCircle, Search, X, CheckSquare, Square } from 'lucide-react';

const ListAlbum = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState([]);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${url}/api/album/list`);

      if (response.data.success) {
        setData(response.data.albums);
        setFilteredData(response.data.albums);
      } else {
        setError('Failed to fetch albums');
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError(error.response?.data?.message || 'Failed to load albums');
      toast.error('Error loading albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    const filtered = data.filter(album =>
      (album.name && album.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (album.desc && album.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const removeAlbum = async (id) => {
    if (!window.confirm('Are you sure you want to delete this album?')) {
      return;
    }

    try {
      const response = await axios.post(`${url}/api/album/remove`, { id });

      if (response.data.success) {
        toast.success('Album deleted successfully');
        await fetchAlbums();
      }
    } catch (error) {
      console.error('Error removing album:', error);
      toast.error(error.response?.data?.message || 'Failed to delete album');
    }
  };

  const bulkDelete = async () => {
    if (selectedAlbums.length === 0) {
      toast.error('No albums selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedAlbums.length} selected album(s)?`)) {
      return;
    }

    try {
      await Promise.all(selectedAlbums.map(id =>
        axios.post(`${url}/api/album/remove`, { id })
      ));
      toast.success(`${selectedAlbums.length} album(s) deleted`);
      setSelectedAlbums([]);
      await fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete some albums');
    }
  };

  const toggleSelect = (id) => {
    setSelectedAlbums(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAlbums.length === filteredData.length) {
      setSelectedAlbums([]);
    } else {
      setSelectedAlbums(filteredData.map(album => album._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading albums...</p>
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
              <p className="text-red-700 font-semibold">Error Loading Albums</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAlbums}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">All Albums</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your album collection</p>
      </div>

      {/* Search and Bulk Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
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

        {selectedAlbums.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedAlbums.length})
          </button>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Disc className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No albums found' : 'No albums yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Create your first album'}
          </p>
          {!searchTerm && (
            <a
              href="/add-album"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add Album
            </a>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[50px_80px_1fr_2fr_100px] items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            <div className="flex items-center justify-center">
              <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-800">
                {selectedAlbums.length === filteredData.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </div>
            <div>Image</div>
            <div>Name</div>
            <div>Description</div>
            <div>Action</div>
          </div>

          {/* Albums List */}
          <div className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 sm:grid-cols-[50px_80px_1fr_2fr_100px] items-center gap-4 p-4 hover:bg-gray-50 transition ${
                  selectedAlbums.includes(item._id) ? 'bg-purple-50' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="hidden sm:flex items-center justify-center">
                  <button
                    onClick={() => toggleSelect(item._id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {selectedAlbums.includes(item._id) ? (
                      <CheckSquare className="w-5 h-5 text-purple-600" />
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
                    e.target.src = 'https://via.placeholder.com/64?text=Album';
                  }}
                />

                {/* Name & Color */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: item.bgColour || '#ccc' }}
                      title={`Color: ${item.bgColour}`}
                    ></div>
                    <span className="text-xs text-gray-500">{item.bgColour}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 line-clamp-2 text-center sm:text-left">{item.desc || 'No description'}</p>

                {/* Actions */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => removeAlbum(item._id)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete album"
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
              Total: <span className="font-semibold">{filteredData.length}</span> album{filteredData.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtered from ${data.length})`}
            </p>
            {selectedAlbums.length > 0 && (
              <p className="text-sm text-purple-600 font-semibold">
                {selectedAlbums.length} selected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListAlbum;
