-- Create a function to check if user is in a conversation (for conversations table)
CREATE OR REPLACE FUNCTION public.is_user_in_conversation(
  _conversation_id UUID,
  _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Drop and recreate conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

-- Allow users to view conversations they are part of
CREATE POLICY "Users can view their conversations" 
ON public.conversations
FOR SELECT TO authenticated
USING (public.is_user_in_conversation(id, auth.uid()));

-- Allow creating conversations
CREATE POLICY "Authenticated users can create conversations" 
ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also update messages policies to use security definer functions
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages
FOR SELECT TO authenticated
USING (public.is_user_in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can send messages to their conversations" 
ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  public.is_user_in_conversation(conversation_id, auth.uid())
);