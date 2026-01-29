# Messenger

A modern, real-time messaging application built with React, TypeScript, and Supabase.

## Features

- 💬 Real-time messaging with instant delivery
- 🖼️ Image, audio, and file sharing
- 🎤 Voice message recording
- ⌨️ Typing indicators
- 🟢 Online/offline presence tracking
- ✅ Message read receipts
- 🔐 Secure authentication
- 📱 Mobile-responsive design

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: TanStack Query
- **Backend**: Supabase (PostgreSQL, Realtime, Storage, Auth)
- **UI Components**: shadcn/ui, Radix UI
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd messenger

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Project Structure

```
src/
├── components/
│   ├── messenger/     # Chat UI components
│   ├── auth/          # Authentication components
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks
├── pages/             # Route pages
├── types/             # TypeScript types
└── integrations/      # External service integrations
```

## License

MIT
