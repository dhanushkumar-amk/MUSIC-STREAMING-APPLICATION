import { useSession } from '@/context/SessionContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Music, Play, Plus } from 'lucide-react';
import { useState } from 'react';
import AddSongDialog from './AddSongDialog';

const SessionQueue = () => {
  const { queue, currentSong, playSong } = useSession();
  const [showAddSong, setShowAddSong] = useState(false);

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
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-600" />
              Queue
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            onClick={() => setShowAddSong(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Songs</span>
          </Button>
        </div>

        {/* Current Song */}
        {currentSong && (
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 border-b">
            <p className="text-xs font-bold text-white/90 mb-2 uppercase tracking-wider">
              Now Playing
            </p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentSong.image}
                  alt={currentSong.name}
                  className="w-14 h-14 rounded-lg object-cover shadow-lg"
                />
                <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">
                  {currentSong.name}
                </p>
                <p className="text-xs text-white/80 truncate">
                  {currentSong.desc || currentSong.album}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1 h-4 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-4 bg-white/90 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {queue.length === 0 ? (
              <div className="text-center py-16">
                <Music className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Queue is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add songs to get started</p>
                <Button
                  onClick={() => setShowAddSong(true)}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Songs
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {queue.map((song, index) => (
                  <div
                    key={song._id || index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all group cursor-pointer border border-transparent hover:border-emerald-200"
                    onClick={() => playSong(song)}
                  >
                    {/* Position */}
                    <span className="text-sm font-semibold text-gray-400 w-6 text-center group-hover:text-emerald-600 transition-colors">
                      {index + 1}
                    </span>

                    {/* Album Art */}
                    <div className="relative">
                      <img
                        src={song.image}
                        alt={song.name}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {song.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {song.desc || song.album}
                      </p>
                    </div>

                    {/* Duration */}
                    <span className="text-xs text-gray-400 flex-shrink-0 font-medium">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Song Dialog */}
      <AddSongDialog open={showAddSong} onOpenChange={setShowAddSong} />
    </>
  );
};

export default SessionQueue;
