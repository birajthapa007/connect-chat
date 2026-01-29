import { ArrowLeft, Phone, Video, MoreVertical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { useMessages, useMarkAsRead } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { usePresence } from '@/hooks/usePresence';
import { Profile } from '@/types/messenger';
import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatViewProps {
  conversationId: string | null;
  participantProfile: Profile | null;
  onBack?: () => void;
}

export function ChatView({ conversationId, participantProfile, onBack }: ChatViewProps) {
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const markAsRead = useMarkAsRead();
  const { isAnyoneTyping } = useTypingIndicator(conversationId);
  const { isUserOnline, getLastSeen } = usePresence();

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, messages.length]);

  if (!conversationId) {
    return <EmptyChatState />;
  }

  const isOnline = participantProfile ? isUserOnline(participantProfile.user_id) : false;
  const lastSeen = participantProfile ? getLastSeen(participantProfile.user_id) : null;

  const formatLastSeen = () => {
    if (isOnline) return null;
    if (!lastSeen) return 'Offline';
    return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 md:p-4 border-b border-border bg-card/80 backdrop-blur-xl safe-area-top shadow-sm">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="shrink-0 hover:bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <UserAvatar profile={participantProfile} showStatus isOnline={isOnline} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {participantProfile?.display_name ?? participantProfile?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                Online
              </span>
            ) : (
              formatLastSeen()
            )}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 hidden sm:flex"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 hidden sm:flex"
          >
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem className="sm:hidden">
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} participantProfile={participantProfile} />
          
          {/* Typing indicator */}
          <TypingIndicator isTyping={isAnyoneTyping} />
        </>
      )}

      {/* Input */}
      <div className="safe-area-bottom">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-8">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-xl">
        <MessageCircle className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Your messages</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Select a conversation or start a new one to begin chatting.
      </p>
    </div>
  );
}
