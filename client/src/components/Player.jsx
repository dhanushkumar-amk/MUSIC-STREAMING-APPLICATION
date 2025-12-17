import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle, Heart, ChevronDown, List, X, GripVertical, Sliders, Settings as SettingsIcon, Music2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { libraryService } from '../services/music';
import toast from 'react-hot-toast';
import Equalizer from './player/Equalizer';
import LyricsPanel from './player/LyricsPanel';
import AdvancedPlaybackSettings from './player/AdvancedPlaybackSettings';

export default function Player() {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    loopMode,
    queue,
    currentIndex,
    settings,
    updateSettings,
    togglePlayPause,
    next,
    previous,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleLoop,
    playSong,
    setQueue,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Advanced features
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            next();
          } else {
            seekTo(Math.min(currentTime + 5, duration));
          }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            previous();
          } else {
            seekTo(Math.max(currentTime - 5, 0));
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleLike();
          }
          break;
        case 'q':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowQueue(!showQueue);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [track, isPlaying, currentTime, duration, isLiked, showQueue]);

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
    if (loopMode === 'one') return <Repeat1 className="w-4 h-4" />;
    return <Repeat className="w-4 h-4" />;
  };

  const handleQueueItemClick = async (song, index) => {
    await playSong(song, queue, index);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQueue = [...queue];
    const draggedItem = newQueue[draggedIndex];
    newQueue.splice(draggedIndex, 1);
    newQueue.splice(index, 0, draggedItem);

    setQueue(newQueue);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!track) return null;

  // Mini Player View - Spotify-like floating panel
  if (isMiniPlayer) {
    return (
      <>
        {/* Minimal Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => setIsMiniPlayer(false)}>
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate text-sm">{track.name}</p>
                  <p className="text-xs text-gray-600 truncate">{track.desc || track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayPause}
                  className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mini Player Panel */}
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 relative">
            <button
              onClick={() => setIsMiniPlayer(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Close Mini Player"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-white/80 text-xs font-medium mb-1">NOW PLAYING</p>
            <h3 className="text-white font-bold text-lg truncate pr-8">{track.name}</h3>
            <p className="text-white/90 text-sm truncate">{track.desc || track.artist}</p>
          </div>

          {/* Album Art */}
          <div className="p-6">
            <div className="relative group">
              <img
                src={track.image}
                alt={track.name}
                className="w-full aspect-square rounded-xl object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl"></div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-all ${
                  isLiked ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full transition-all ${
                    shuffle ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={shuffle ? 'Shuffle off' : 'Shuffle on'}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={previous}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  title="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={next}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                  title="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleLoop}
                  className={`p-2 rounded-full transition-all ${
                    loopMode !== 'off' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={loopMode === 'off' ? 'Repeat off' : loopMode === 'all' ? 'Repeat all' : 'Repeat one'}
                >
                  {getLoopIcon()}
                </button>
              </div>

              <button
                onClick={() => setShowQueue(!showQueue)}
                className={`p-2 rounded-full transition-all ${
                  showQueue ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Queue"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleVolumeToggle}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="flex-1 relative group">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
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
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Full Player View
  return (
    <>
      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed right-0 bottom-0 top-0 w-full md:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
          {/* Queue Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Queue</h2>
            <button
              onClick={() => setShowQueue(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Now Playing */}
          <div className="p-4 bg-emerald-50 border-b border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 mb-2">NOW PLAYING</p>
            <div className="flex items-center gap-3">
              <img
                src={track.image}
                alt={track.name}
                className="w-12 h-12 rounded-lg object-cover shadow-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">{track.name}</p>
                <p className="text-xs text-gray-600 truncate">{track.desc || track.artist}</p>
              </div>
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto">
            {queue.length > 0 ? (
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-500 px-2 py-2">NEXT IN QUEUE</p>
                {queue.map((song, index) => {
                  if (index === currentIndex) return null;
                  return (
                    <div
                      key={`${song._id}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`w-full p-2 rounded-lg transition-all flex items-center gap-2 group cursor-move ${
                        draggedIndex === index ? 'opacity-50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      <button
                        onClick={() => handleQueueItemClick(song, index)}
                        className="flex-1 flex items-center gap-3 min-w-0"
                      >
                        <img
                          src={song.image}
                          alt={song.name}
                          className="w-10 h-10 rounded-md object-cover shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-medium text-gray-900 truncate text-sm group-hover:text-emerald-600">
                            {song.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{song.desc || song.artist}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(song.duration || 0)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-sm">No songs in queue</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="max-w-screen-2xl mx-auto">
            {/* Mobile Layout (< md) */}
            <div className="md:hidden">
              {/* Progress Bar - Top */}
              <div className="mb-3">
                <div className="relative group">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-150"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Track Info + Controls */}
              <div className="flex items-center gap-3">
                {/* Album Art */}
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-12 h-12 rounded-lg object-cover shadow-md flex-shrink-0"
                />

                {/* Track Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate text-sm">{track.name}</p>
                  <p className="text-xs text-gray-600 truncate">{track.desc || track.artist}</p>
                </div>

                {/* Mobile Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full ${
                      isLiked ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={previous}
                    className="p-2 rounded-full text-gray-700"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={next}
                    className="p-2 rounded-full text-gray-700"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setShowQueue(!showQueue)}
                    className={`p-2 rounded-full ${
                      showQueue ? 'text-emerald-600' : 'text-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout (>= md) */}
            <div className="hidden md:flex items-center justify-between gap-6">

              {/* Left: Track Info */}
              <div className="flex items-center gap-4 w-[280px] min-w-[280px]">
                <div className="relative group">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-16 h-16 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-all duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate text-base mb-0.5">{track.name}</p>
                  <p className="text-sm text-gray-600 truncate">{track.desc || track.artist}</p>
                </div>
              </div>

              {/* Center: Player Controls */}
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <button
                    onClick={handleLike}
                    className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      isLiked
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                    }`}
                    title={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                  >
                    <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      shuffle
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={shuffle ? 'Shuffle off' : 'Shuffle on'}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={previous}
                    className="p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                    title="Previous"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={next}
                    className="p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                    title="Next"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    onClick={toggleLoop}
                    className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      loopMode !== 'off'
                        ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={loopMode === 'off' ? 'Repeat off' : loopMode === 'all' ? 'Repeat all' : 'Repeat one'}
                  >
                    {getLoopIcon()}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 font-medium w-12 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1 group relative">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-150"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      ></div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={(e) => seekTo(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute -top-1 left-0 right-0 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-full bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium w-12">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Right: Volume & Controls */}
              <div className="flex items-center gap-3 w-[200px] justify-end">
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    showQueue ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Queue"
                >
                  <List className="w-5 h-5" />
                </button>

                <button
                  onClick={handleVolumeToggle}
                  className="p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 group relative">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-150"
                      style={{ width: `${volume * 100}%` }}
                    ></div>
                  </div>
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
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    showLyrics ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Lyrics"
                >
                  <Music2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowEqualizer(!showEqualizer)}
                  className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    showEqualizer ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Equalizer"
                >
                  <Sliders className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className={`p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    showAdvancedSettings ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Advanced Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsMiniPlayer(true)}
                  className="p-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
                  title="Mini Player"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Feature Modals */}
      <Equalizer
        isOpen={showEqualizer}
        onClose={() => setShowEqualizer(false)}
        onSettingsChange={(newSettings) => {
          updateSettings(newSettings);
        }}
      />

      <LyricsPanel
        songId={track?._id}
        songName={track?.name}
        artistName={track?.artist}
        duration={duration}
        currentTime={currentTime}
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
      />

      <AdvancedPlaybackSettings
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        onSettingsChange={(newSettings) => {
          updateSettings(newSettings);
        }}
      />
    </>
  );
}
