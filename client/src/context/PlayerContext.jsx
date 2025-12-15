import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { queueService, recentlyPlayedService, playStatsService } from '../services/music';
import { settingsService } from '../services/settings';
import toast from 'react-hot-toast';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const eqNodesRef = useRef([]);
  const analyserRef = useRef(null);
  const compressorRef = useRef(null);

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
  const [loopMode, setLoopMode] = useState('off');

  // Advanced Settings State
  const [settings, setSettings] = useState({
    audioQuality: 'high',
    crossfadeDuration: 0,
    gaplessPlayback: true,
    normalizeVolume: false,
    playbackSpeed: 1.0,
    equalizerEnabled: false,
    equalizerBands: {
      band32: 0, band64: 0, band125: 0, band250: 0, band500: 0,
      band1k: 0, band2k: 0, band4k: 0, band8k: 0, band16k: 0
    }
  });

  // Recently Played Tracking
  const [playStartTime, setPlayStartTime] = useState(null);
  const [currentEntryId, setCurrentEntryId] = useState(null);

  // EQ Frequencies (10-band)
  const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  // Initialize Web Audio API
  const initAudioContext = () => {
    // DISABLED: Using native HTML5 audio for better quality
    return;

    /* COMMENTED OUT - Web Audio API disabled
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      // Create compressor for volume normalization
      compressorRef.current = audioContextRef.current.createDynamicsCompressor();
      compressorRef.current.threshold.value = -24;
      compressorRef.current.knee.value = 30;
      compressorRef.current.ratio.value = 12;
      compressorRef.current.attack.value = 0.003;
      compressorRef.current.release.value = 0.25;

      // Create 10-band equalizer
      eqNodesRef.current = EQ_FREQUENCIES.map((freq, index) => {
        const filter = audioContextRef.current.createBiquadFilter();

        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }

        filter.frequency.value = freq;
        filter.gain.value = 0;

        return filter;
      });

      // Create gain node
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;

      console.log('✅ Web Audio Context initialized');
    } catch (error) {
      console.error('Failed to initialize Audio Context:', error);
    }
    */
  };

  // Connect audio nodes
  const connectAudioNodes = () => {
    // DISABLED: Web Audio API processing for better audio quality
    // Using native HTML5 audio element instead
    return;

    /* COMMENTED OUT - Web Audio API causes quality issues
    if (!audioContextRef.current || !audioRef.current) return;

    try {
      // Create media element source if not exists
      if (!sourceNodeRef.current) {
        try {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
          console.log('✅ Media source created');
        } catch (err) {
          console.error('Source already exists or error:', err);
          return;
        }
      }

      let currentNode = sourceNodeRef.current;

      // Disconnect all nodes first
      try {
        eqNodesRef.current.forEach(node => {
          try { node.disconnect(); } catch (e) {}
        });
        if (compressorRef.current) {
          try { compressorRef.current.disconnect(); } catch (e) {}
        }
        if (analyserRef.current) {
          try { analyserRef.current.disconnect(); } catch (e) {}
        }
        if (gainNodeRef.current) {
          try { gainNodeRef.current.disconnect(); } catch (e) {}
        }
      } catch (e) {
        // Nodes weren't connected yet
      }

      // Connect through equalizer if enabled
      if (settings.equalizerEnabled && eqNodesRef.current.length > 0) {
        eqNodesRef.current.forEach((filter) => {
          currentNode.connect(filter);
          currentNode = filter;
        });
      }

      // Connect through compressor if normalize is enabled
      if (settings.normalizeVolume && compressorRef.current) {
        currentNode.connect(compressorRef.current);
        currentNode = compressorRef.current;
      }

      // Connect to analyser
      if (analyserRef.current) {
        currentNode.connect(analyserRef.current);
      }

      // Connect to gain node and then to destination (SPEAKERS!)
      if (gainNodeRef.current) {
        currentNode.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
      } else {
        currentNode.connect(audioContextRef.current.destination);
      }

      console.log('✅ Audio nodes connected to speakers');
    } catch (error) {
      console.error('Failed to connect audio nodes:', error);
      // Fallback: connect directly to destination
      try {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.connect(audioContextRef.current.destination);
          console.log('✅ Fallback: Direct connection to speakers');
        }
      } catch (e) {
        console.error('Fallback failed:', e);
      }
    }
    */
  };

  // Load user settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response.success) {
          const newSettings = {
            audioQuality: response.settings.audioQuality,
            crossfadeDuration: response.settings.crossfadeDuration,
            gaplessPlayback: response.settings.gaplessPlayback,
            normalizeVolume: response.settings.normalizeVolume,
            playbackSpeed: response.settings.playbackSpeed,
            equalizerEnabled: response.settings.equalizerEnabled,
            equalizerBands: response.settings.equalizerBands
          };
          setSettings(newSettings);
          console.log('✅ Settings loaded:', newSettings);
        }
      } catch (error) {
        console.log('Using default settings');
      }
    };
    loadSettings();
  }, []);

  // Apply settings changes
  useEffect(() => {
    if (!audioRef.current) return;

    // Apply playback speed
    audioRef.current.playbackRate = settings.playbackSpeed;

    // Apply EQ settings
    if (eqNodesRef.current.length > 0) {
      const bandKeys = ['band32', 'band64', 'band125', 'band250', 'band500', 'band1k', 'band2k', 'band4k', 'band8k', 'band16k'];
      bandKeys.forEach((key, index) => {
        if (settings.equalizerBands[key] !== undefined && eqNodesRef.current[index]) {
          eqNodesRef.current[index].gain.value = settings.equalizerBands[key];
        }
      });
    }

    // Reconnect nodes if EQ or normalize changed
    if (audioContextRef.current && sourceNodeRef.current) {
      connectAudioNodes();
    }
  }, [settings]);

  // Initialize audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [volume, settings.playbackSpeed]);

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

  // Load queue state from backend on mount
  useEffect(() => {
    const loadQueueState = async () => {
      try {
        const response = await queueService.getState();
        if (response.success && response.queue) {
          setShuffle(response.queue.shuffle || false);
          setLoopMode(response.queue.loopMode || 'off');
        }
      } catch (error) {
        console.log('No existing queue state');
      }
    };
    loadQueueState();
  }, []);

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

      const newQueue = playlist.length > 0 ? playlist : [song];
      setTrack(song);
      setQueue(newQueue);
      setCurrentIndex(index);

      // Initialize backend queue
      try {
        const songIds = newQueue.map(s => s._id);
        await queueService.start(songIds, 'manual', null);
      } catch (queueError) {
        console.error('Failed to initialize queue:', queueError);
      }

      // Track new song start
      await trackPlayStart(song._id);

      if (audioRef.current) {
        // Set the source
        audioRef.current.src = song.file;

        // Play the audio directly with native HTML5 audio
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          console.log('✅ Audio playing with native HTML5');
        } catch (playError) {
          console.error('Play error:', playError);
          toast.error('Failed to play audio');
        }
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
  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
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
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        await trackPlayStart(track._id);
      }
    } else if (loopMode === 'all' || currentIndex < queue.length - 1) {
      await next();
    } else {
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

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      console.log('Settings updated:', updated);
      return updated;
    });
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
    setQueue,
    currentIndex,
    shuffle,
    loopMode,
    settings,
    updateSettings,
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
      <audio ref={audioRef} crossOrigin="anonymous" />
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
