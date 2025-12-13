import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../App';
import { toast } from 'react-toastify';
import { Trash2, Users, Loader2, AlertCircle, Search, X, CheckSquare, Square } from 'lucide-react';

const UserManagement = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${url}/api/user/list`);

      if (response.data.success) {
        setData(response.data.users);
        setFilteredData(response.data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = data.filter(user =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const removeUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${url}/api/user/${id}`);

      if (response.data.success) {
        toast.success('User deleted successfully');
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const bulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.length} selected user(s)? This cannot be undone!`)) {
      return;
    }

    try {
      await Promise.all(selectedUsers.map(id =>
        axios.delete(`${url}/api/user/${id}`)
      ));
      toast.success(`${selectedUsers.length} user(s) deleted`);
      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to delete some users');
    }
  };

  const toggleSelect = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredData.map(user => user._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
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
              <p className="text-red-700 font-semibold">Error Loading Users</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage registered users</p>
      </div>

      {/* Search and Bulk Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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

        {selectedUsers.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            Delete ({selectedUsers.length})
          </button>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No users found' : 'No users yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Users will appear here once they register'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[50px_80px_1fr_1fr_150px_100px] items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            <div className="flex items-center justify-center">
              <button onClick={toggleSelectAll} className="text-gray-600 hover:text-gray-800">
                {selectedUsers.length === filteredData.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            </div>
            <div>Avatar</div>
            <div>Name</div>
            <div>Email</div>
            <div>Joined</div>
            <div>Action</div>
          </div>

          {/* Users List */}
          <div className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 sm:grid-cols-[50px_80px_1fr_1fr_150px_100px] items-center gap-4 p-4 hover:bg-gray-50 transition ${
                  selectedUsers.includes(item._id) ? 'bg-blue-50' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="hidden sm:flex items-center justify-center">
                  <button
                    onClick={() => toggleSelect(item._id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {selectedUsers.includes(item._id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Avatar */}
                <div className="flex justify-center sm:justify-start">
                  {item.avatar ? (
                    <img
                      className="w-16 h-16 rounded-full object-cover shadow-sm"
                      src={item.avatar}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64?text=' + item.name?.charAt(0);
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                      {item.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.isVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-gray-400">Not verified</span>
                    )}
                  </p>
                </div>

                {/* Email */}
                <p className="text-gray-600 truncate text-center sm:text-left">{item.email}</p>

                {/* Joined Date */}
                <p className="text-gray-600 text-sm text-center sm:text-left">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>

                {/* Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => removeUser(item._id)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete user"
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
              Total: <span className="font-semibold">{filteredData.length}</span> user{filteredData.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtered from ${data.length})`}
            </p>
            {selectedUsers.length > 0 && (
              <p className="text-sm text-blue-600 font-semibold">
                {selectedUsers.length} selected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
