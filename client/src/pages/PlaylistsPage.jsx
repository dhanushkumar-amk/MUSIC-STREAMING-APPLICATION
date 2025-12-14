import { useState, useEffect } from 'react';
import { playlistService } from '../services/music';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Music, MoreHorizontal, Edit2, Trash2, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [renamePlaylist, setRenamePlaylist] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const data = await playlistService.list();
      if (data.success) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch playlists:', error);
        toast.error('Failed to load playlists');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      const data = await playlistService.create(newPlaylistName);
      if (data.success) {
        setPlaylists([...playlists, data.playlist]);
        setNewPlaylistName('');
        setIsCreateOpen(false);
        toast.success('Playlist created');
      }
    } catch (error) {
      console.error('Failed to create playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const handleRenamePlaylist = async (e) => {
    e.preventDefault();
    if (!renameValue.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    try {
      await playlistService.rename(renamePlaylist._id, renameValue);
      setPlaylists(
        playlists.map((p) =>
          p._id === renamePlaylist._id ? { ...p, name: renameValue } : p
        )
      );
      setIsRenameOpen(false);
      setRenamePlaylist(null);
      setRenameValue('');
      toast.success('Playlist renamed');
    } catch (error) {
      console.error('Failed to rename playlist:', error);
      toast.error('Failed to rename playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await playlistService.delete(playlistId);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
      toast.success('Playlist deleted');
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      toast.error('Failed to delete playlist');
    }
  };

  const openRenameDialog = (playlist) => {
    setRenamePlaylist(playlist);
    setRenameValue(playlist.name);
    setIsRenameOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Your Playlists</h1>
            <p className="text-gray-500 text-lg">{playlists.length} playlists</p>
          </div>

          {/* Create Playlist Button */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                <Plus className="w-5 h-5" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <Input
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-white border-gray-300"
                  autoFocus
                />
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Playlists Grid */}
      {playlists.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {playlists.map((playlist, index) => (
            <motion.div
              key={playlist._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group relative"
            >
              <div
                onClick={() => navigate(`/playlist/${playlist._id}`)}
                className="cursor-pointer"
              >
                {/* Playlist Card */}
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  {/* Playlist Image */}
                  <div className="relative overflow-hidden rounded-lg mb-4 bg-gray-200 aspect-square">
                    {playlist.banner ? (
                      <img
                        src={playlist.banner}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                        <Music className="w-16 h-16 text-white" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle play playlist
                        }}
                        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
                      >
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Playlist Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>

                    {/* More Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openRenameDialog(playlist);
                          }}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(playlist._id);
                          }}
                          className="gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to get started</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </Button>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRenamePlaylist} className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="bg-white border-gray-300"
              autoFocus
            />
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
