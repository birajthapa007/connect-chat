-- Fix overly permissive policies
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;

-- More secure conversation creation - any authenticated user can create
CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Participants can only be added by users adding themselves or to conversations they're in
CREATE POLICY "Users can add themselves or others to conversations" ON public.conversation_participants
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  );