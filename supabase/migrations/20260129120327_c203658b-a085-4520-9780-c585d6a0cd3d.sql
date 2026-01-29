-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add message delivery status columns
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read'));

-- Create typing_status table for real-time typing indicators
CREATE TABLE IF NOT EXISTS public.typing_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on typing_status
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- Typing status policies
CREATE POLICY "Users can view typing status in their conversations"
ON public.typing_status FOR SELECT
USING (public.is_user_in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can insert their own typing status"
ON public.typing_status FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_in_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can update typing status"
ON public.typing_status FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their typing status"
ON public.typing_status FOR DELETE
USING (auth.uid() = user_id);

-- Create user_presence table for online/offline status
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Presence policies
CREATE POLICY "Anyone can view presence"
ON public.user_presence FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update presence"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for new tables only
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;

-- Function to auto-update presence timestamp
CREATE OR REPLACE FUNCTION public.update_user_presence()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for presence updates
DROP TRIGGER IF EXISTS update_presence_timestamp ON public.user_presence;
CREATE TRIGGER update_presence_timestamp
BEFORE UPDATE ON public.user_presence
FOR EACH ROW
EXECUTE FUNCTION public.update_user_presence();