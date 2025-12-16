import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSession } from '@/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Globe } from 'lucide-react';

const CreateSessionDialog = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [isCreating, setIsCreating] = useState(false);
  const { createSession } = useSession();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const session = await createSession(name, privacy);
      onOpenChange(false);
      navigate(`/session/${session.sessionCode}`);
      setName('');
      setPrivacy('private');
    } catch (error) {
      console.error('Create session error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Listening Party</DialogTitle>
          <DialogDescription>
            Start a session and invite friends to listen together
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Session Name
            </Label>
            <Input
              id="name"
              placeholder="Friday Night Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              maxLength={50}
            />
          </div>

          {/* Privacy Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Privacy</Label>
            <RadioGroup value={privacy} onValueChange={setPrivacy}>
              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-sm text-gray-500">Only people with the link can join</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="friends-only" id="friends-only" />
                <Label htmlFor="friends-only" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Friends Only</p>
                      <p className="text-sm text-gray-500">Only your friends can join</p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-sm text-gray-500">Anyone can discover and join</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isCreating ? 'Creating...' : 'Create Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionDialog;
