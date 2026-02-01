import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageType } from '@/types/messenger';
import { useAuth } from './useAuth';

export function useMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Real-time subscription for new messages AND updates (for read receipts)
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: Message[] | undefined) => [...(old ?? []), payload.new as Message]
          );
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Update message in cache when it's marked as read
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: Message[] | undefined) => 
              old?.map(msg => msg.id === payload.new.id ? payload.new as Message : msg) ?? []
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      fileUrl,
      fileName,
      fileSize,
    }: {
      conversationId: string;
      content: string;
      messageType?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Don't add message to cache here - realtime subscription handles it
      // This prevents duplicate messages
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkAsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true,
          read_at: now,
          status: 'read'
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useEditMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      content,
      conversationId 
    }: { 
      messageId: string; 
      content: string;
      conversationId: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // First, fetch the message to check if it's within 10 minutes
      const { data: message, error: fetchError } = await supabase
        .from('messages')
        .select('created_at, sender_id')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;
      
      // Verify ownership
      if (message.sender_id !== user.id) {
        throw new Error('You can only edit your own messages');
      }

      // Check if within 10 minutes
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (diffMinutes > 10) {
        throw new Error('Messages can only be edited within 10 minutes of sending');
      }

      const { data, error } = await supabase
        .from('messages')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, conversationId };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Helper to check if a message is editable (within 10 minutes and is own message)
export function canEditMessage(message: Message, userId: string | undefined): boolean {
  if (!userId || message.sender_id !== userId) return false;
  if (message.message_type !== 'text') return false;
  
  const createdAt = new Date(message.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  return diffMinutes <= 10;
}

// Check if message was edited
export function isMessageEdited(message: Message): boolean {
  const created = new Date(message.created_at).getTime();
  const updated = new Date(message.updated_at).getTime();
  // Consider edited if updated more than 1 second after creation
  return (updated - created) > 1000;
}
