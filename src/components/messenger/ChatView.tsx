import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from './UserAvatar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages, useMarkAsRead } from '@/hooks/useMessages';
import { Profile } from '@/types/messenger';
import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatViewProps {
  conversationId: string | null;
  participantProfile: Profile | null;
  onBack?: () => void;
}

export function ChatView({ conversationId, participantProfile, onBack }: ChatViewProps) {
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const markAsRead = useMarkAsRead();

  useEffect(() => {
    if (conversationId) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, messages.length]);

  if (!conversationId) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border glass-subtle">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <UserAvatar profile={participantProfile} showStatus />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {participantProfile?.display_name ?? participantProfile?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {participantProfile?.is_online ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      ) : (
        <MessageList messages={messages} participantProfile={participantProfile} />
      )}

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <MessageCircle className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">Your messages</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Select a conversation from the sidebar or start a new one to begin chatting.
      </p>
    </div>
  );
}
