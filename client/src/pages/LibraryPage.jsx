import { useEffect, useState } from "react";
import { libraryService } from "../services/music";
import { usePlayer } from "../context/PlayerContext";
import { Play, Heart, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LibraryPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, track: currentSong, addToQueue, playNextInQueue } = usePlayer();

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = async () => {
    try {
      const data = await libraryService.getLikedSongs();
      if (data.success) {
        setSongs(data.songs);
      }
    } catch (error) {
      console.error("Failed to fetch library:", error);
      toast.error("Failed to load liked songs");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (songId) => {
    try {
      await libraryService.unlikeSong(songId);
      setSongs(songs.filter(s => s._id !== songId));
      toast.success("Removed from Liked Songs");
    } catch (error) {
      toast.error("Failed to remove song");
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-end gap-6 mb-8">
        <div className="w-32 h-32 md:w-52 md:h-52 bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl rounded-2xl flex items-center justify-center flex-shrink-0">
          <Heart className="w-16 h-16 md:w-24 md:h-24 text-white fill-white" />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Playlist</span>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-gray-900">Liked Songs</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <span className="text-gray-900 font-semibold">You</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </div>

      {songs.length > 0 ? (
        <>
          {/* Actions */}
          <div className="flex items-center gap-6 mb-8">
            <Button
              onClick={handlePlayAll}
              size="icon"
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl hover:scale-105 transition-all"
            >
              <Play className="w-6 h-6 fill-white text-white ml-1" />
            </Button>
          </div>

          {/* List Header */}
          <div className="grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 border-b border-gray-200 text-sm text-gray-500 font-medium mb-2">
            <div>#</div>
            <div>Title</div>
            <div className="hidden md:block">Album</div>
            <div className="hidden lg:block text-right"><Clock className="w-4 h-4 ml-auto" /></div>
            <div></div>
          </div>

          {/* Songs List */}
          <div className="flex flex-col">
            {songs.map((song, index) => (
              <div
                key={song._id}
                className={`grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group ${
                  currentSong?._id === song._id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-900">
                  {currentSong?._id === song._id ? (
                    <div className="w-4 h-4 animate-pulse text-emerald-500">♫</div>
                  ) : (
                    <>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button
                        onClick={() => playSong(song, songs, index)}
                        className="hidden group-hover:block"
                      >
                        <Play className="w-4 h-4 fill-gray-900 text-gray-900" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <img
                    src={song.image}
                    alt={song.name}
                    className="w-10 h-10 rounded object-cover shadow-sm bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={`font-medium truncate ${
                      currentSong?._id === song._id ? 'text-emerald-500' : 'text-gray-900'
                    }`}>
                      {song.name}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-700 truncate">
                      {song.artist}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center text-sm text-gray-500 group-hover:text-gray-700 truncate">
                  {song.album || "Single"}
                </div>

                <div className="hidden lg:flex items-center justify-end text-sm text-gray-500 font-mono">
                  {song.duration}
                </div>

                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-full transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => addToQueue(song._id)}>
                        Add to queue
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => playNextInQueue(song._id)}>
                        Play next
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUnlike(song._id)}
                        className="text-red-600"
                      >
                        Remove from Liked Songs
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold mb-2 text-gray-900">No liked songs yet</h3>
          <p className="text-gray-500">Songs you like will appear here</p>
        </div>
      )}
    </div>
  );
}
