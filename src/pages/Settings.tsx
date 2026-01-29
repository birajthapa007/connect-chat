import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Sun, Lock, HelpCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Enable push notifications',
          action: (
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          ),
        },
        {
          icon: darkMode ? Moon : Sun,
          label: 'Dark Mode',
          description: 'Toggle dark/light theme',
          action: (
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          ),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: Lock,
          label: 'Privacy',
          description: 'Manage your privacy settings',
          action: <ChevronRight className="h-5 w-5 text-muted-foreground" />,
          onClick: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help Center',
          description: 'Get help with the app',
          action: <ChevronRight className="h-5 w-5 text-muted-foreground" />,
          onClick: () => {},
        },
        {
          icon: Info,
          label: 'About',
          description: 'App version and info',
          action: <span className="text-sm text-muted-foreground">v1.0.0</span>,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {group.title}
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {group.items.map((item, index) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  disabled={!item.onClick}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left ${
                    index !== group.items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.action}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
