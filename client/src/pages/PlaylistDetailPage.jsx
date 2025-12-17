import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  MoreVertical,
  Trash2,
  Plus,
  ArrowLeft,
  Clock,
  GripVertical,
  Edit2,
  Lock,
  Unlock,
  Users,
  Music
} from 'lucide-react';
import { playlistService, songService } from '../services/music';
import { usePlayer } from '../context/PlayerContext';
import toast from 'react-hot-toast';
import AddSongsModal from '../components/playlists/AddSongsModal';
import EditPlaylistModal from '../components/playlists/EditPlaylistModal';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playSong, track, isPlaying, togglePlayPause } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const response = await playlistService.get(playlistId);
      if (response.success) {
        setPlaylist(response.playlist);
        setIsOwner(response.isOwner);
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
      toast.error('Failed to load playlist');
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPlaylist = async () => {
    if (!playlist?.songs || playlist.songs.length === 0) {
      toast.error('Playlist is empty');
      return;
    }
    await playSong(playlist.songs[0], playlist.songs, 0);
  };

  const handlePlaySong = async (song, index) => {
    await playSong(song, playlist.songs, index);
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await playlistService.removeSong(playlistId, songId);
      if (response.success) {
        toast.success('Song removed from playlist');
        await loadPlaylist();
      }
    } catch (error) {
      console.error('Failed to remove song:', error);
      toast.error('Failed to remove song');
    }
  };

  const handleAddSongs = async (songIds) => {
    try {
      for (const songId of songIds) {
        await playlistService.addSong(playlistId, songId);
      }
      toast.success(`${songIds.length} song(s) added to playlist`);
      setShowAddSongs(false);
      await loadPlaylist();
    } catch (error) {
      console.error('Failed to add songs:', error);
      toast.error('Failed to add songs');
    }
  };

  const handleUpdatePlaylist = async (updates) => {
    try {
      const response = await playlistService.update(playlistId, updates);
      if (response.success) {
        toast.success('Playlist updated!');
        setShowEditModal(false);
        await loadPlaylist();
      }
    } catch (error) {
      console.error('Failed to update playlist:', error);
      toast.error('Failed to update playlist');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSongs = [...playlist.songs];
    const draggedSong = newSongs[draggedIndex];
    newSongs.splice(draggedIndex, 1);
    newSongs.splice(index, 0, draggedSong);

    setPlaylist({ ...playlist, songs: newSongs });
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      try {
        const songIds = playlist.songs.map(song => song._id);
        await playlistService.reorder(playlistId, songIds);
        toast.success('Playlist reordered');
      } catch (error) {
        console.error('Failed to reorder:', error);
        toast.error('Failed to save order');
        await loadPlaylist(); // Reload to reset
      }
    }
    setDraggedIndex(null);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!playlist?.songs) return '0 min';
    const totalSeconds = playlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Music className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Playlist not found</h2>
          <button
            onClick={() => navigate('/playlists')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  const isCurrentSong = (song) => track?._id === song._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/playlists')}
            className="mb-4 sm:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Playlists</span>
          </button>

          {/* Playlist Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {/* Cover */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
              {playlist.banner ? (
                <img
                  src={playlist.banner}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Music className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/50" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 w-full sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase">Playlist</span>
                {playlist.isPublic ? (
                  <span className="px-2 py-0.5 bg-emerald-100 rounded-full text-xs text-emerald-700 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    Public
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </span>
                )}
                {playlist.collaborative && (
                  <span className="px-2 py-0.5 bg-blue-100 rounded-full text-xs text-blue-700 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Collaborative
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 sm:mb-4">{playlist.name}</h1>

              {playlist.desc && (
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-2 sm:mb-4 line-clamp-2">{playlist.desc}</p>
              )}

              <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                <span className="font-semibold">{playlist.songs?.length || 0} songs</span>
                <span>•</span>
                <span>{getTotalDuration()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Play Button */}
          <button
            onClick={handlePlayPlaylist}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-current ml-0.5" />
          </button>

          {/* Add Songs Button */}
          {isOwner && (
            <button
              onClick={() => setShowAddSongs(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-emerald-600 hover:bg-emerald-50 text-emerald-600 rounded-full font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Songs</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Edit Button */}
          {isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 sm:p-3 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 transition-colors"
              title="Edit Playlist"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Songs List */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            {/* Table Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-[auto_1fr_2fr_1fr_auto] gap-4 px-6 py-3 border-b border-gray-200 text-gray-500 text-sm font-medium bg-gray-50">
              <div className="w-8">#</div>
              <div>Title</div>
              <div>Artist</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-8"></div>
            </div>

            {/* Songs */}
            <div>
              {playlist.songs.map((song, index) => (
                <div
                  key={`${song._id}-${index}`}
                  draggable={isOwner}
                  onDragStart={(e) => isOwner && handleDragStart(e, index)}
                  onDragOver={(e) => isOwner && handleDragOver(e, index)}
                  onDragEnd={isOwner ? handleDragEnd : undefined}
                  className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_2fr_1fr_auto] gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${isCurrentSong(song) ? 'bg-emerald-50' : ''} ${isOwner ? 'cursor-move' : ''}`}
                >
                  {/* Index / Drag Handle */}
                  <div className="w-8 flex items-center">
                    {isOwner ? (
                      <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                    ) : (
                      <span className="text-gray-500 text-sm hidden md:block">{index + 1}</span>
                    )}
                    <span className="text-gray-500 text-sm md:hidden">{index + 1}</span>
                  </div>

                  {/* Title & Image */}
                  <button
                    onClick={() => handlePlaySong(song, index)}
                    className="flex items-center gap-2 sm:gap-3 min-w-0 text-left"
                  >
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                      <img
                        src={song.image}
                        alt={song.name}
                        className="w-full h-full rounded object-cover"
                      />
                      {isCurrentSong(song) && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white fill-current" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-current" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium truncate text-sm sm:text-base ${isCurrentSong(song) ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {song.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate md:hidden">
                        {song.artist || song.desc}
                      </div>
                    </div>
                  </button>

                  {/* Artist - Desktop only */}
                  <div className="hidden md:flex items-center text-gray-600 truncate text-sm">
                    {song.artist || song.desc}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    {formatTime(song.duration)}
                  </div>

                  {/* Actions */}
                  <div className="w-8 flex items-center justify-center">
                    {isOwner && (
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === song._id ? null : song._id)}
                          className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>

                        {activeMenu === song._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                              <button
                                onClick={() => {
                                  handleRemoveSong(song._id);
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove from playlist
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-2xl border border-gray-200">
            <Music className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">No songs yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Add songs to start building your playlist</p>
            {isOwner && (
              <button
                onClick={() => setShowAddSongs(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium inline-flex items-center gap-2 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Songs
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddSongs && (
        <AddSongsModal
          playlistId={playlistId}
          existingSongIds={playlist.songs?.map(s => s._id) || []}
          onClose={() => setShowAddSongs(false)}
          onAdd={handleAddSongs}
        />
      )}

      {showEditModal && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePlaylist}
        />
      )}
    </div>
  );
}
