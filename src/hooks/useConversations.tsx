import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ConversationWithDetails, Profile, Message } from '@/types/messenger';

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get all conversations the user is part of
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const conversationIds = participants.map(p => p.conversation_id);
      if (conversationIds.length === 0) return [];

      // Get conversation details with other participants
      const conversations: ConversationWithDetails[] = [];

      for (const convId of conversationIds) {
        // Get the other participant
        const { data: otherParticipants, error: otherError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', convId)
          .neq('user_id', user.id);

        if (otherError) throw otherError;
        if (!otherParticipants.length) continue;

        const otherUserId = otherParticipants[0].user_id;

        // Get profile of other participant
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', otherUserId)
          .single();

        if (profileError) continue;

        // Get last message
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (messagesError) throw messagesError;

        // Get unread count
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        if (countError) throw countError;

        conversations.push({
          id: convId,
          participant: profile as Profile,
          lastMessage: messages.length > 0 ? (messages[0] as Message) : null,
          unreadCount: count ?? 0,
        });
      }

      // Sort by last message time
      return conversations.sort((a, b) => {
        const aTime = a.lastMessage?.created_at ?? '1970-01-01';
        const bTime = b.lastMessage?.created_at ?? '1970-01-01';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });
}

export function useStartConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: myConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (myConversations) {
        for (const conv of myConversations) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', otherUserId)
            .single();

          if (otherParticipant) {
            return conv.conversation_id;
          }
        }
      }

      // Create new conversation - get ID without .select() which triggers RLS
      const conversationId = crypto.randomUUID();
      
      const { error: convError } = await supabase
        .from('conversations')
        .insert({ id: conversationId });

      if (convError) throw convError;

      // Add the current user first (so they can see the conversation)
      const { error: selfParticipantError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: conversationId, user_id: user.id });

      if (selfParticipantError) throw selfParticipantError;

      // Then add the other user
      const { error: otherParticipantError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: conversationId, user_id: otherUserId });

      if (otherParticipantError) throw otherParticipantError;

      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
