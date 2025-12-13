import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { url } from '../../App';
import {
  Music, Users, Disc, ListMusic, TrendingUp,
  Clock, Play, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${url}/api/stats/dashboard`);
      if (response.data.success) {
        setStats(response.data.stats);
        setError(null);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
      setStats({
        totalSongs: 0,
        totalAlbums: 0,
        totalUsers: 0,
        totalPlaylists: 0,
        songGrowth: 0,
        albumGrowth: 0,
        userGrowth: 0,
        playlistGrowth: 0,
        recentSongs: [],
        topSongs: [],
        recentUsers: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Songs',
      value: stats?.totalSongs || 0,
      growth: stats?.songGrowth || 0,
      icon: Music,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Albums',
      value: stats?.totalAlbums || 0,
      growth: stats?.albumGrowth || 0,
      icon: Disc,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      growth: stats?.userGrowth || 0,
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Playlists',
      value: stats?.totalPlaylists || 0,
      growth: stats?.playlistGrowth || 0,
      icon: ListMusic,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Statistics</h1>
        <p className="text-gray-600 mt-1">Overview of your platform</p>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-700">Could not fetch live data. Showing default values.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.growth > 0 && (
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-semibold">+{card.growth}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Play className="w-5 h-5 mr-2 text-green-500" />
            Top Songs by Plays
          </h2>
          {stats?.topSongs && stats.topSongs.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topSongs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="playCount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Music className="w-12 h-12 mb-2" />
              <p>No play data available yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Content Distribution</h2>
          {(stats?.totalSongs > 0 || stats?.totalAlbums > 0 || stats?.totalPlaylists > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Songs', value: stats?.totalSongs || 0 },
                    { name: 'Albums', value: stats?.totalAlbums || 0 },
                    { name: 'Playlists', value: stats?.totalPlaylists || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Disc className="w-12 h-12 mb-2" />
              <p>No content yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Recent Songs
          </h2>
          <div className="space-y-3">
            {stats?.recentSongs && stats.recentSongs.length > 0 ? (
              stats.recentSongs.map((song, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={song.image}
                    alt={song.name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48?text=Song';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{song.name}</p>
                    <p className="text-sm text-gray-500 truncate">{song.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{song.playCount || 0} plays</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">No songs yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Recent Users
          </h2>
          <div className="space-y-3">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold mr-3">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
