import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useSendMessage } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ImagePreviewProps {
  file: File;
  conversationId: string;
  onClose: () => void;
}

export function ImagePreview({ file, conversationId, onClose }: ImagePreviewProps) {
  const [previewUrl] = useState(() => URL.createObjectURL(file));
  const [caption, setCaption] = useState('');
  const { uploadFile, uploading } = useFileUpload();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const handleSend = async () => {
    try {
      const result = await uploadFile(file);
      if (!result) throw new Error('Upload failed');

      await sendMessage.mutateAsync({
        conversationId,
        content: caption,
        messageType: 'image',
        fileUrl: result.url,
        fileName: result.name,
        fileSize: result.size,
      });

      URL.revokeObjectURL(previewUrl);
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send image',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <span className="font-medium">Send Image</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={previewUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Footer with caption */}
      <div className="p-4 border-t border-border safe-area-bottom">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="flex-1 px-4 py-2.5 bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={uploading || sendMessage.isPending}
            className="rounded-full bg-primary h-11 w-11"
          >
            {uploading || sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
