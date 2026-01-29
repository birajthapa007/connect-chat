import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Profile } from '@/types/messenger';

interface UserAvatarProps {
  profile: Profile | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function UserAvatar({ profile, size = 'md', showStatus = false }: UserAvatarProps) {
  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? profile?.username?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? 'User'} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${
            profile?.is_online ? 'online-indicator' : 'offline-indicator'
          }`}
        />
      )}
    </div>
  );
}
