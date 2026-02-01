<p align="center">
  <img src="public/banner.png" alt="Pulse Banner" width="100%" />
</p>

<p align="center">
  <img src="public/logo.png" alt="Pulse Logo" width="120" height="120" />
</p>

<h1 align="center">Pulse</h1>

<p align="center">
  <strong>Real-time conversations that keep you connected</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

- **🔐 Secure Authentication** - Email/password authentication with email verification
- **💬 Real-time Messaging** - Instant message delivery with live updates
- **⌨️ Typing Indicators** - See when others are typing in real-time
- **🟢 Presence Status** - Know who's online with live presence tracking
- **📎 File Sharing** - Share images, documents, and other files
- **🎤 Voice Messages** - Record and send audio messages
- **📱 Mobile Responsive** - Beautiful experience on any device
- **🌙 Dark Mode** - Premium dark theme with teal accents

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | TanStack Query (React Query) |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| **Routing** | React Router v6 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase project (or use Lovable Cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pulse.git
   cd pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
pulse/
├── public/              # Static assets (logo, banner, favicon)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── messenger/   # Chat/messaging components
│   │   └── ui/          # shadcn/ui base components
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   ├── lib/             # Utility functions
│   ├── pages/           # Route page components
│   └── types/           # TypeScript definitions
├── supabase/            # Supabase configuration
└── ARCHITECTURE.md      # Detailed architecture documentation
```

> 📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for comprehensive documentation of every file and their connections.

## 🗄 Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `conversations` | Chat conversations |
| `conversation_participants` | Conversation membership |
| `messages` | Chat messages |
| `typing_status` | Real-time typing indicators |
| `user_presence` | Online/offline status |

## 🎨 Design System

Pulse uses a premium teal color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Teal 500 | `#0D9488` | Primary brand |
| Teal 400 | `#2DD4BF` | Highlights |
| Teal 600 | `#0F766E` | Dark accents |
| Slate 900 | `#0F172A` | Background |

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Built with ❤️ by the Pulse Team
</p>
