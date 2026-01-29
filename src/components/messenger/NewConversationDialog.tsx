import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserAvatar } from './UserAvatar';
import { useProfiles } from '@/hooks/useProfiles';
import { useStartConversation } from '@/hooks/useConversations';
import { Profile } from '@/types/messenger';
import { Button } from '@/components/ui/button';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: profiles, isLoading } = useProfiles();
  const startConversation = useStartConversation();

  const filteredProfiles = profiles?.filter(
    (profile) =>
      profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = async (profile: Profile) => {
    try {
      const conversationId = await startConversation.mutateAsync(profile.user_id);
      onConversationCreated(conversationId);
      onOpenChange(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong">
        <DialogHeader>
          <DialogTitle className="text-xl">New Conversation</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[300px] -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfiles?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProfiles?.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelectUser(profile)}
                  disabled={startConversation.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left disabled:opacity-50"
                >
                  <UserAvatar profile={profile} showStatus />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {profile.display_name ?? profile.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">@{profile.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
