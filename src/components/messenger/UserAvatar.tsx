import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/types/messenger';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  profile: Profile | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function UserAvatar({ profile, size = 'md', showStatus = false, isOnline }: UserAvatarProps) {
  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? profile?.username?.slice(0, 2).toUpperCase() ?? '??';

  // Use passed isOnline prop if provided, otherwise fall back to profile's is_online
  const online = isOnline !== undefined ? isOnline : profile?.is_online;

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], "ring-2 ring-background shadow-sm")}>
        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? 'User'} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
            online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
          )}
        />
      )}
    </div>
  );
}
