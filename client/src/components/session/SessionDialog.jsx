import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Radio, Plus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SessionDialog({ trigger }) {
  const navigate = useNavigate();
  const { createSession, joinSession } = useSession();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'create' or 'join'
  const [sessionName, setSessionName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    setLoading(true);
    try {
      const session = await createSession(sessionName.trim());
      toast.success('Session created!');
      setOpen(false);
      navigate(`/session/${session.sessionCode}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!sessionCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }

    setLoading(true);
    try {
      await joinSession(sessionCode.trim().toUpperCase());
      toast.success('Joined session!');
      setOpen(false);
      navigate(`/session/${sessionCode.trim().toUpperCase()}`);
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setMode(null);
    setSessionName('');
    setSessionCode('');
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Radio className="w-4 h-4" />
            Listening Party
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
            Listening Party
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Listen together with friends in real-time
          </DialogDescription>
        </DialogHeader>

        {!mode ? (
          <div className="grid gap-3 py-4">
            <button
              onClick={() => setMode('create')}
              className="h-auto py-5 px-4 flex flex-col items-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg text-white"
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-base">Create Session</span>
              <span className="text-xs opacity-90">Start a new listening party</span>
            </button>
            <button
              onClick={() => setMode('join')}
              className="h-auto py-5 px-4 flex flex-col items-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-200 rounded-xl transition-all"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="font-bold text-base text-gray-900">Join Session</span>
              <span className="text-xs text-gray-500">Enter a session code</span>
            </button>
          </div>
        ) : mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name" className="text-gray-700 font-semibold">Session Name</Label>
              <Input
                id="session-name"
                placeholder="e.g., Friday Night Vibes"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={loading}
                autoFocus
                className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(null)}
                disabled={loading}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !sessionName.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-code" className="text-gray-700 font-semibold">Session Code</Label>
              <Input
                id="session-code"
                placeholder="ABC123"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                disabled={loading}
                maxLength={6}
                autoFocus
                className="font-mono text-center text-lg tracking-widest bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 text-center">Enter the 6-character code</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(null)}
                disabled={loading}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading || !sessionCode.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                {loading ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
