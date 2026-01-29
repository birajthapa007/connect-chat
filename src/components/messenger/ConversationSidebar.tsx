import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquarePlus, LogOut, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useConversations } from '@/hooks/useConversations';
import { ConversationWithDetails } from '@/types/messenger';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { data: conversations, isLoading } = useConversations();

  const filteredConversations = conversations?.filter((conv) =>
    conv.participant.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-border/50 bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border/50 safe-area-top bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full transition-transform hover:scale-105">
                  <UserAvatar profile={profile} showStatus />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 bg-popover/95 backdrop-blur-lg border-primary/10">
                <div className="px-3 py-3 border-b border-border/50">
                  <p className="font-semibold text-foreground truncate text-base">
                    {profile?.display_name ?? profile?.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">@{profile?.username}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {profile?.display_name ?? profile?.username ?? 'Messages'}
              </p>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Online
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="shrink-0 text-primary hover:bg-primary/10 hover:scale-105 transition-all"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations?.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquarePlus className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">No conversations yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start chatting with someone!
              </p>
              <Button onClick={onNewConversation} size="sm" className="bg-primary hover:bg-primary/90">
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          ) : (
            filteredConversations?.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={selectedConversationId === conv.id}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { participant, lastMessage, unreadCount } = conversation;

  const getMessagePreview = () => {
    if (!lastMessage) return 'No messages yet';
    switch (lastMessage.message_type) {
      case 'image':
        return '📷 Photo';
      case 'audio':
        return '🎵 Voice message';
      case 'file':
        return `📎 ${lastMessage.file_name ?? 'File'}`;
      default:
        return lastMessage.content || 'Message';
    }
  };

  const timeAgo = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: false })
    : '';

  return (
    <button
      onClick={onClick}
      className={`conversation-item w-full text-left ${isActive ? 'conversation-item-active' : ''}`}
    >
      <UserAvatar profile={participant} size="lg" showStatus />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-foreground truncate">
            {participant.display_name ?? participant.username}
          </p>
          {lastMessage && (
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className="text-sm text-muted-foreground truncate">{getMessagePreview()}</p>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
