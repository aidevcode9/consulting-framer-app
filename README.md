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

## 🚨 Troubleshooting

### Environment Variables Not Working

**Symptoms:** "Cannot connect to Supabase", blank page, or API errors

**Solutions:**
1. Verify `.env.local` exists in project root (NOT `.env`)
2. Check variable format (no quotes unless value contains spaces):
   ```bash
   # ✅ Correct
   NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co

   # ❌ Wrong
   NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
   ```
3. Restart dev server after changing env vars: `pnpm dev`
4. Verify no trailing/leading whitespace in keys

---

### Supabase Connection Fails

**Symptoms:** "Unauthorized", "Cannot read properties", or database errors

**Solutions:**
1. Verify credentials in Supabase Dashboard:
   - Go to Settings > API
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **Anon key** (NOT Service Role) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Check database schema is initialized:
   ```bash
   pnpm db:migrate
   # Or manually run supabase/schema.sql in SQL Editor
   ```
3. Verify tables exist:
   - Go to Supabase Dashboard > Table Editor
   - Should see: profiles, engagements, framework_templates, etc.

---

### TypeScript Errors During Build

**Symptoms:** "Cannot find name 'Database'", type mismatch errors

**Solutions:**
1. Generate Supabase types:
   ```bash
   pnpm db:types
   ```
2. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm build
   ```
3. Verify TypeScript version:
   ```bash
   pnpm tsc --version  # Should be 5.7.2+
   ```

---

### AI Features Not Working

**Symptoms:** Discovery panel shows errors, no AI responses

**Solutions:**
1. Verify `ANTHROPIC_API_KEY` in `.env.local`:
   - Format: `sk-ant-api03-...` (new Claude API format)
   - Get from: https://console.anthropic.com/account/keys
2. Check API route logs:
   ```bash
   # Look for errors in terminal running pnpm dev
   # Should see: "Received discovery request" in console
   ```
3. Test API manually:
   ```bash
   curl -X POST http://localhost:3000/api/ai/discovery \
     -H "Content-Type: application/json" \
     -d '{"engagement":{"title":"Test"},"answers":{}}'
   ```

---

### Node Version Issues

**Symptoms:** "Cannot find module", build errors, dependency issues

**Solutions:**
1. Check Node version:
   ```bash
   node --version  # Must be 18.0.0 or higher
   ```
2. Upgrade Node if needed:
   ```bash
   # Using nvm:
   nvm install 18.19.0
   nvm use 18.19.0
   ```
3. Reinstall dependencies:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

---

### Canvas Performance Issues

**Symptoms:** Slow rendering, lag when dragging nodes

**Solutions:**
1. Reduce number of nodes (limit to 30-40 for now)
2. Zoom out to see full canvas (React Flow virtualizes viewport)
3. Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+F5)
4. Check browser console for memory warnings

---

### Production Build Issues

**Symptoms:** Build succeeds but app crashes in production

**Solutions:**
1. Test production build locally:
   ```bash
   pnpm build
   pnpm start  # Visit http://localhost:3000
   ```
2. Verify all env vars set in deployment platform:
   - Vercel: Settings > Environment Variables
   - Must include all `NEXT_PUBLIC_*` vars
3. Check for environment-specific issues:
   - Enable verbose logging in production
   - Check deployment platform logs (Vercel > Logs)

---

### Database Permission Errors

**Symptoms:** "permission denied for table", "row-level security policy violation"

**Solutions:**
1. Verify RLS policies are set up:
   - Go to Supabase Dashboard > Authentication > Policies
   - Run `supabase/schema.sql` to create policies
2. For development, temporarily disable RLS (⚠️ NOT for production):
   ```sql
   -- In SQL Editor (development only!):
   ALTER TABLE engagements DISABLE ROW LEVEL SECURITY;
   ```
3. Check you're using correct key:
   - Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser
   - Use `SUPABASE_SERVICE_ROLE_KEY` for server admin operations (Phase 2+)

---

### Still Having Issues?

1. Check [GitHub Issues](https://github.com/aidevcode9/consulting-framer-app/issues)
2. Enable debug logging:
   ```bash
   # Add to .env.local:
   NEXT_PUBLIC_DEBUG=true
   ```
3. Review full error stack trace in browser DevTools Console
4. Check Supabase logs: Dashboard > Logs > API Logs
5. See detailed environment variable guide: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)

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
