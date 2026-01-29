import { X, Send, Loader2, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useSendMessage } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewProps {
  file: File;
  conversationId: string;
  onClose: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FilePreview({ file, conversationId, onClose }: FilePreviewProps) {
  const { uploadFile, uploading, progress } = useFileUpload();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const handleSend = async () => {
    try {
      const result = await uploadFile(file);
      if (!result) throw new Error('Upload failed');

      await sendMessage.mutateAsync({
        conversationId,
        content: '',
        messageType: 'file',
        fileUrl: result.url,
        fileName: result.name,
        fileSize: result.size,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send file',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-3 bg-card/80 backdrop-blur-sm border-t border-border animate-fade-in">
      <div className="flex items-center gap-3">
        {/* File icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileIcon className="h-6 w-6 text-primary" />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-foreground">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          {uploading && (
            <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={uploading || sendMessage.isPending}
          className="shrink-0 rounded-full bg-primary"
        >
          {uploading || sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
