import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    // Prevent multiple simultaneous connections
    if (this.connecting) {
      console.log('⏳ Connection already in progress...');
      return this.socket;
    }

    if (this.socket && this.connected) {
      console.log('✅ Already connected, reusing existing socket');
      return this.socket;
    }

    this.connecting = true;
    console.log('🔌 Initiating socket connection...');

    this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.connected = true;
      this.connecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
      this.connecting = false;

      // Don't reconnect if disconnect was intentional
      if (reason === 'io client disconnect') {
        console.log('🔌 Intentional disconnect, not reconnecting');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.connecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
        this.socket.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
      this.reconnectAttempts = 0;
    }
  }

  // Session events
  joinSession(sessionCode) {
    if (this.socket) {
      this.socket.emit('session:join', sessionCode);
    }
  }

  leaveSession() {
    if (this.socket) {
      this.socket.emit('session:leave');
    }
  }

  // Playback events
  play(sessionCode, songId, position = 0) {
    if (this.socket) {
      this.socket.emit('playback:play', { sessionCode, songId, position });
    }
  }

  pause(sessionCode, position) {
    if (this.socket) {
      this.socket.emit('playback:pause', { sessionCode, position });
    }
  }

  seek(sessionCode, position) {
    if (this.socket) {
      this.socket.emit('playback:seek', { sessionCode, position });
    }
  }

  next(sessionCode) {
    if (this.socket) {
      this.socket.emit('playback:next', { sessionCode });
    }
  }

  // Chat events
  sendMessage(sessionCode, message) {
    if (this.socket) {
      this.socket.emit('chat:message', { sessionCode, message });
    }
  }

  setTyping(sessionCode, isTyping) {
    if (this.socket) {
      this.socket.emit('chat:typing', { sessionCode, isTyping });
    }
  }

  // Queue events
  addToQueue(sessionCode, songId) {
    if (this.socket) {
      this.socket.emit('queue:add', { sessionCode, songId });
    }
  }

  // Reaction events
  sendReaction(sessionCode, emoji) {
    if (this.socket) {
      this.socket.emit('reaction:add', { sessionCode, emoji });
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
