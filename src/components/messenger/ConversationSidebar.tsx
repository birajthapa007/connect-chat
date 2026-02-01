import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquarePlus, LogOut, Settings, User, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { useConversations } from '@/hooks/useConversations';
import { usePresence } from '@/hooks/usePresence';
import { ConversationWithDetails } from '@/types/messenger';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
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

  const totalUnread = conversations?.reduce((sum, conv) => sum + conv.unreadCount, 0) ?? 0;

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-border/30 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95">
      {/* Premium Header */}
      <div className="p-4 border-b border-border/30 safe-area-top">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5 pointer-events-none" />
        
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative focus:outline-none rounded-full transition-all duration-300 hover:scale-105 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity" />
                  <div className="relative">
                    <UserAvatar profile={profile} showStatus size="lg" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-strong">
                <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
                  <p className="font-bold text-foreground truncate text-lg">
                    {profile?.display_name ?? profile?.username}
                  </p>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">@{profile?.username}</p>
                </div>
                <div className="p-1">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg py-2.5">
                    <User className="h-4 w-4 mr-3 text-primary" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg py-2.5">
                    <Settings className="h-4 w-4 mr-3 text-primary" />
                    Settings
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive rounded-lg py-2.5">
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground truncate text-lg">
                  {profile?.display_name ?? profile?.username ?? 'Messages'}
                </p>
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full animate-pulse">
                    {totalUnread}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active now
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="shrink-0 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <MessageSquarePlus className="h-5 w-5 relative z-10 text-primary group-hover:text-white transition-colors" />
          </Button>
        </div>

        {/* Premium Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse rounded-xl">
                  <div className="h-14 w-14 rounded-full bg-muted/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded-lg w-28" />
                    <div className="h-3 bg-muted/30 rounded-lg w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations?.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl shadow-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <p className="font-bold text-foreground text-lg mb-2">No conversations yet</p>
              <p className="text-sm text-muted-foreground mb-5">
                Start a conversation and connect with others!
              </p>
              <Button 
                onClick={onNewConversation} 
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Start Chatting
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
  const { isUserOnline } = usePresence();
  const isOnline = isUserOnline(participant.user_id);

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
      className={cn(
        "w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
        isActive 
          ? "bg-gradient-to-r from-primary/15 to-accent/10 shadow-md shadow-primary/5" 
          : "hover:bg-secondary/60"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
      )}
      
      <div className="relative">
        <UserAvatar profile={participant} size="lg" />
        {/* Online indicator */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-sidebar shadow-lg shadow-emerald-500/50" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "font-semibold truncate transition-colors",
            isActive ? "text-primary" : "text-foreground",
            unreadCount > 0 && "text-foreground"
          )}>
            {participant.display_name ?? participant.username}
          </p>
          {lastMessage && (
            <span className={cn(
              "text-xs shrink-0",
              unreadCount > 0 ? "text-primary font-medium" : "text-muted-foreground"
            )}>
              {timeAgo}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <p className={cn(
            "text-sm truncate",
            unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {getMessagePreview()}
          </p>
          {unreadCount > 0 && (
            <span className="min-w-[22px] h-[22px] flex items-center justify-center text-xs font-bold bg-gradient-to-r from-primary to-accent text-white rounded-full shrink-0 shadow-lg shadow-primary/30 animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
