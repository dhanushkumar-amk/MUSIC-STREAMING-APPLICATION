import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SessionChat from '@/components/session/SessionChat';
import SessionParticipants from '@/components/session/SessionParticipants';
import SessionQueue from '@/components/session/SessionQueue';
import AddSongDialog from '@/components/session/AddSongDialog';
import {
  Copy,
  Share2,
  LogOut,
  Users,
  Music2,
  Play,
  Pause,
  Plus,
  Radio,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react';
import toast from 'react-hot-toast';

const SessionPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { session, joinSession, leaveSession, isHost, participants, currentSong, isPlaying, playSong, pause, nextSong } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await joinSession(code);
      } catch (error) {
        console.error('Failed to join session:', error);
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (session) {
        leaveSession();
      }
    };
  }, [code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session?.sessionCode || '');
    toast.success('Session code copied!');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/session/${session?.sessionCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my listening party: ${session?.name}`,
          text: `Listen to music together! Session code: ${session?.sessionCode}`,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          handleCopyCode();
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied!');
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    navigate('/home');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">Joining session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">Session not found</p>
          <Button onClick={() => navigate('/home')} className="bg-emerald-600 hover:bg-emerald-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Session Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
                  {isHost() && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      Host
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{participants.filter(p => p.isOnline).length} listening</span>
                  <span>•</span>
                  <button
                    onClick={handleCopyCode}
                    className="font-mono font-bold hover:text-gray-900 transition-colors"
                  >
                    {session.sessionCode}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2 text-xs"
              >
                <Share2 className="w-3 h-3" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeave}
                className="gap-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-3 h-3" />
                Leave
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Now Playing (Spotify-style) */}
          <div className="lg:col-span-2">
            {currentSong ? (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                {/* Now Playing Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Music2 className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-gray-900">Now Playing</h2>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs ml-auto">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5" />
                    Live
                  </Badge>
                </div>

                {/* Spotify-style Player */}
                <div className="flex gap-6">
                  {/* Album Art - SMALLER! */}
                  <div className="relative group flex-shrink-0">
                    <img
                      src={currentSong.image}
                      alt={currentSong.name}
                      className="w-48 h-48 rounded-lg object-cover shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => isPlaying ? pause() : playSong(currentSong)}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6 text-gray-900 fill-gray-900" />
                        ) : (
                          <Play className="w-6 h-6 text-gray-900 fill-gray-900 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Song Info & Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Song Info */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentSong.name}</h3>
                      <p className="text-gray-500">{currentSong.desc || currentSong.album}</p>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      {/* Playback Controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toast.error('Previous song not supported in session mode')}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => isPlaying ? pause() : playSong(currentSong)}
                          className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={nextSong}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors ml-auto">
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">0:00</span>
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: '30%' }} />
                        </div>
                        <span className="text-xs text-gray-500">{currentSong.duration || '3:45'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choose Another Song Button */}
                <Button
                  onClick={() => setShowAddSong(true)}
                  variant="outline"
                  className="w-full mt-6 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Choose Another Song
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music2 className="w-12 h-12 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg mb-4">No song playing</p>
                <Button
                  onClick={() => setShowAddSong(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Choose a Song
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Chat & Participants */}
          <div className="space-y-6">
            <SessionQueue />
            <SessionChat />
            <SessionParticipants />
          </div>
        </div>
      </div>

      {/* Add Song Dialog */}
      <AddSongDialog open={showAddSong} onOpenChange={setShowAddSong} />
    </div>
  );
};

export default SessionPage;
