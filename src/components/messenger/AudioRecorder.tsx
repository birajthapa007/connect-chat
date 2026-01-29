import { Mic, Square, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useSendMessage } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  conversationId: string;
  onClose: () => void;
}

export function AudioRecorder({ conversationId, onClose }: AudioRecorderProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    formatDuration,
  } = useAudioRecorder();

  const { uploadFile, uploading } = useFileUpload();
  const sendMessage = useSendMessage();
  const { toast } = useToast();

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to record voice messages.',
        variant: 'destructive',
      });
      onClose();
    }
  };

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    try {
      // Convert to File
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm',
      });

      // Upload to storage
      const result = await uploadFile(file);
      if (!result) throw new Error('Upload failed');

      // Send message
      await sendMessage.mutateAsync({
        conversationId,
        content: '',
        messageType: 'audio',
        fileUrl: result.url,
        fileName: result.name,
        fileSize: result.size,
      });

      resetRecording();
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to send voice message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onClose();
  };

  // Start recording on mount
  if (!isRecording && !audioBlob) {
    handleStartRecording();
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-card/80 backdrop-blur-sm border-t border-border animate-fade-in">
      {/* Cancel button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="shrink-0 text-destructive hover:text-destructive"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Recording indicator / Waveform */}
      <div className="flex-1 flex items-center gap-3">
        {isRecording && (
          <>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="flex-1 flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-primary rounded-full transition-all duration-100",
                    isRecording && "animate-pulse"
                  )}
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {audioUrl && !isRecording && (
          <audio
            src={audioUrl}
            controls
            className="flex-1 h-10"
          />
        )}

        <span className="text-sm font-mono text-muted-foreground min-w-[50px]">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Action button */}
      {isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={stopRecording}
          className="shrink-0 text-primary"
        >
          <Square className="h-5 w-5 fill-current" />
        </Button>
      ) : audioBlob ? (
        <Button
          size="icon"
          onClick={handleSendAudio}
          disabled={uploading || sendMessage.isPending}
          className="shrink-0 rounded-full bg-primary"
        >
          {uploading || sendMessage.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartRecording}
          className="shrink-0"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
