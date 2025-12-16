import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Music, Play, Plus } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddSongDialog = ({ open, onOpenChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { playSong, addToQueue, session } = useSession();

  // Fetch all songs on mount
  useEffect(() => {
    if (open) {
      fetchSongs();
    }
  }, [open]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const url = `${backendUrl}/api/song/list`;

      console.log('🔍 Fetching songs from:', url);
      console.log('🔑 Token:', token ? 'exists' : 'missing');

      if (!token) {
        console.error('❌ No access token found!');
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📀 Songs response:', response.data);

      if (response.data.success) {
        setSongs(response.data.songs);
        console.log(`✅ Loaded ${response.data.songs.length} songs`);
        toast.success(`Loaded ${response.data.songs.length} songs`);
      } else {
        console.error('❌ Response not successful:', response.data);
        toast.error('Failed to load songs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch songs:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error(`Failed to load songs: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlaySong = (song) => {
    console.log('🎵 Playing song:', song);
    console.log('🎵 Song ID:', song._id);
    console.log('🎵 Session:', session);

    if (!song || !song._id) {
      console.error('❌ Invalid song object:', song);
      toast.error('Invalid song');
      return;
    }

    try {
      playSong(song, 0);
      console.log('✅ playSong called successfully');
      toast.success(`Now playing: ${song.name}`);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error playing song:', error);
      toast.error('Failed to play song');
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    // If duration is already in MM:SS format
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    // If duration is in seconds
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-900">Choose a Song</DialogTitle>
          <DialogDescription className="text-gray-500 text-base">
            Click any song to play it for everyone in the session
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>

        {/* Songs List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-600 text-sm font-medium">Loading songs...</p>
              </div>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No songs found</p>
              {searchQuery && (
                <p className="text-gray-400 mt-2">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <div
                  key={song._id}
                  onClick={() => handlePlaySong(song)}
                  className="group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 hover:shadow-sm"
                >
                  {/* Album Art */}
                  <div className="relative">
                    <img
                      src={song.image}
                      alt={song.name}
                      className="w-16 h-16 rounded-lg object-cover shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-lg group-hover:text-emerald-700 transition-colors">
                      {song.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {song.desc || song.album}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-sm text-gray-400 font-medium">
                    {formatDuration(song.duration)}
                  </span>

                  {/* Play Icon */}
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Info */}
        <div className="pt-4 border-t text-center">
          <p className="text-gray-500 text-sm">
            {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongDialog;
