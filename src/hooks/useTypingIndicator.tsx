import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingStatus {
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Query to get typing status of other users
  const { data: typingUsers = [] } = useQuery({
    queryKey: ['typing', conversationId],
    queryFn: async () => {
      if (!conversationId || !user) return [];

      const { data, error } = await supabase
        .from('typing_status')
        .select('user_id, is_typing, updated_at')
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .eq('is_typing', true);

      if (error) throw error;
      
      // Filter out stale typing indicators (older than 5 seconds)
      const now = new Date();
      return (data as TypingStatus[]).filter(t => {
        const updatedAt = new Date(t.updated_at);
        return (now.getTime() - updatedAt.getTime()) < 5000;
      });
    },
    enabled: !!conversationId && !!user,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Real-time subscription for typing updates
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['typing', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  // Mutation to update typing status
  const updateTypingMutation = useMutation({
    mutationFn: async (isTyping: boolean) => {
      if (!conversationId || !user) return;

      const { error } = await supabase
        .from('typing_status')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'conversation_id,user_id',
        });

      if (error) throw error;
    },
  });

  // Function to call when user starts typing
  const startTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingMutation.mutate(true);

    // Auto-stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingMutation.mutate(false);
    }, 3000);
  }, [updateTypingMutation]);

  // Function to call when user stops typing
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    updateTypingMutation.mutate(false);
  }, [updateTypingMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when leaving conversation
      if (conversationId && user) {
        supabase
          .from('typing_status')
          .upsert({
            conversation_id: conversationId,
            user_id: user.id,
            is_typing: false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'conversation_id,user_id',
          });
      }
    };
  }, [conversationId, user]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isAnyoneTyping: typingUsers.length > 0,
  };
}
