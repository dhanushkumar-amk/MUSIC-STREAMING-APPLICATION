import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, ListMusic, Maximize2, Repeat, Repeat1, Shuffle, Heart } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { libraryService } from "@/services/music";
import toast from "react-hot-toast";

export default function Player() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    shuffle,
    toggleShuffle,
    loopMode,
    cycleLoopMode,
    volume,
    setVolume,
    currentTime,
    duration,
    seek
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(75);

  useEffect(() => {
    // Check if song is liked (you'd need to implement this check)
    setIsLiked(false);
  }, [currentSong]);

  if (!currentSong) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await libraryService.unlikeSong(currentSong._id);
        setIsLiked(false);
        toast.success("Removed from Liked Songs");
      } else {
        await libraryService.likeSong(currentSong._id);
        setIsLiked(true);
        toast.success("Added to Liked Songs");
      }
    } catch (error) {
      toast.error("Failed to update library");
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl bg-black/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 shadow-2xl z-50 transition-all hover:scale-[1.01] hover:bg-black/95 group">
      <div className="flex items-center justify-between gap-6">

        {/* Left: Song Info + Like */}
        <div className="flex items-center gap-4 w-1/4 min-w-0">
          <div className="flex items-center gap-3 bg-white/5 pr-4 rounded-full p-1 border border-white/5 transition-colors hover:bg-white/10 cursor-pointer min-w-0">
            <img
              src={currentSong.image || "https://placehold.co/50"}
              alt={currentSong.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              style={{
                animation: isPlaying ? 'spin 3s linear infinite' : 'none'
              }}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white leading-none line-clamp-1">{currentSong.name}</h4>
              <p className="text-[10px] text-zinc-400 leading-tight line-clamp-1">{currentSong.artist}</p>
            </div>
          </div>
          <button
            onClick={handleLike}
            className={cn(
              "p-2 rounded-full transition-all hover:scale-110",
              isLiked ? "text-primary" : "text-zinc-400 hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>
        </div>

        {/* Center: Controls + Progress */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={cn(
                "transition-colors",
                shuffle ? "text-primary" : "text-zinc-400 hover:text-white"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="text-zinc-300 hover:text-white transition-colors hover:scale-110"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {isPlaying ?
                <Pause className="w-5 h-5 fill-black text-black" /> :
                <Play className="w-5 h-5 fill-black text-black ml-0.5" />
              }
            </button>

            <button
              onClick={playNext}
              className="text-zinc-300 hover:text-white transition-colors hover:scale-110"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={cycleLoopMode}
              className={cn(
                "transition-colors",
                loopMode !== "off" ? "text-primary" : "text-zinc-400 hover:text-white"
              )}
            >
              {loopMode === "one" ?
                <Repeat1 className="w-4 h-4" /> :
                <Repeat className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 group/progress cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seek(percentage * duration);
            }}>
              <div className="h-1 bg-zinc-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg transition-opacity" />
                </div>
              </div>
            </div>
            <span className="w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume + Actions */}
        <div className="hidden md:flex items-center gap-4 w-1/4 justify-end">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
            <Mic2 className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 w-32 group/vol">
            <button onClick={toggleMute} className="text-zinc-400 group-hover/vol:text-white transition-colors">
              {isMuted || volume === 0 ?
                <VolumeX className="w-4 h-4" /> :
                <Volume2 className="w-4 h-4" />
              }
            </button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-full cursor-pointer"
            />
          </div>

          <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
