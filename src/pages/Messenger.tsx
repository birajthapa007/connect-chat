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
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: conversations } = useConversations();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    if (isMobileView) {
      setShowChat(true);
    }
  };

  const handleBack = () => {
    setShowChat(false);
  };

  const handleConversationCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobileView) {
      setShowChat(true);
    }
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
      {/* Sidebar */}
      <div
        className={`${
          isMobileView ? (showChat ? 'hidden' : 'w-full') : 'flex'
        } md:flex`}
      >
        <ConversationSidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversation(true)}
        />
      </div>

      {/* Chat view */}
      <div
        className={`flex-1 ${
          isMobileView ? (showChat ? 'flex' : 'hidden') : 'flex'
        } md:flex`}
      >
        <ChatView
          conversationId={selectedConversationId}
          participantProfile={participantProfile}
          onBack={isMobileView ? handleBack : undefined}
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
