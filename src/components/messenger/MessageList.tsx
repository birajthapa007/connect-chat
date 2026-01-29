import { useRef, useEffect } from 'react';
import { Message } from '@/types/messenger';
import { useAuth } from '@/hooks/useAuth';
import { Profile } from '@/types/messenger';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, Download, FileIcon, Play, Pause } from 'lucide-react';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  participantProfile: Profile | null;
}

export function MessageList({ messages, participantProfile }: MessageListProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <div className="flex justify-center">
            <span className="px-3 py-1 text-xs text-muted-foreground bg-secondary/50 rounded-full">
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
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  showAvatar: boolean;
  participantProfile: Profile | null;
}

function MessageBubble({ message, isSent, showAvatar, participantProfile }: MessageBubbleProps) {
  const time = format(new Date(message.created_at), 'h:mm a');

  return (
    <div
      className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : ''} ${
        !showAvatar ? (isSent ? 'pr-10' : 'pl-10') : ''
      } animate-fade-in`}
    >
      {showAvatar && (
        <div className={`w-8 h-8 rounded-full shrink-0 ${!isSent ? 'bg-gradient-to-br from-primary to-accent' : 'bg-secondary'} flex items-center justify-center`}>
          {!isSent && (
            <span className="text-xs font-medium text-primary-foreground">
              {participantProfile?.display_name?.charAt(0).toUpperCase() ??
                participantProfile?.username?.charAt(0).toUpperCase() ??
                '?'}
            </span>
          )}
        </div>
      )}
      <div className={`max-w-[75%] ${isSent ? 'items-end' : 'items-start'} flex flex-col`}>
        <MessageContent message={message} isSent={isSent} />
        <div className={`flex items-center gap-1 mt-1 ${isSent ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-muted-foreground">{time}</span>
          {isSent && (
            <span className="text-primary">
              {message.is_read ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageContent({ message, isSent }: { message: Message; isSent: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
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

  switch (message.message_type) {
    case 'image':
      return (
        <div
          className={`rounded-2xl overflow-hidden ${
            isSent ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
        >
          <img
            src={message.file_url ?? ''}
            alt="Shared image"
            className="max-w-full max-h-64 object-cover"
            loading="lazy"
          />
        </div>
      );

    case 'audio':
      return (
        <div
          className={`message-bubble flex items-center gap-3 ${
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          }`}
        >
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-white/60 rounded-full" />
            </div>
          </div>
          <audio
            ref={audioRef}
            src={message.file_url ?? ''}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      );

    case 'file':
      return (
        <div
          className={`message-bubble flex items-center gap-3 ${
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
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
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      );

    default:
      return (
        <div
          className={`message-bubble ${
            isSent ? 'message-bubble-sent' : 'message-bubble-received'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      );
  }
}
