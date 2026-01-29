import { useState, useRef, useCallback } from 'react';
import { Send, Image, Paperclip, Loader2, Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder } from './AudioRecorder';
import { ImagePreview } from './ImagePreview';
import { FilePreview } from './FilePreview';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      stopTyping();
      await sendMessage.mutateAsync({
        conversationId,
        content: message.trim(),
        messageType: 'text',
      });
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

    // Trigger typing indicator
    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
      } else {
        setAttachmentFile(file);
      }
    }
    // Reset input
    e.target.value = '';
  };

  // Show audio recorder
  if (showAudioRecorder) {
    return (
      <AudioRecorder
        conversationId={conversationId}
        onClose={() => setShowAudioRecorder(false)}
      />
    );
  }

  // Show image preview
  if (imageFile) {
    return (
      <ImagePreview
        file={imageFile}
        conversationId={conversationId}
        onClose={() => setImageFile(null)}
      />
    );
  }

  // Show file preview
  if (attachmentFile) {
    return (
      <FilePreview
        file={attachmentFile}
        conversationId={conversationId}
        onClose={() => setAttachmentFile(null)}
      />
    );
  }

  return (
    <div className="border-t border-border p-2 md:p-3 bg-card/50 backdrop-blur-sm">
      <div className="flex items-end gap-2">
        {/* Action buttons */}
        <div className="flex gap-0.5 shrink-0">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            <Image className="h-5 w-5" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors hidden sm:flex"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            onClick={() => setShowAudioRecorder(true)}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="w-full min-h-[40px] max-h-[120px] px-4 py-2.5 bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm md:text-base transition-all"
            rows={1}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
          size="icon"
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0 transition-all hover:scale-105 active:scale-95"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
