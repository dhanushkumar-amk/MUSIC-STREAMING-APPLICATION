import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import socketService from '@/services/socketService';

const SessionDebugPage = () => {
  const {
    session,
    isConnected,
    currentSong,
    isPlaying,
    messages,
    participants,
    queue
  } = useSession();

  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('🔍 Debug page mounted');
    addLog(`Socket connected: ${isConnected}`);
    addLog(`Session: ${session ? session.sessionCode : 'None'}`);
  }, []);

  useEffect(() => {
    if (session) {
      addLog(`✅ Session loaded: ${session.sessionCode}`, 'success');
    }
  }, [session]);

  useEffect(() => {
    addLog(`🔌 Socket connection status: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`, isConnected ? 'success' : 'error');
  }, [isConnected]);

  useEffect(() => {
    if (currentSong) {
      addLog(`🎵 Current song: ${currentSong.name}`, 'info');
    }
  }, [currentSong]);

  useEffect(() => {
    addLog(`▶️ Playing status: ${isPlaying ? 'PLAYING' : 'PAUSED'}`, isPlaying ? 'success' : 'warning');
  }, [isPlaying]);

  const testSocketConnection = () => {
    addLog('🧪 Testing socket connection...');
    const socket = socketService.getSocket();
    if (socket) {
      addLog(`✅ Socket exists, ID: ${socket.id}`, 'success');
      addLog(`✅ Socket connected: ${socket.connected}`, socket.connected ? 'success' : 'error');
    } else {
      addLog('❌ Socket not initialized', 'error');
    }
  };

  const testEmitEvent = () => {
    if (!session) {
      addLog('❌ No session active', 'error');
      return;
    }
    addLog('🧪 Testing emit event...');
    socketService.sendMessage(session.sessionCode, 'Test message from debug page');
    addLog('✅ Emit sent', 'success');
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('🗑️ Logs cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Connection Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Socket Connected:</span>
                <span className={isConnected ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {isConnected ? '✅ YES' : '❌ NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Session Active:</span>
                <span className={session ? 'text-green-600 font-bold' : 'text-gray-400'}>
                  {session ? `✅ ${session.sessionCode}` : '❌ NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Participants:</span>
                <span className="font-bold">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Queue Length:</span>
                <span className="font-bold">{queue.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="font-bold">{messages.length}</span>
              </div>
            </div>
          </Card>

          {/* Current State */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Playing:</span>
                <span className={isPlaying ? 'text-green-600 font-bold' : 'text-gray-400'}>
                  {isPlaying ? '▶️ YES' : '⏸️ NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Song:</span>
                <span className="font-bold truncate max-w-[200px]">
                  {currentSong ? currentSong.name : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="font-bold">
                  {session?.hostId?.email?.split('@')[0] || 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Test Buttons */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={testSocketConnection} variant="outline">
              Test Socket Connection
            </Button>
            <Button onClick={testEmitEvent} variant="outline" disabled={!session}>
              Test Emit Event
            </Button>
            <Button onClick={clearLogs} variant="outline">
              Clear Logs
            </Button>
          </div>
        </Card>

        {/* Logs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-green-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-gray-300'
              }`}>
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">No logs yet...</div>
            )}
          </div>
        </Card>

        {/* Raw Data */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
};

export default SessionDebugPage;
