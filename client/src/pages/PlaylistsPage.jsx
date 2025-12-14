import { useState, useEffect } from 'react';
import { Plus, Music, Play, MoreVertical, Trash2, Edit2, Lock, Unlock, Users } from 'lucide-react';
import { playlistService } from '../services/music';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreatePlaylistModal from '../components/playlists/CreatePlaylistModal';
import EditPlaylistModal from '../components/playlists/EditPlaylistModal';
import DeleteConfirmModal from '../components/playlists/DeleteConfirmModal';

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const { playSong } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistService.list();
      if (response.success) {
        setPlaylists(response.playlists);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (name, desc, isPublic) => {
    try {
      const response = await playlistService.create(name, desc, isPublic);
      if (response.success) {
        toast.success('Playlist created!');
        setShowCreateModal(false);
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const handleUpdatePlaylist = async (playlistId, updates) => {
    try {
      const response = await playlistService.update(playlistId, updates);
      if (response.success) {
        toast.success('Playlist updated!');
        setEditingPlaylist(null);
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const response = await playlistService.delete(playlistId);
      if (response.success) {
        toast.success('Playlist deleted');
        setDeletingPlaylist(null);
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const handlePlayPlaylist = async (playlist) => {
    if (playlist.songs && playlist.songs.length > 0) {
      await playSong(playlist.songs[0], playlist.songs, 0);
      toast.success(`Playing ${playlist.name}`);
    } else {
      toast.error('Playlist is empty');
    }
  };

  const handleToggleCollaborative = async (playlistId) => {
    try {
      const response = await playlistService.toggleCollaborative(playlistId);
      if (response.success) {
        toast.success(response.message);
        await loadPlaylists();
      }
    } catch (error) {
      console.error('Failed to toggle collaborative:', error);
      toast.error('Failed to update playlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Playlists</h1>
        <p className="text-gray-600">Create and manage your music collections</p>
      </div>

      {/* Create Playlist Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="mb-8 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
      >
        <Plus className="w-5 h-5" />
        Create Playlist
      </button>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-20">
          <Music className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Playlist Cover */}
              <div
                className="relative aspect-square bg-gradient-to-br from-emerald-400 to-emerald-600 cursor-pointer"
                onClick={() => navigate(`/playlist/${playlist._id}`)}
              >
                {playlist.banner ? (
                  <img
                    src={playlist.banner}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-20 h-20 text-white/50" />
                  </div>
                )}

                {/* Play Button Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlist);
                  }}
                  className="absolute bottom-4 right-4 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>

                {/* Privacy Badge */}
                <div className="absolute top-3 left-3">
                  {playlist.isPublic ? (
                    <div className="px-2 py-1 bg-white/90 rounded-full flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Unlock className="w-3 h-3" />
                      Public
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-white/90 rounded-full flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Lock className="w-3 h-3" />
                      Private
                    </div>
                  )}
                </div>

                {/* Collaborative Badge */}
                {playlist.collaborative && (
                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-white/90 rounded-full flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Users className="w-3 h-3" />
                      Collab
                    </div>
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/playlist/${playlist._id}`)}>
                    <h3 className="font-bold text-gray-900 truncate text-lg mb-1">
                      {playlist.name}
                    </h3>
                    {playlist.desc && (
                      <p className="text-sm text-gray-600 line-clamp-2">{playlist.desc}</p>
                    )}
                  </div>

                  {/* Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === playlist._id ? null : playlist._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === playlist._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => {
                              setEditingPlaylist(playlist);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              handleToggleCollaborative(playlist._id);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            {playlist.collaborative ? 'Make Private' : 'Make Collaborative'}
                          </button>
                          <button
                            onClick={() => {
                              setDeletingPlaylist(playlist);
                              setActiveMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Playlist
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  {playlist.songs?.length || 0} {playlist.songs?.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}

      {editingPlaylist && (
        <EditPlaylistModal
          playlist={editingPlaylist}
          onClose={() => setEditingPlaylist(null)}
          onUpdate={handleUpdatePlaylist}
        />
      )}

      {deletingPlaylist && (
        <DeleteConfirmModal
          playlist={deletingPlaylist}
          onClose={() => setDeletingPlaylist(null)}
          onConfirm={() => handleDeletePlaylist(deletingPlaylist._id)}
        />
      )}
    </div>
  );
}
