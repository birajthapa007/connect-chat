interface TypingIndicatorProps {
  isTyping: boolean;
}

export function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-1 px-3 py-2 bg-secondary rounded-2xl rounded-bl-md">
        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
        <div className="typing-dot" style={{ animationDelay: '150ms' }} />
        <div className="typing-dot" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-muted-foreground">typing...</span>
    </div>
  );
}
