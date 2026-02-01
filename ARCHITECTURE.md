# 📚 Messenger - Complete Project Architecture Guide

> A comprehensive reference for understanding every file in this project, their purposes, and interconnections.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Core Files](#core-files)
4. [Pages](#pages)
5. [Components](#components)
6. [Hooks](#hooks)
7. [Integrations](#integrations)
8. [Types](#types)
9. [Styling](#styling)
10. [Configuration Files](#configuration-files)
11. [File Connection Map](#file-connection-map)
12. [Data Flow Diagrams](#data-flow-diagrams)
13. [Database Schema](#database-schema)
14. [App Naming & Branding](#app-naming--branding)

---

## 🎯 Project Overview

**Messenger** is a real-time chat application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **State Management**: TanStack Query (React Query)

### Core Features
- User authentication (signup/login)
- Real-time messaging
- Typing indicators
- User presence (online/offline status)
- File sharing (images, audio, documents)
- Audio recording
- Conversation management

---

## 📁 Directory Structure

```
messenger/
├── public/                 # Static assets served directly
├── src/
│   ├── assets/            # Imported assets (images, fonts)
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication-related components
│   │   ├── messenger/     # Chat/messaging components
│   │   └── ui/            # shadcn/ui base components
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Third-party integrations (Supabase)
│   ├── lib/               # Utility functions
│   ├── pages/             # Route page components
│   ├── test/              # Test configuration and tests
│   └── types/             # TypeScript type definitions
├── supabase/              # Supabase configuration
└── [config files]         # Various configuration files
```

---

## 🔧 Core Files

### `src/main.tsx`
**Purpose**: Application entry point - mounts React to DOM

**What it does**:
- Imports the root `App` component
- Imports global CSS (`index.css`)
- Renders App to the `#root` element

**Connections**:
- → `src/App.tsx` (imports and renders)
- → `src/index.css` (global styles)
- ← `index.html` (script target)

```tsx
// Simple entry - just mounts the app
createRoot(document.getElementById("root")!).render(<App />);
```

---

### `src/App.tsx`
**Purpose**: Root component - sets up providers and routing

**What it does**:
- Wraps app in `QueryClientProvider` (React Query)
- Wraps app in `AuthProvider` (authentication context)
- Sets up React Router with all routes
- Includes global toast notifications

**Connections**:
- ← `src/main.tsx` (imported by)
- → `src/hooks/useAuth.tsx` (AuthProvider)
- → All page components (routing)
- → Toast/Sonner components (notifications)

**Provider Hierarchy**:
```
QueryClientProvider (data fetching)
  └── AuthProvider (user authentication)
        └── TooltipProvider (UI tooltips)
              └── BrowserRouter (routing)
                    └── Routes (page components)
```

---

### `src/lib/utils.ts`
**Purpose**: Utility functions used across the app

**What it does**:
- Exports `cn()` function for merging Tailwind classes
- Combines `clsx` and `tailwind-merge` for class handling

**Connections**:
- ← Almost every component (imports `cn`)

```tsx
// Usage example
className={cn("base-class", isActive && "active-class", className)}
```

---

## 📄 Pages

### `src/pages/Login.tsx`
**Purpose**: User login page

**What it does**:
- Renders login form (email + password)
- Handles form validation
- Calls `signIn` from auth hook
- Redirects to messenger on success

**Connections**:
- → `src/hooks/useAuth.tsx` (signIn function)
- → `src/components/auth/AuthLayout.tsx` (layout wrapper)
- → `src/components/ui/*` (form elements)
- ↔ `src/pages/Signup.tsx` (navigation link)

---

### `src/pages/Signup.tsx`
**Purpose**: User registration page

**What it does**:
- Collects first name, last name, email, password
- Generates username automatically
- Creates user account via Supabase Auth
- Shows email verification message

**Connections**:
- → `src/hooks/useAuth.tsx` (signUp function)
- → `src/components/auth/AuthLayout.tsx` (layout wrapper)
- ↔ `src/pages/Login.tsx` (navigation link)

---

### `src/pages/Messenger.tsx`
**Purpose**: Main chat interface - the heart of the app

**What it does**:
- Checks authentication status
- Manages conversation selection state
- Renders sidebar and chat view
- Handles mobile responsive layout

**Connections**:
- → `src/hooks/useAuth.tsx` (user, loading state)
- → `src/components/messenger/ConversationSidebar.tsx`
- → `src/components/messenger/ChatView.tsx`

**State Flow**:
```
Messenger
├── selectedConversation (which chat is open)
├── showMobileChat (mobile view toggle)
└── Passes these to children as props
```

---

### `src/pages/Profile.tsx`
**Purpose**: User profile management page

**What it does**:
- Displays user profile information
- Allows editing display name, bio
- Profile picture management

**Connections**:
- → `src/hooks/useAuth.tsx`
- → `src/hooks/useProfiles.tsx`

---

### `src/pages/Settings.tsx`
**Purpose**: Application settings page

**What it does**:
- Theme preferences
- Notification settings
- Account management

**Connections**:
- → `src/hooks/useAuth.tsx`

---

### `src/pages/NotFound.tsx`
**Purpose**: 404 error page

**What it does**:
- Displays when route doesn't exist
- Provides navigation back to home

---

## 🧩 Components

### Authentication Components

#### `src/components/auth/AuthLayout.tsx`
**Purpose**: Shared layout for login/signup pages

**What it does**:
- Provides consistent styling for auth pages
- Centers content with background effects
- Wraps children in styled container

**Connections**:
- ← `src/pages/Login.tsx`
- ← `src/pages/Signup.tsx`

---

### Messenger Components

#### `src/components/messenger/ConversationSidebar.tsx`
**Purpose**: Left sidebar showing all conversations

**What it does**:
- Lists all user conversations
- Shows unread message counts
- Displays user avatars and last messages
- "New conversation" button
- User profile dropdown menu
- Search functionality

**Connections**:
- → `src/hooks/useConversations.tsx` (conversation data)
- → `src/hooks/useAuth.tsx` (current user, signOut)
- → `src/hooks/useProfiles.tsx` (user profile data)
- → `src/components/messenger/UserAvatar.tsx`
- → `src/components/messenger/NewConversationDialog.tsx`
- ← `src/pages/Messenger.tsx` (parent)

**Props Received**:
```tsx
{
  selectedId: string | null;      // Currently selected conversation
  onSelect: (id: string) => void; // Selection handler
  onMobileSelect: () => void;     // Mobile navigation
}
```

---

#### `src/components/messenger/ChatView.tsx`
**Purpose**: Main chat area - displays messages and input

**What it does**:
- Shows conversation header with participant info
- Renders message list
- Displays typing indicator
- Contains message input field
- Mobile back button

**Connections**:
- → `src/hooks/useMessages.tsx` (messages, sendMessage)
- → `src/hooks/useTypingIndicator.tsx` (typing status)
- → `src/hooks/useProfiles.tsx` (participant info)
- → `src/components/messenger/MessageList.tsx`
- → `src/components/messenger/MessageInput.tsx`
- → `src/components/messenger/TypingIndicator.tsx`
- → `src/components/messenger/UserAvatar.tsx`
- ← `src/pages/Messenger.tsx` (parent)

**Props Received**:
```tsx
{
  conversationId: string;
  onBack: () => void; // Mobile back navigation
}
```

---

#### `src/components/messenger/MessageList.tsx`
**Purpose**: Renders the list of messages

**What it does**:
- Maps through messages array
- Determines sent vs received styling
- Handles different message types (text, image, audio, file)
- Auto-scrolls to newest message
- Groups messages by date

**Connections**:
- → `src/components/messenger/UserAvatar.tsx`
- → `src/components/messenger/ImagePreview.tsx`
- → `src/components/messenger/FilePreview.tsx`
- → `src/types/messenger.ts` (Message type)
- ← `src/components/messenger/ChatView.tsx` (parent)

---

#### `src/components/messenger/MessageInput.tsx`
**Purpose**: Text input and attachment controls

**What it does**:
- Text input with auto-resize
- File attachment button (images, files)
- Audio recording button
- Send button
- Triggers typing indicator updates

**Connections**:
- → `src/hooks/useFileUpload.tsx` (file handling)
- → `src/hooks/useTypingIndicator.tsx` (typing updates)
- → `src/components/messenger/AudioRecorder.tsx`
- ← `src/components/messenger/ChatView.tsx` (parent)

---

#### `src/components/messenger/AudioRecorder.tsx`
**Purpose**: Voice message recording UI

**What it does**:
- Start/stop recording controls
- Recording timer display
- Waveform visualization
- Cancel/send buttons

**Connections**:
- → `src/hooks/useAudioRecorder.tsx` (recording logic)
- ← `src/components/messenger/MessageInput.tsx` (parent)

---

#### `src/components/messenger/UserAvatar.tsx`
**Purpose**: Displays user profile picture

**What it does**:
- Shows avatar image or initials fallback
- Online status indicator (green dot)
- Various size options

**Connections**:
- → `src/components/ui/avatar.tsx` (base component)
- ← Multiple messenger components

---

#### `src/components/messenger/TypingIndicator.tsx`
**Purpose**: Shows when other user is typing

**What it does**:
- Animated dots animation
- "typing..." text
- Fade in/out transition

**Connections**:
- ← `src/components/messenger/ChatView.tsx` (parent)

---

#### `src/components/messenger/NewConversationDialog.tsx`
**Purpose**: Modal for starting new conversations

**What it does**:
- Search for users by username
- Display user list
- Create new conversation on select

**Connections**:
- → `src/hooks/useProfiles.tsx` (user search)
- → `src/hooks/useConversations.tsx` (create conversation)
- → `src/components/ui/dialog.tsx` (modal component)
- ← `src/components/messenger/ConversationSidebar.tsx` (parent)

---

#### `src/components/messenger/ImagePreview.tsx`
**Purpose**: Displays image messages

**What it does**:
- Renders image thumbnails
- Click to open full-size viewer

**Connections**:
- → `src/components/messenger/ImageViewer.tsx` (full screen)
- ← `src/components/messenger/MessageList.tsx` (parent)

---

#### `src/components/messenger/ImageViewer.tsx`
**Purpose**: Full-screen image viewer

**What it does**:
- Modal overlay with large image
- Close button
- Download option

---

#### `src/components/messenger/FilePreview.tsx`
**Purpose**: Displays file attachment messages

**What it does**:
- Shows file icon, name, size
- Download link

---

### UI Components (`src/components/ui/`)

These are **shadcn/ui** components - pre-built, customizable UI primitives.

| Component | Purpose |
|-----------|---------|
| `accordion.tsx` | Collapsible content sections |
| `alert.tsx` | Alert messages |
| `alert-dialog.tsx` | Confirmation dialogs |
| `avatar.tsx` | User profile pictures |
| `badge.tsx` | Status badges/labels |
| `button.tsx` | Clickable buttons |
| `card.tsx` | Content containers |
| `checkbox.tsx` | Checkbox inputs |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `form.tsx` | Form handling with react-hook-form |
| `input.tsx` | Text input fields |
| `label.tsx` | Form labels |
| `popover.tsx` | Floating popovers |
| `progress.tsx` | Progress bars |
| `scroll-area.tsx` | Custom scrollbars |
| `select.tsx` | Select dropdowns |
| `separator.tsx` | Visual dividers |
| `sheet.tsx` | Slide-out panels |
| `skeleton.tsx` | Loading placeholders |
| `sonner.tsx` | Toast notifications |
| `switch.tsx` | Toggle switches |
| `tabs.tsx` | Tab navigation |
| `textarea.tsx` | Multi-line text input |
| `toast.tsx` | Toast notifications |
| `tooltip.tsx` | Hover tooltips |

**All UI components**:
- Use the design system tokens from `index.css`
- Are fully accessible (ARIA compliant)
- Support dark mode automatically

---

## 🎣 Hooks

### `src/hooks/useAuth.tsx`
**Purpose**: Authentication state and methods

**What it provides**:
```tsx
{
  user: User | null;           // Current Supabase user
  loading: boolean;            // Auth state loading
  signIn: (email, password) => Promise;
  signUp: (email, password, username, displayName) => Promise;
  signOut: () => Promise;
}
```

**What it does**:
- Creates React Context for auth state
- Listens to Supabase auth state changes
- Provides sign in/up/out methods
- Persists session automatically

**Connections**:
- → `src/integrations/supabase/client.ts` (Supabase client)
- ← `src/App.tsx` (AuthProvider)
- ← All protected pages and components

---

### `src/hooks/useConversations.tsx`
**Purpose**: Fetch and manage conversations

**What it provides**:
```tsx
{
  conversations: ConversationWithDetails[];
  isLoading: boolean;
  createConversation: (userId: string) => Promise<string>;
}
```

**What it does**:
- Fetches user's conversations with React Query
- Joins with participants and last messages
- Creates new conversations
- Real-time subscription for updates

**Connections**:
- → `src/integrations/supabase/client.ts`
- → `src/types/messenger.ts` (types)
- ← `src/components/messenger/ConversationSidebar.tsx`
- ← `src/components/messenger/NewConversationDialog.tsx`

---

### `src/hooks/useMessages.tsx`
**Purpose**: Fetch and send messages for a conversation

**What it provides**:
```tsx
{
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content, type, fileUrl?, fileName?, fileSize?) => Promise;
  markAsRead: (messageId: string) => Promise;
}
```

**What it does**:
- Fetches messages for specific conversation
- Real-time subscription for new messages
- Optimistic updates when sending
- Mark messages as read

**Connections**:
- → `src/integrations/supabase/client.ts`
- → `src/types/messenger.ts`
- ← `src/components/messenger/ChatView.tsx`
- ← `src/components/messenger/MessageInput.tsx`

---

### `src/hooks/useProfiles.tsx`
**Purpose**: Fetch user profile data

**What it provides**:
```tsx
{
  profiles: Profile[];
  getProfile: (userId: string) => Profile | undefined;
  currentProfile: Profile | null;
  searchProfiles: (query: string) => Profile[];
}
```

**What it does**:
- Caches all profiles for quick lookup
- Provides current user's profile
- Search functionality for new conversations

**Connections**:
- → `src/integrations/supabase/client.ts`
- → `src/types/messenger.ts`
- ← Multiple messenger components

---

### `src/hooks/useTypingIndicator.tsx`
**Purpose**: Real-time typing indicators

**What it provides**:
```tsx
{
  isOtherUserTyping: boolean;
  setTyping: (isTyping: boolean) => void;
}
```

**What it does**:
- Subscribes to typing_status table changes
- Debounces typing updates
- Auto-clears typing after timeout

**Connections**:
- → `src/integrations/supabase/client.ts`
- ← `src/components/messenger/ChatView.tsx`
- ← `src/components/messenger/MessageInput.tsx`

---

### `src/hooks/usePresence.tsx`
**Purpose**: User online/offline status

**What it provides**:
```tsx
{
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
}
```

**What it does**:
- Tracks which users are online
- Updates presence on focus/blur
- Real-time presence channel

**Connections**:
- → `src/integrations/supabase/client.ts`
- ← `src/components/messenger/UserAvatar.tsx`
- ← `src/components/messenger/ConversationSidebar.tsx`

---

### `src/hooks/useFileUpload.tsx`
**Purpose**: Handle file uploads to Supabase Storage

**What it provides**:
```tsx
{
  uploadFile: (file: File) => Promise<{ url, name, size }>;
  uploading: boolean;
  progress: number;
}
```

**What it does**:
- Uploads files to Supabase Storage bucket
- Generates unique filenames
- Returns public URLs

**Connections**:
- → `src/integrations/supabase/client.ts`
- ← `src/components/messenger/MessageInput.tsx`

---

### `src/hooks/useAudioRecorder.tsx`
**Purpose**: Browser audio recording

**What it provides**:
```tsx
{
  isRecording: boolean;
  duration: number;
  startRecording: () => Promise;
  stopRecording: () => Promise<Blob>;
  cancelRecording: () => void;
}
```

**What it does**:
- Uses MediaRecorder API
- Tracks recording duration
- Returns audio blob for upload

**Connections**:
- ← `src/components/messenger/AudioRecorder.tsx`

---

### `src/hooks/use-mobile.tsx`
**Purpose**: Detect mobile screen sizes

**What it provides**:
```tsx
{
  isMobile: boolean;
}
```

**What it does**:
- Listens to window resize
- Returns boolean for responsive logic

**Connections**:
- ← Various components for responsive behavior

---

### `src/hooks/use-toast.ts`
**Purpose**: Toast notification management

**What it provides**:
```tsx
{
  toast: (options) => void;
  toasts: Toast[];
  dismiss: (id) => void;
}
```

---

## 🔌 Integrations

### `src/integrations/supabase/client.ts`
**Purpose**: Supabase client instance

**What it does**:
- Creates typed Supabase client
- Configures auth persistence
- Exports singleton instance

**Connections**:
- → `.env` (SUPABASE_URL, SUPABASE_KEY)
- → `src/integrations/supabase/types.ts` (Database types)
- ← All hooks that need database access

```tsx
// How to import
import { supabase } from "@/integrations/supabase/client";
```

---

### `src/integrations/supabase/types.ts`
**Purpose**: TypeScript types for database schema

**What it contains**:
- Auto-generated types matching database tables
- Table row types
- Insert/Update types
- Enum types

**Tables Defined**:
- `profiles`
- `conversations`
- `conversation_participants`
- `messages`
- `typing_status`
- `user_presence`

---

## 📝 Types

### `src/types/messenger.ts`
**Purpose**: Application-specific TypeScript types

**What it defines**:
```tsx
interface Profile {
  id, user_id, username, display_name,
  avatar_url, bio, is_online, last_seen,
  created_at, updated_at
}

interface Conversation {
  id, created_at, updated_at
}

interface ConversationParticipant {
  id, conversation_id, user_id, joined_at
}

type MessageType = 'text' | 'image' | 'audio' | 'file'

interface Message {
  id, conversation_id, sender_id, content,
  message_type, file_url, file_name, file_size,
  is_read, delivered_at, read_at, status,
  created_at, updated_at
}

interface ConversationWithDetails {
  id, participant: Profile, lastMessage, unreadCount
}
```

**Connections**:
- ← All messenger components and hooks

---

## 🎨 Styling

### `src/index.css`
**Purpose**: Global styles and design system tokens

**What it contains**:
1. **Tailwind Imports**: Base, components, utilities
2. **CSS Variables**: Color tokens for theming
3. **Dark Mode**: Automatic dark theme colors
4. **Custom Animations**: Typing dots, fade-in, etc.
5. **Utility Classes**: Glass effects, message bubbles

**Color Token System**:
```css
:root {
  --background: 222 47% 7%;      /* Main background */
  --foreground: 180 100% 95%;    /* Text color */
  --primary: 174 72% 46%;        /* Teal accent */
  --secondary: 180 20% 15%;      /* Secondary surfaces */
  --muted: 180 15% 20%;          /* Muted elements */
  --accent: 174 72% 40%;         /* Accent highlights */
  /* ... more tokens */
}
```

**Connections**:
- ← `src/main.tsx` (imported globally)
- ← `tailwind.config.ts` (extends these tokens)
- → All components via Tailwind classes

---

### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration

**What it does**:
- Extends default theme with custom colors
- Maps CSS variables to Tailwind classes
- Configures animations
- Sets up content paths

**Key Extensions**:
```ts
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ... more color mappings
}
```

---

### `src/App.css`
**Purpose**: Component-specific CSS (mostly unused, styles in index.css)

---

## ⚙️ Configuration Files

### `vite.config.ts`
**Purpose**: Vite build configuration

**What it configures**:
- React plugin
- Path aliases (`@/` → `src/`)
- Build options

---

### `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
**Purpose**: TypeScript configuration

**Key Settings**:
- Strict mode enabled
- Path alias: `@/*` → `src/*`
- ES2020 target

---

### `eslint.config.js`
**Purpose**: Linting rules

---

### `postcss.config.js`
**Purpose**: PostCSS plugins for Tailwind

---

### `vitest.config.ts`
**Purpose**: Testing configuration

---

### `components.json`
**Purpose**: shadcn/ui configuration

**What it specifies**:
- Component style (default)
- Tailwind config path
- Component aliases

---

### `supabase/config.toml`
**Purpose**: Supabase local development config

---

### `.env`
**Purpose**: Environment variables

**Variables**:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

---

## 🗺️ File Connection Map

### Authentication Flow
```
Login.tsx ─────┐
               │
Signup.tsx ────┼──→ useAuth.tsx ──→ supabase/client.ts ──→ Supabase Auth
               │
Messenger.tsx ─┘
```

### Messaging Flow
```
Messenger.tsx
    │
    ├──→ ConversationSidebar.tsx
    │         │
    │         ├──→ useConversations.tsx ──→ supabase/client.ts
    │         ├──→ useProfiles.tsx ────────→ supabase/client.ts
    │         └──→ NewConversationDialog.tsx
    │
    └──→ ChatView.tsx
              │
              ├──→ MessageList.tsx
              │         └──→ ImagePreview.tsx, FilePreview.tsx
              │
              ├──→ MessageInput.tsx
              │         ├──→ useFileUpload.tsx
              │         └──→ AudioRecorder.tsx ──→ useAudioRecorder.tsx
              │
              ├──→ useMessages.tsx ──→ supabase/client.ts
              │
              └──→ useTypingIndicator.tsx ──→ supabase/client.ts
```

### Component Dependencies
```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AuthProvider (useAuth)              │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │          QueryClientProvider             │    │   │
│  │  │  ┌─────────────────────────────────┐    │    │   │
│  │  │  │         BrowserRouter            │    │    │   │
│  │  │  │                                  │    │    │   │
│  │  │  │   /login    → Login.tsx          │    │    │   │
│  │  │  │   /signup   → Signup.tsx         │    │    │   │
│  │  │  │   /         → Messenger.tsx      │    │    │   │
│  │  │  │   /profile  → Profile.tsx        │    │    │   │
│  │  │  │   /settings → Settings.tsx       │    │    │   │
│  │  │  │                                  │    │    │   │
│  │  │  └─────────────────────────────────┘    │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### Real-time Message Flow
```
┌──────────┐    send     ┌──────────────┐    insert    ┌──────────┐
│  User A  │ ──────────→ │  useMessages │ ───────────→ │ Supabase │
└──────────┘             └──────────────┘              │ Database │
                                                       └────┬─────┘
                                                            │
                              realtime subscription         │
                                                            ▼
┌──────────┐    render   ┌──────────────┐   broadcast  ┌──────────┐
│  User B  │ ←────────── │  useMessages │ ←─────────── │ Realtime │
└──────────┘             └──────────────┘              └──────────┘
```

### Authentication Flow
```
┌─────────────┐     submit      ┌───────────┐
│ Login Form  │ ──────────────→ │  useAuth  │
└─────────────┘                 └─────┬─────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │ supabase.auth │
                              │   .signIn()   │
                              └───────┬───────┘
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                   ┌──────────┐             ┌───────────┐
                   │ Success  │             │   Error   │
                   │ → /      │             │ → Toast   │
                   └──────────┘             └───────────┘
```

---

## 🗄️ Database Schema

### Tables Overview

```
┌─────────────────┐     ┌─────────────────────────┐
│    profiles     │     │ conversation_participants│
├─────────────────┤     ├─────────────────────────┤
│ id (PK)         │     │ id (PK)                 │
│ user_id (FK)    │     │ conversation_id (FK)    │──┐
│ username        │     │ user_id                 │  │
│ display_name    │     │ joined_at               │  │
│ avatar_url      │     └─────────────────────────┘  │
│ bio             │                                   │
│ is_online       │     ┌─────────────────┐          │
│ last_seen       │     │  conversations  │←─────────┘
└─────────────────┘     ├─────────────────┤
                        │ id (PK)         │
┌─────────────────┐     │ created_at      │
│  user_presence  │     │ updated_at      │
├─────────────────┤     └────────┬────────┘
│ user_id (PK)    │              │
│ is_online       │              │
│ last_seen       │     ┌────────┴────────┐
│ updated_at      │     │    messages     │
└─────────────────┘     ├─────────────────┤
                        │ id (PK)         │
┌─────────────────┐     │ conversation_id │
│  typing_status  │     │ sender_id       │
├─────────────────┤     │ content         │
│ id (PK)         │     │ message_type    │
│ user_id         │     │ file_url        │
│ conversation_id │     │ file_name       │
│ is_typing       │     │ file_size       │
│ updated_at      │     │ is_read         │
└─────────────────┘     │ status          │
                        │ created_at      │
                        └─────────────────┘
```

### Row Level Security (RLS)

All tables have RLS enabled:
- **profiles**: Anyone can read, only owner can update
- **conversations**: Only participants can read
- **messages**: Only conversation participants can read/write
- **typing_status**: Participants can read, only user can update own
- **user_presence**: Anyone can read, only user can update own

---

## 🚀 App Naming & Branding

### Recommended YC-Style Names

1. **Whispr** - Modern, minimal, suggests private communication
2. **Pulse** - Dynamic, suggests real-time activity
3. **Nexus** - Connection-focused, professional
4. **Flock** - Community-oriented, friendly
5. **Wave** - Simple, approachable, suggests connection

### Recommended Pick: **Pulse**

**Tagline**: "Real-time conversations that keep you connected"

### Logo Concept

```
    ╭──────────────────────────────────╮
    │                                  │
    │     ████  █  █  █     ███  ███   │
    │     █  █  █  █  █     █    █     │
    │     ████  █  █  █     ███  ███   │
    │     █     █  █  █       █  █     │
    │     █     ████  ████  ███  ███   │
    │                                  │
    │         ▁▂▃▄▅▆▇▆▅▄▃▂▁           │
    │       (audio waveform icon)      │
    │                                  │
    ╰──────────────────────────────────╯
```

### Visual Identity

**Primary Color**: Teal (`#0D9488` / `hsl(174, 72%, 46%)`)

**Logo Mark Ideas**:
1. **Waveform**: Stylized audio wave representing real-time communication
2. **Pulse Line**: ECG-style heartbeat pulse
3. **Connected Dots**: Two circles connected by a curved line

### App Icon Concept

```
    ┌────────────────┐
    │                │
    │   ╭─────────╮  │
    │   │ ▂▄▆█▆▄▂ │  │
    │   │  PULSE  │  │
    │   ╰─────────╯  │
    │                │
    └────────────────┘
    
    Rounded square with teal gradient,
    white waveform icon, modern sans-serif
```

### Color Palette

| Color | Hex | Use |
|-------|-----|-----|
| Teal 500 | `#0D9488` | Primary brand |
| Teal 400 | `#2DD4BF` | Highlights |
| Teal 600 | `#0F766E` | Dark accents |
| Slate 900 | `#0F172A` | Background |
| White | `#FFFFFF` | Text/Icons |

---

## 📚 Quick Reference

### Adding a New Feature

1. **Database change needed?** → Create migration in `supabase/migrations/`
2. **New data fetching?** → Create hook in `src/hooks/`
3. **New UI component?** → Create in `src/components/`
4. **New page?** → Create in `src/pages/`, add route to `App.tsx`
5. **New types?** → Add to `src/types/messenger.ts`

### Common Import Paths

```tsx
// Supabase client
import { supabase } from "@/integrations/supabase/client";

// Types
import { Message, Profile } from "@/types/messenger";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Hooks
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";

// Utils
import { cn } from "@/lib/utils";
```

---

## 🎯 Summary

This messenger application follows a clean architecture:

1. **Pages** handle routing and layout
2. **Components** handle UI rendering
3. **Hooks** handle data fetching and business logic
4. **Supabase** handles backend (database, auth, storage, realtime)

Everything flows through the typed Supabase client, ensuring type safety from database to UI.

---

*Last Updated: February 2026*
*Built with ❤️ using React, TypeScript, Tailwind, and Supabase*
