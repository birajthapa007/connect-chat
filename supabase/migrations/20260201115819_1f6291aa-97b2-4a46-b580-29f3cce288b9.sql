-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a new policy that allows:
-- 1. Senders to update their own messages (for editing)
-- 2. Participants to mark messages as read (update is_read, read_at, status)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  is_user_in_conversation(conversation_id, auth.uid())
)
WITH CHECK (
  is_user_in_conversation(conversation_id, auth.uid())
);