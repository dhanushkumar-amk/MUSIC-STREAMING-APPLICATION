import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/context/SessionContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SessionChat = () => {
  const { messages, sendMessage, setTyping, typingUsers, participants } = useSession();
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
      setTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (e.target.value.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const getInitials = (email) => {
    return email?.charAt(0).toUpperCase() || '?';
  };

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border shadow-sm">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
        </div>
        <p className="text-xs text-gray-500">
          {participants.filter(p => p.isOnline).length} online
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg._id || index} className="flex gap-3">
                {/* Avatar */}
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={msg.userId?.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {getInitials(msg.userId?.email)}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {msg.userId?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>

                  {msg.type === 'system' ? (
                    <p className="text-sm text-gray-500 italic">
                      {msg.message}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700 break-words">
                      {msg.message}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs">Someone is typing...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  );
};

export default SessionChat;
