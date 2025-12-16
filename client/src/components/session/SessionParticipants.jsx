import { useSession } from '@/context/SessionContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Circle } from 'lucide-react';

const SessionParticipants = () => {
  const { participants, session, isHost } = useSession();

  const getInitials = (email) => {
    return email?.charAt(0).toUpperCase() || '?';
  };

  const isUserHost = (userId) => {
    if (!session) return false;
    return session.hostId._id === userId || session.hostId === userId;
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Participants ({participants.filter(p => p.isOnline).length})
        </h3>
        <Badge variant="outline" className="text-xs">
          {session?.privacy}
        </Badge>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => (
          <div
            key={participant.userId._id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={participant.userId.avatar} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {getInitials(participant.userId.email)}
                </AvatarFallback>
              </Avatar>
              {participant.isOnline && (
                <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {participant.userId.email?.split('@')[0] || 'User'}
                </p>
                {isUserHost(participant.userId._id) && (
                  <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Host" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                {participant.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>

            {/* Permissions badges */}
            <div className="flex gap-1">
              {participant.permissions?.canControl && (
                <Badge variant="secondary" className="text-xs">
                  Control
                </Badge>
              )}
            </div>
          </div>
        ))}

        {participants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionParticipants;
