# Consulting Framer MVP

Visual engagement builder for consultants — AI-assisted discovery, strategic frameworks, and automated deliverables.

![Consulting Framer](./docs/screenshot.png)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (free tier works)
- Anthropic API key (for AI features)

### 1. Clone and Install

```bash
# Clone the repo
git clone https://github.com/yourname/consulting-framer.git
cd consulting-framer

# Install dependencies
pnpm install
# or: npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:
   ```bash
   # Copy contents of supabase/schema.sql and paste into SQL Editor
   # Or use Supabase CLI:
   supabase db push
   ```
3. Get your credentials from **Settings > API**:
   - Project URL
   - Anon/Public key

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-your-key
```

### 4. Run Development Server

```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the landing page.

Click **"Try Free"** or go to [http://localhost:3000/app](http://localhost:3000/app) for the workspace.

---

## 🎯 Features (MVP)

### ✅ Implemented

- **Landing Page** — Professional marketing page with features, pricing, how-it-works
- **Visual Canvas** — React Flow-powered infinite canvas
- **3 Consulting Frameworks**
  - SWOT Analysis (4-quadrant grid)
  - Porter's Five Forces (diamond layout)
  - McKinsey 7-S (hard/soft elements)
- **Framework Panel** — Drag and drop frameworks onto canvas
- **Note Nodes** — Add custom notes with color picker
- **AI Discovery Panel** — Guided question flow with AI follow-ups
- **Canvas Toolbar** — Undo/redo, zoom, export PNG, save
- **Engagement Management** — Create, select, track engagements
- **State Management** — Zustand stores for canvas, engagement, discovery, UI

### 🔜 Coming Next (Phase 2+)

- [ ] Supabase auth integration
- [ ] Persist engagements to database
- [ ] AI framework recommendations
- [ ] SOW/proposal generation
- [ ] PDF/DOCX export
- [ ] Real-time collaboration

---

## 📁 Project Structure

```
consulting-framer-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles + Tailwind
│   │   └── app/
│   │       └── page.tsx          # Main workspace
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx        # Main React Flow canvas
│   │   │   ├── CanvasToolbar.tsx # Toolbar with actions
│   │   │   ├── FrameworkPanel.tsx# Drag-and-drop panel
│   │   │   └── nodes/
│   │   │       ├── SWOTNode.tsx
│   │   │       ├── PorterNode.tsx
│   │   │       ├── McKinseyNode.tsx
│   │   │       └── NoteNode.tsx
│   │   │
│   │   └── discovery/
│   │       └── DiscoveryPanel.tsx # AI discovery questions
│   │
│   ├── lib/
│   │   ├── store.ts              # Zustand state management
│   │   ├── ai/
│   │   │   └── service.ts        # Claude AI integration
│   │   └── supabase/
│   │       ├── client.ts         # Browser client
│   │       └── server.ts         # Server client
│   │
│   └── types/
│       └── index.ts              # TypeScript types
│
├── supabase/
│   └── schema.sql                # Database schema
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| Icons | Lucide React |

---

## 🔧 Development

### Commands

```bash
# Development
pnpm dev              # Start dev server

# Build
pnpm build            # Production build
pnpm start            # Start production server

# Quality
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check

# Database
pnpm db:migrate       # Push schema to Supabase
pnpm db:reset         # Reset database
pnpm db:types         # Generate TypeScript types
```

### Adding a New Framework Node

1. Create component in `src/components/canvas/nodes/`
2. Follow the pattern from `SWOTNode.tsx`
3. Register in `Canvas.tsx` nodeTypes object
4. Add to `FrameworkPanel.tsx` FRAMEWORKS array
5. Update types in `src/types/index.ts`

---

## 📊 Database Schema

See `supabase/schema.sql` for full DDL. Key tables:

- `profiles` — User data (extends Supabase auth)
- `engagements` — Client engagements with canvas data
- `framework_templates` — Pre-built framework templates
- `discovery_questions` — AI discovery question bank
- `deliverables` — Generated SOWs and proposals
- `ai_interactions` — AI usage tracking

All tables have Row Level Security (RLS) enabled.

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `ANTHROPIC_API_KEY` | Yes* | Claude API key (*for AI features) |
| `NEXT_PUBLIC_APP_URL` | No | App base URL |

---

## 📝 License

MIT — see [LICENSE](./LICENSE)

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for consultants who value their time.
