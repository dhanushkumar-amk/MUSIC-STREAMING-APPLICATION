import { createContext, useContext, useEffect, useState, useRef } from 'react';
import sessionService from '../services/sessionService';
import socketService from '../services/socketService';
import { PlayerContext } from './PlayerContext';
import toast from 'react-hot-toast';

const SessionContext = createContext();

// Global flag to prevent multiple socket connections
let isSocketInitialized = false;

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);

  // Get PlayerContext to actually play audio
  const playerContext = useContext(PlayerContext);

  const typingTimeoutRef = useRef(null);

  // Initialize socket connection - ONLY ONCE
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // Don't connect if already initialized globally
    if (isSocketInitialized) {
      console.log('✅ Socket already initialized globally, skipping...');
      setIsConnected(socketService.isConnected());
      return;
    }

    // Don't connect if no token
    if (!token) {
      console.warn('⚠️ No access token found for socket connection');
      return;
    }

    // Prevent multiple connections
    if (socketService.isConnected()) {
      console.log('✅ Socket already connected, skipping...');
      setIsConnected(true);
      isSocketInitialized = true;
      return;
    }

    console.log('🔌 Connecting to Socket.io...');
    try {
      socketService.connect(token);
      setIsConnected(true);
      isSocketInitialized = true;
      console.log('✅ Socket.io connected');
    } catch (error) {
      console.error('❌ Socket connection error:', error);
      toast.error('Failed to connect to real-time server');
      setIsConnected(false);
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket connection');
      if (session) {
        console.log('🔌 Leaving session on unmount');
        socketService.leaveSession();
      }
      // Only disconnect if this is the last instance
      // Don't set isSocketInitialized to false to prevent reconnection
    };
  }, []); // Empty dependency array - only run once on mount

  // Socket event listeners
  useEffect(() => {
    if (!socketService.getSocket()) return;

    // Session state
    socketService.on('session:state', (sessionData) => {
      setSession(sessionData);
      setParticipants(sessionData.participants);
      setCurrentSong(sessionData.currentSong);
      setIsPlaying(sessionData.isPlaying);
      setQueue(sessionData.queue);
    });

    // Session updated
    socketService.on('session:updated', (sessionData) => {
      setSession(sessionData);
    });

    // User joined
    socketService.on('user:joined', ({ userId, session: updatedSession }) => {
      setParticipants(updatedSession.participants);
      toast.success('Someone joined the session');
    });

    // User left
    socketService.on('user:left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.userId._id !== userId));
      toast('Someone left the session');
    });

    // Playback sync
    socketService.on('playback:sync', ({ currentSong, position, isPlaying, lastUpdate }) => {
      console.log('📡 Received playback:sync event:', { currentSong, isPlaying });

      setCurrentSong(currentSong);
      setIsPlaying(isPlaying);

      // Actually play the audio for other users!
      if (currentSong && isPlaying && playerContext && playerContext.playWithId) {
        console.log('🎵 Playing synced song for other user:', currentSong._id);
        playerContext.playWithId(currentSong._id);
      } else if (!isPlaying && playerContext && playerContext.pause) {
        console.log('⏸️ Pausing for other user');
        playerContext.pause();
      }

      // Emit event for player to sync position
      window.dispatchEvent(new CustomEvent('session:playback-sync', {
        detail: { currentSong, position, isPlaying, lastUpdate }
      }));
    });

    // Queue updated
    socketService.on('queue:updated', ({ queue }) => {
      setQueue(queue);
    });

    // Chat message
    socketService.on('chat:message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Typing indicator
    socketService.on('chat:typing', ({ userId, isTyping }) => {
      if (isTyping) {
        setTypingUsers(prev => [...new Set([...prev, userId])]);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }
    });

    // Reaction
    socketService.on('reaction:added', ({ userId, emoji }) => {
      // Show floating emoji animation
      window.dispatchEvent(new CustomEvent('session:reaction', {
        detail: { userId, emoji }
      }));
    });

    // Error
    socketService.on('error', ({ message }) => {
      toast.error(message);
    });

    return () => {
      socketService.off('session:state');
      socketService.off('session:updated');
      socketService.off('user:joined');
      socketService.off('user:left');
      socketService.off('playback:sync');
      socketService.off('queue:updated');
      socketService.off('chat:message');
      socketService.off('chat:typing');
      socketService.off('reaction:added');
      socketService.off('error');
    };
  }, []);

  // Create session
  const createSession = async (name, privacy = 'private', settings = {}) => {
    try {
      const response = await sessionService.createSession(name, privacy, settings);
      if (response.success) {
        setSession(response.session);
        socketService.joinSession(response.session.sessionCode);
        toast.success('Session created!');
        return response.session;
      }
    } catch (error) {
      console.error('Create session error:', error);
      toast.error('Failed to create session');
      throw error;
    }
  };

  // Join session
  const joinSession = async (sessionCode) => {
    try {
      console.log('📥 Joining session:', sessionCode);
      const response = await sessionService.joinSession(sessionCode);
      console.log('✅ Session join response:', response);

      if (response.success) {
        setSession(response.session);
        setParticipants(response.session.participants || []);
        setCurrentSong(response.session.currentSong);
        setQueue(response.session.queue || []);

        console.log('🔌 Emitting socket join event for:', sessionCode);
        socketService.joinSession(sessionCode);

        // Load chat history
        console.log('💬 Loading chat history...');
        const chatResponse = await sessionService.getChatMessages(sessionCode);
        if (chatResponse.success) {
          setMessages(chatResponse.messages);
          console.log('✅ Chat history loaded:', chatResponse.messages.length, 'messages');
        }

        toast.success('Joined session!');
        return response.session;
      }
    } catch (error) {
      console.error('❌ Join session error:', error);
      toast.error(error.response?.data?.message || 'Failed to join session');
      throw error;
    }
  };

  // Leave session
  const leaveSession = async () => {
    try {
      if (session) {
        await sessionService.leaveSession(session.sessionCode);
        socketService.leaveSession();
        setSession(null);
        setMessages([]);
        setParticipants([]);
        setCurrentSong(null);
        setQueue([]);
        toast.success('Left session');
      }
    } catch (error) {
      console.error('Leave session error:', error);
      toast.error('Failed to leave session');
    }
  };

  // End session (host only)
  const endSession = async () => {
    try {
      if (session) {
        await sessionService.endSession(session.sessionCode);
        socketService.leaveSession();
        setSession(null);
        setMessages([]);
        setParticipants([]);
        setCurrentSong(null);
        setQueue([]);
        toast.success('Session ended');
      }
    } catch (error) {
      console.error('End session error:', error);
      toast.error('Failed to end session');
    }
  };

  // Send message
  const sendMessage = async (message) => {
    try {
      if (session) {
        socketService.sendMessage(session.sessionCode, message);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  // Set typing
  const setTyping = (isTyping) => {
    if (session) {
      socketService.setTyping(session.sessionCode, isTyping);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socketService.setTyping(session.sessionCode, false);
        }, 3000);
      }
    }
  };

  // Play song
  const playSong = (song, position = 0) => {
    console.log('🎵 SessionContext playSong called:', song);

    if (!session) {
      console.error('❌ No session found');
      toast.error('Not in a session');
      return;
    }

    if (!song || !song._id) {
      console.error('❌ Invalid song:', song);
      toast.error('Invalid song');
      return;
    }

    try {
      // Emit socket event to sync with other users
      console.log('📡 Emitting playback:play event');
      socketService.play(session.sessionCode, song._id, position);

      // Actually play the audio locally using PlayerContext
      if (playerContext && playerContext.playWithId) {
        console.log('🎵 Playing audio locally with ID:', song._id);
        playerContext.playWithId(song._id);
      } else {
        console.warn('⚠️ PlayerContext not available');
      }

      // Update local state
      setCurrentSong(song);
      setIsPlaying(true);

      console.log('✅ Song playing successfully');
    } catch (error) {
      console.error('❌ Error in playSong:', error);
      toast.error('Failed to play song');
    }
  };

  // Pause
  const pause = (position) => {
    console.log('⏸️ SessionContext pause called');

    if (!session) {
      console.error('❌ No session found');
      return;
    }

    try {
      // Emit socket event to sync with other users
      console.log('📡 Emitting playback:pause event');
      socketService.pause(session.sessionCode, position);

      // Actually pause the audio locally using PlayerContext
      if (playerContext && playerContext.pause) {
        console.log('⏸️ Pausing audio locally');
        playerContext.pause();
      } else {
        console.warn('⚠️ PlayerContext.pause not available');
      }

      // Update local state
      setIsPlaying(false);

      console.log('✅ Paused successfully');
    } catch (error) {
      console.error('❌ Error in pause:', error);
      toast.error('Failed to pause');
    }
  };

  // Seek
  const seek = (position) => {
    if (session) {
      socketService.seek(session.sessionCode, position);
    }
  };

  // Next song
  const nextSong = () => {
    if (session) {
      socketService.next(session.sessionCode);
    }
  };

  // Add to queue
  const addToQueue = async (songId) => {
    try {
      if (session) {
        socketService.addToQueue(session.sessionCode, songId);
        toast.success('Added to queue');
      }
    } catch (error) {
      console.error('Add to queue error:', error);
      toast.error('Failed to add to queue');
    }
  };

  // Send reaction
  const sendReaction = (emoji) => {
    if (session) {
      socketService.sendReaction(session.sessionCode, emoji);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentSong) {
      playSong(currentSong, 0);
    }
  };

  // Check if user is host
  const isHost = () => {
    if (!session) return false;
    const userId = localStorage.getItem('userId');
    return session.hostId._id === userId || session.hostId === userId;
  };

  const value = {
    session,
    messages,
    participants,
    typingUsers,
    isConnected,
    currentSong,
    isPlaying,
    queue,
    isHost,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    sendMessage,
    setTyping,
    playSong,
    pause,
    togglePlayPause,
    seek,
    nextSong,
    addToQueue,
    sendReaction
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

export { SessionContext };
