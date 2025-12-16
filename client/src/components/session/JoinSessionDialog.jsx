import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Hash } from 'lucide-react';

const JoinSessionDialog = ({ open, onOpenChange }) => {
  const [sessionCode, setSessionCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinSession } = useSession();
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!sessionCode.trim()) {
      return;
    }

    setIsJoining(true);
    try {
      await joinSession(sessionCode.toUpperCase());
      onOpenChange(false);
      navigate(`/session/${sessionCode.toUpperCase()}`);
      setSessionCode('');
    } catch (error) {
      console.error('Join session error:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCodeChange = (e) => {
    // Only allow alphanumeric characters, max 6 chars
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setSessionCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Join Listening Party</DialogTitle>
          <DialogDescription>
            Enter the session code to join your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium">
              Session Code
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="code"
                placeholder="ABC123"
                value={sessionCode}
                onChange={handleCodeChange}
                className="pl-10 text-lg font-mono tracking-wider text-center uppercase"
                maxLength={6}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && sessionCode.length === 6) {
                    handleJoin();
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Enter the 6-character code shared by the host
            </p>
          </div>

          {/* Visual feedback */}
          {sessionCode.length > 0 && (
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                    i < sessionCode.length
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-gray-50 text-gray-300'
                  }`}
                >
                  {sessionCode[i] || ''}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSessionCode('');
            }}
            disabled={isJoining}
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            disabled={sessionCode.length !== 6 || isJoining}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isJoining ? 'Joining...' : 'Join Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinSessionDialog;
