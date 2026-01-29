import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export function usePresence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to get all online users
  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['presence'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('user_id, is_online, last_seen');

      if (error) throw error;
      return data as UserPresence[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mutation to update presence
  const updatePresenceMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      if (!user) return;

      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    },
  });

  // Set online when component mounts
  useEffect(() => {
    if (!user) return;

    // Set online immediately
    updatePresenceMutation.mutate(true);

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      updatePresenceMutation.mutate(true);
    }, 30000);

    // Handle visibility change
    const handleVisibilityChange = () => {
      updatePresenceMutation.mutate(!document.hidden);
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status
      const payload = JSON.stringify({
        user_id: user.id,
        is_online: false,
        last_seen: new Date().toISOString(),
      });
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?on_conflict=user_id`,
        payload
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Set offline when unmounting
      updatePresenceMutation.mutate(false);
    };
  }, [user]);

  // Real-time subscription for presence updates
  useEffect(() => {
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['presence'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isUserOnline = useCallback((userId: string) => {
    const presence = onlineUsers.find(p => p.user_id === userId);
    if (!presence) return false;
    
    // Consider user online if last seen within 2 minutes
    const lastSeen = new Date(presence.last_seen);
    const now = new Date();
    return presence.is_online && (now.getTime() - lastSeen.getTime()) < 120000;
  }, [onlineUsers]);

  const getLastSeen = useCallback((userId: string) => {
    const presence = onlineUsers.find(p => p.user_id === userId);
    return presence?.last_seen ?? null;
  }, [onlineUsers]);

  return {
    onlineUsers,
    isUserOnline,
    getLastSeen,
  };
}
