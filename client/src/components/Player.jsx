import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { libraryService } from '../services/music';
import toast from 'react-hot-toast';

export default function Player() {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    loopMode,
    togglePlayPause,
    next,
    previous,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleLoop,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);

  // Check if song is liked
  useEffect(() => {
    if (track) {
      checkIfLiked();
    }
  }, [track]);

  const checkIfLiked = async () => {
    try {
      const response = await libraryService.getLikedSongs();
      if (response.success) {
        const liked = response.songs.some(song => song._id === track._id);
        setIsLiked(liked);
      }
    } catch (error) {
      console.error('Failed to check if liked:', error);
    }
  };

  const handleLike = async () => {
    if (!track) return;

    try {
      if (isLiked) {
        await libraryService.unlikeSong(track._id);
        setIsLiked(false);
        toast.success('Removed from Liked Songs');
      } else {
        await libraryService.likeSong(track._id);
        setIsLiked(true);
        toast.success('Added to Liked Songs');
      }
    } catch (error) {
      console.error('Failed to like/unlike song:', error);
      toast.error('Failed to update');
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      changeVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      changeVolume(0);
      setIsMuted(true);
    }
  };

  const getLoopIcon = () => {
    if (loopMode === 'one') return <Repeat1 className="w-5 h-5" />;
    return <Repeat className="w-5 h-5" />;
  };

  if (!track) return null;

  return (
    <div className="h-[90px] bg-white border-t border-gray-200 px-4 flex items-center justify-between">
      {/* Left: Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <img
          src={track.image}
          alt={track.name}
          className="w-14 h-14 rounded-lg object-cover shadow-md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{track.name}</p>
          <p className="text-sm text-gray-500 truncate">{track.desc || track.artist}</p>
        </div>
        <button
          onClick={handleLike}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
            isLiked ? 'text-emerald-500' : 'text-gray-400'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col items-center gap-2 w-[40%] max-w-[722px]">
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              shuffle ? 'text-emerald-500' : 'text-gray-600'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={previous}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              loopMode !== 'off' ? 'text-emerald-500' : 'text-gray-600'
            }`}
          >
            {getLoopIcon()}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                (currentTime / duration) * 100
              }%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`,
            }}
          />
          <span className="text-xs text-gray-500 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume Control */}
      <div className="flex items-center gap-2 w-[30%] justify-end">
        <button
          onClick={handleVolumeToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            changeVolume(Number(e.target.value));
            setIsMuted(false);
          }}
          className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${
              volume * 100
            }%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    </div>
  );
}
