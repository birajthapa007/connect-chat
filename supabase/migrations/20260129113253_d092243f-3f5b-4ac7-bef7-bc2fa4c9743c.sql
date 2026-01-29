-- Create a security definer function to check if user is in a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(
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

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves or others to conversations" ON public.conversation_participants;

-- Create fixed SELECT policy using security definer function
CREATE POLICY "Users can view participants in their conversations" 
ON public.conversation_participants
FOR SELECT TO authenticated
USING (public.is_conversation_participant(conversation_id, auth.uid()));

-- Create fixed INSERT policy - users can only add themselves initially or add others if already in the conversation
CREATE POLICY "Users can add participants to conversations"
ON public.conversation_participants
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id OR 
  public.is_conversation_participant(conversation_id, auth.uid())
);