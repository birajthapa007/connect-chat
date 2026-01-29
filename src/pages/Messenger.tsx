import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { ConversationSidebar } from '@/components/messenger/ConversationSidebar';
import { ChatView } from '@/components/messenger/ChatView';
import { NewConversationDialog } from '@/components/messenger/NewConversationDialog';
import { Profile } from '@/types/messenger';

export default function Messenger() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: conversations } = useConversations();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Handle responsive behavior
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChat(true);
  };

  // Get participant profile for the selected conversation
  const selectedConversation = conversations?.find(c => c.id === selectedConversationId);
  const participantProfile: Profile | null = selectedConversation?.participant ?? null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar - hidden on mobile when chat is open */}
      <div
        className={`${
          showChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-auto`}
      >
        <ConversationSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversation(true)}
        />
      </div>

      {/* Chat view - full screen on mobile when active */}
      <div
        className={`flex-1 ${
          showChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        <ChatView
          conversationId={selectedConversationId}
          participantProfile={participantProfile}
          onBack={handleBack}
        />
      </div>

      {/* New conversation dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}
