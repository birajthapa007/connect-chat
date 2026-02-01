import { useRef, useEffect, useState } from 'react';
import { Message } from '@/types/messenger';
import { useAuth } from '@/hooks/useAuth';
import { useEditMessage, canEditMessage, isMessageEdited } from '@/hooks/useMessages';
import { Profile } from '@/types/messenger';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, Download, FileIcon, Play, Pause, Pencil, X } from 'lucide-react';
import { ImageViewer } from './ImageViewer';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageListProps {
  messages: Message[];
  participantProfile: Profile | null;
}

export function MessageList({ messages, participantProfile }: MessageListProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toDateString();
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <div className="flex justify-center">
              <span className="px-3 py-1 text-xs text-muted-foreground bg-secondary/50 rounded-full backdrop-blur-sm">
                {formatDateHeader(group.date)}
              </span>
            </div>
            {group.messages.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSent={message.sender_id === user?.id}
                showAvatar={
                  messageIndex === 0 ||
                  group.messages[messageIndex - 1]?.sender_id !== message.sender_id
                }
                participantProfile={participantProfile}
                onImageClick={setViewingImage}
                isEditing={editingMessageId === message.id}
                onStartEdit={() => setEditingMessageId(message.id)}
                onCancelEdit={() => setEditingMessageId(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Image viewer modal */}
      {viewingImage && (
        <ImageViewer
          src={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      )}
    </>
  );
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  showAvatar: boolean;
  participantProfile: Profile | null;
  onImageClick?: (url: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

function MessageBubble({ 
  message, 
  isSent, 
  showAvatar, 
  participantProfile, 
  onImageClick,
  isEditing,
  onStartEdit,
  onCancelEdit
}: MessageBubbleProps) {
  const { user } = useAuth();
  const time = format(new Date(message.created_at), 'h:mm a');
  const isEditable = canEditMessage(message, user?.id);
  const wasEdited = isMessageEdited(message);

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-in group",
        isSent ? 'flex-row-reverse' : '',
        !showAvatar && (isSent ? 'pr-10' : 'pl-10')
      )}
    >
      {showAvatar && (
        <div className={cn(
          "w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm",
          !isSent ? 'bg-gradient-to-br from-primary to-accent' : 'bg-secondary'
        )}>
          {!isSent && (
            <span className="text-xs font-medium text-primary-foreground">
              {participantProfile?.display_name?.charAt(0).toUpperCase() ??
                participantProfile?.username?.charAt(0).toUpperCase() ??
                '?'}
            </span>
          )}
        </div>
      )}
      <div className={cn("max-w-[75%] flex flex-col", isSent ? 'items-end' : 'items-start')}>
        {isEditing ? (
          <EditMessageForm 
            message={message} 
            onCancel={onCancelEdit}
          />
        ) : (
          <>
            <div className="relative">
              <MessageContent 
                message={message} 
                isSent={isSent} 
                onImageClick={onImageClick}
              />
              {/* Edit button - show on hover for editable messages */}
              {isEditable && isSent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="left">
                    <DropdownMenuItem onClick={onStartEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className={cn("flex items-center gap-1.5 mt-1", isSent && 'flex-row-reverse')}>
              <span className="text-xs text-muted-foreground">{time}</span>
              {wasEdited && (
                <span className="text-xs text-muted-foreground/70 italic">edited</span>
              )}
              {isSent && <MessageStatus message={message} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface EditMessageFormProps {
  message: Message;
  onCancel: () => void;
}

function EditMessageForm({ message, onCancel }: EditMessageFormProps) {
  const [content, setContent] = useState(message.content || '');
  const editMessage = useEditMessage();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleSave = async () => {
    if (!content.trim() || content === message.content) {
      onCancel();
      return;
    }

    try {
      await editMessage.mutateAsync({
        messageId: message.id,
        content: content.trim(),
        conversationId: message.conversation_id,
      });
      toast({
        title: 'Message edited',
        description: 'Your message has been updated.',
      });
      onCancel();
    } catch (error: any) {
      toast({
        title: 'Failed to edit message',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="w-full min-w-[200px] max-w-[300px]">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] bg-secondary/50 border-primary/30 text-sm resize-none"
        placeholder="Edit your message..."
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="h-7 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={editMessage.isPending || !content.trim()}
          className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
        >
          {editMessage.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter to save, Esc to cancel
      </p>
    </div>
  );
}

function MessageStatus({ message }: { message: Message }) {
  // Check status based on read_at, delivered_at, or is_read
  const isRead = message.is_read || message.read_at;
  const isDelivered = message.delivered_at;

  if (isRead) {
    return <CheckCheck className="h-3.5 w-3.5 text-primary" />;
  }
  if (isDelivered) {
    return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  return <Check className="h-3.5 w-3.5 text-muted-foreground" />;
}

function MessageContent({ 
  message, 
  isSent,
  onImageClick 
}: { 
  message: Message; 
  isSent: boolean;
  onImageClick?: (url: string) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  switch (message.message_type) {
    case 'image':
      return (
        <div
          className={cn(
            "rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-lg",
            isSent ? 'rounded-br-md' : 'rounded-bl-md'
          )}
          onClick={() => message.file_url && onImageClick?.(message.file_url)}
        >
          <img
            src={message.file_url ?? ''}
            alt="Shared image"
            className="max-w-full max-h-64 object-cover"
            loading="lazy"
          />
          {message.content && (
            <div className={cn(
              "px-3 py-2 text-sm",
              isSent ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            )}>
              {message.content}
            </div>
          )}
        </div>
      );

    case 'audio':
      return (
        <div
          className={cn(
            "message-bubble flex items-center gap-3 min-w-[200px]",
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          )}
        >
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 rounded-full transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <div className="text-xs mt-1 opacity-70">
              {formatTime(audioRef.current?.currentTime ?? 0)} / {formatTime(audioDuration)}
            </div>
          </div>
          <audio
            ref={audioRef}
            src={message.file_url ?? ''}
            onEnded={() => {
              setIsPlaying(false);
              setAudioProgress(0);
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </div>
      );

    case 'file':
      return (
        <div
          className={cn(
            "message-bubble flex items-center gap-3",
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          )}
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <FileIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{message.file_name}</p>
            <p className="text-xs opacity-70">
              {message.file_size
                ? `${(message.file_size / 1024).toFixed(1)} KB`
                : 'File'}
            </p>
          </div>
          {message.file_url && (
            <a
              href={message.file_url}
              download={message.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      );

    default:
      // Don't render empty text messages
      if (!message.content?.trim()) return null;
      
      return (
        <div
          className={cn(
            "message-bubble shadow-sm",
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      );
  }
}
