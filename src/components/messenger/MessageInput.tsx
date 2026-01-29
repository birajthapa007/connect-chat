import { useState, useRef } from 'react';
import { Send, Image, Paperclip, Loader2, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSendMessage } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim() && !attachment) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: message.trim(),
        messageType: 'text',
      });
      setMessage('');
      setAttachment(null);
      // Reset textarea height
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <div className="border-t border-border p-2 md:p-3 bg-card/50">
      {/* Attachment preview */}
      {attachment && (
        <div className="mb-2 px-2 py-1.5 bg-muted rounded-lg flex items-center gap-2 text-sm">
          <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate text-foreground">{attachment.name}</span>
          <button 
            onClick={() => setAttachment(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Action buttons - compact on mobile */}
        <div className="flex gap-0.5 shrink-0">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
            className="h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:flex"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full min-h-[40px] max-h-[120px] px-4 py-2.5 bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm md:text-base"
            rows={1}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !attachment) || sendMessage.isPending}
          size="icon"
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shrink-0"
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
