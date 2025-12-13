import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Disc, Users, BarChart3, Plus, List } from 'lucide-react';
import { assets } from '../../assets/assets';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add Song',
      description: 'Upload a new song to your library',
      icon: Music,
      color: 'from-green-500 to-green-600',
      path: '/add-song'
    },
    {
      title: 'Add Album',
      description: 'Create a new album collection',
      icon: Disc,
      color: 'from-purple-500 to-purple-600',
      path: '/add-album'
    },
    {
      title: 'View Songs',
      description: 'Manage all your songs',
      icon: List,
      color: 'from-blue-500 to-blue-600',
      path: '/list-songs'
    },
    {
      title: 'View Albums',
      description: 'Manage your albums',
      icon: List,
      color: 'from-pink-500 to-pink-600',
      path: '/list-albums'
    },
    {
      title: 'Users',
      description: 'Manage registered users',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      path: '/users'
    },
    {
      title: 'Statistics',
      description: 'View detailed analytics',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      path: '/stats'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-12 text-center">
        <img src={assets.logo} alt="Logo" className="w-40 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to Admin Panel
        </h1>
        <p className="text-xl text-gray-600">
          Manage your music streaming platform
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 text-left border border-gray-100 hover:border-transparent hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto mt-12">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
              <p className="text-green-100">
                Upload your first song or create an album to begin
              </p>
            </div>
            <button
              onClick={() => navigate('/add-song')}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Song
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
