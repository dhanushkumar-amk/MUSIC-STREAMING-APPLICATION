import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { queueService, recentlyPlayedService, playStatsService } from '../services/music';
import toast from 'react-hot-toast';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);

  // Player State
  const [track, setTrack] = useState(null);
  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState('off'); // 'off', 'one', 'all'

  // Recently Played Tracking
  const [playStartTime, setPlayStartTime] = useState(null);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Time update listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [track, loopMode]);

  // Track play start for analytics
  const trackPlayStart = async (songId) => {
    try {
      const response = await recentlyPlayedService.trackStart(songId, 'song', songId);
      if (response.success) {
        setCurrentEntryId(response.entryId);
        setPlayStartTime(Date.now());
      }
    } catch (error) {
      console.error('Failed to track play start:', error);
    }
  };

  // Track play end for analytics
  const trackPlayEnd = async (skipped = false) => {
    if (!currentEntryId || !playStartTime) return;

    try {
      const playDuration = Math.floor((Date.now() - playStartTime) / 1000);
      await recentlyPlayedService.trackEnd(currentEntryId, playDuration, skipped);

      // Increment play count if played for more than 30 seconds
      if (playDuration > 30 && track) {
        await playStatsService.incrementPlay(track._id);
      }
    } catch (error) {
      console.error('Failed to track play end:', error);
    } finally {
      setCurrentEntryId(null);
      setPlayStartTime(null);
    }
  };

  // Play a specific song
  const playSong = async (song, playlist = [], index = 0) => {
    try {
      // Track previous song end
      if (track) {
        await trackPlayEnd(true);
      }

      setTrack(song);
      setQueue(playlist.length > 0 ? playlist : [song]);
      setCurrentIndex(index);

      // Track new song start
      await trackPlayStart(song._id);

      if (audioRef.current) {
        audioRef.current.src = song.file;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      toast.error('Failed to play song');
    }
  };

  // Play song by ID
  const playWithId = async (id) => {
    const song = songsData.find(item => item._id === id);
    if (song) {
      await playSong(song, songsData, songsData.findIndex(item => item._id === id));
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Next song
  const next = async () => {
    if (queue.length === 0) return;

    await trackPlayEnd(true);

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }

    const nextSong = queue[nextIndex];
    await playSong(nextSong, queue, nextIndex);
  };

  // Previous song
  const previous = async () => {
    if (queue.length === 0) return;

    await trackPlayEnd(true);

    let prevIndex;
    if (currentTime > 3) {
      // Restart current song if played for more than 3 seconds
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevSong = queue[prevIndex];
    await playSong(prevSong, queue, prevIndex);
  };

  // Handle song end
  const handleSongEnd = async () => {
    await trackPlayEnd(false);

    if (loopMode === 'one') {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        await trackPlayStart(track._id);
      }
    } else if (loopMode === 'all' || currentIndex < queue.length - 1) {
      // Play next song
      await next();
    } else {
      // End of queue
      setIsPlaying(false);
    }
  };

  // Seek to position
  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Change volume
  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle shuffle
  const toggleShuffle = async () => {
    try {
      await queueService.toggleShuffle();
      setShuffle(!shuffle);
      toast.success(shuffle ? 'Shuffle off' : 'Shuffle on');
    } catch (error) {
      console.error('Failed to toggle shuffle:', error);
    }
  };

  // Toggle loop mode
  const toggleLoop = async () => {
    const modes = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];

    try {
      await queueService.updateLoop(nextMode);
      setLoopMode(nextMode);

      const messages = {
        off: 'Repeat off',
        all: 'Repeat all',
        one: 'Repeat one',
      };
      toast.success(messages[nextMode]);
    } catch (error) {
      console.error('Failed to toggle loop:', error);
    }
  };

  // Add to queue
  const addToQueue = async (songId) => {
    try {
      await queueService.add(songId);
      const song = songsData.find(s => s._id === songId);
      if (song) {
        setQueue([...queue, song]);
        toast.success('Added to queue');
      }
    } catch (error) {
      console.error('Failed to add to queue:', error);
      toast.error('Failed to add to queue');
    }
  };

  // Play next in queue
  const playNextInQueue = async (songId) => {
    try {
      await queueService.playNext(songId);
      const song = songsData.find(s => s._id === songId);
      if (song) {
        const newQueue = [...queue];
        newQueue.splice(currentIndex + 1, 0, song);
        setQueue(newQueue);
        toast.success('Will play next');
      }
    } catch (error) {
      console.error('Failed to play next:', error);
      toast.error('Failed to add to queue');
    }
  };

  // Get songs data
  const getSongsData = (data) => {
    setSongsData(data);
  };

  // Get albums data
  const getAlbumsData = (data) => {
    setAlbumsData(data);
  };

  const value = {
    audioRef,
    track,
    setTrack,
    songsData,
    setSongsData,
    albumsData,
    setAlbumsData,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    shuffle,
    loopMode,
    playSong,
    playWithId,
    togglePlayPause,
    next,
    previous,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleLoop,
    addToQueue,
    playNextInQueue,
    getSongsData,
    getAlbumsData,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export { PlayerContext };
