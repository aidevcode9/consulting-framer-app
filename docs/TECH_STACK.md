# Tech Stack & Architecture Decisions

> Why each technology was chosen, what patterns enforce quality, and how it all fits together.

---

## Stack at a Glance

| Layer | Technology | Role |
|-------|------------|------|
| **Framework** | Next.js 14 (App Router) | Server components, SSR, file-based routing |
| **Language** | TypeScript (strict mode) | End-to-end type safety with Zod validation |
| **UI** | React 18 + Tailwind CSS | Component architecture, utility-first styling |
| **Canvas** | React Flow (@xyflow/react) | Production-grade node-based infinite canvas |
| **State** | Zustand | Lightweight, TypeScript-first client state |
| **Database** | Supabase (PostgreSQL 15) | Managed Postgres with RLS, auth, and real-time |
| **Auth** | Supabase Auth (GoTrue) | Email/password + Google OAuth, JWT sessions |
| **Payments** | Stripe | Checkout Sessions, Subscriptions, Webhooks, Customer Portal |
| **AI** | Anthropic Claude API | Discovery copilot, framework analysis, document generation |
| **Background Jobs** | Inngest | Event-driven async functions for long-running tasks |
| **Hosting** | Vercel | Edge functions, automatic scaling, preview deploys |

---

## Architecture Pattern: Thin Routes → Fat Services → Repository

The codebase follows a strict three-layer separation:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    API Route      │ ──▶ │    Service        │ ──▶ │   Repository     │
│                   │     │                   │     │                  │
│  • Auth check     │     │  • Business logic │     │  • Database ops  │
│  • Input parsing  │     │  • Validation     │     │  • Entity mapping│
│  • Error handling │     │  • Usage limits   │     │  • Query building│
│  • ~10-15 lines   │     │  • Orchestration  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

**Why this matters:**
- **Testability** — Services are unit-testable without HTTP or a running server
- **Reusability** — The same service logic powers API routes *and* background jobs
- **Clarity** — A route never exceeds ~20 lines; all logic lives where it's searchable

---

## Key Design Decisions

### 1. Supabase as Managed PostgreSQL (not a platform dependency)

Supabase provides PostgreSQL 15 with built-in auth and Row-Level Security. The critical decision was to treat it as **managed Postgres**, not a proprietary platform:

- All schema defined in raw SQL (`supabase/schema.sql`)
- Repository pattern abstracts database access — services never call Supabase directly
- RLS policies use standard Postgres syntax
- **Migration path**: Export SQL, spin up any Postgres instance, swap the connection string

No lock-in. The schema is portable.

### 2. Row-Level Security on Every Table

Every table has RLS policies enforcing multi-tenant isolation at the database layer. Even if application code has a bug, a user physically cannot access another user's data.

```sql
-- Example: engagements are scoped to owner
CREATE POLICY "Users can only access own engagements"
ON engagements FOR ALL
USING (auth.uid() = user_id);
```

This is defense-in-depth: services also verify ownership, but RLS is the hard boundary.

### 3. AI Keys Server-Side Only

`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are never exposed to the client. All AI calls route through API endpoints, keeping credentials secure and enabling usage tracking/rate limiting at the server level.

### 4. Methodology-Aware AI Prompts

Framework analysis isn't generic — each framework has a dedicated prompt built on its academic methodology:

| Framework | Source | What the Prompt Encodes |
|-----------|--------|-------------------------|
| **SWOT** | Humphrey, Stanford Research Institute (1960s) | Internal vs. external distinction, TOWS strategic options |
| **Porter's Five Forces** | Porter, M.E. — HBR (1979, 2008) | Force intensity ratings, industry-specific competitive dynamics |
| **McKinsey 7-S** | Peters, Waterman & Phillips (1980) | Hard/soft element separation, alignment issue detection |
| **Business Model Canvas** | Osterwalder & Pigneur (2010) | Value proposition fit, block-to-block coherence analysis |

Output includes strategic implications (not just observations), evidence quality tracking, and methodology citations visible in the UI.

### 5. Background Jobs for Long-Running AI

SOW and proposal generation can take 30-60 seconds. Rather than hitting Vercel's timeout limits:

```
User clicks "Generate" → API fires Inngest event → Immediate "processing" response
                         Inngest runs in background → Saves result → Notifies user
```

Inngest provides automatic retries, step-level checkpointing, and observability — no custom queue infrastructure needed.

### 6. Stripe Webhooks as Billing Source of Truth

Client-side payment confirmation is never trusted. Subscription state flows exclusively through Stripe webhooks:

```
Stripe Event → Webhook endpoint → Update subscription table → Update profile tier
```

The app reads tier from the database; the database is only updated by webhooks. This prevents any race condition or client-side manipulation of billing state.

---

## Quality Gates

Every commit must pass all three gates:

```bash
npm run lint       # ESLint — zero errors
npm run typecheck  # TypeScript strict — zero errors
npm run build      # Next.js production build — success
```

Additionally, the development workflow enforces:
- **`/ws-research`** before implementing any feature (understand patterns first)
- **`/ws-skeptic`** after every feature (adversarial review for AI-specific failure modes)
- **`/ws-verify`** before any commit (automated checks, not manual)

---

## AI Safety Controls

| Control | Implementation |
|---------|----------------|
| **Usage limits** | Per-tier caps checked *before* every AI call |
| **Prompt injection defense** | Input sanitization, pattern detection, warning logs |
| **Timeout + retry** | AbortController with exponential backoff (max 3 retries) |
| **Structured output** | JSON schema validation on all AI responses |
| **Audit trail** | Every AI interaction logged: prompt, response, tokens, latency |
| **Human approval** | Required before exporting any generated document |

---

## Scaling Profile

| Users | Infrastructure | Monthly Cost |
|-------|----------------|--------------|
| 0–100 | Vercel Hobby + Supabase Free | $0 |
| 100–500 | Vercel Pro + Supabase Pro | ~$45 |
| 500–2,000 | + Inngest Pro | ~$95 |
| 1,000 users | Full stack | ~$450–550 |

At 1,000 users (~$40K MRR), infrastructure runs at **~98% gross margin**.

---

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, signup, reset password
│   ├── app/                # Main workspace (protected)
│   └── api/                # Thin API routes only
│       ├── ai/             # Discovery, recommend, populate, summary
│       ├── engagements/    # CRUD + canvas auto-save
│       ├── sow/            # SOW generation
│       ├── proposal/       # Proposal generation
│       └── usage/          # Usage tracking
│
├── services/               # Business logic (fat)
│   ├── ai.service.ts       # Claude integration, retry, telemetry
│   ├── engagement.service.ts
│   ├── usage.service.ts
│   └── profile.service.ts
│
├── repositories/           # Database access (abstracted)
│   ├── engagement.repo.ts
│   ├── usage.repo.ts
│   └── profile.repo.ts
│
├── components/
│   ├── canvas/             # React Flow canvas + framework nodes
│   ├── discovery/          # AI discovery panel
│   ├── sow/                # SOW preview + export
│   └── proposal/           # Proposal preview + export
│
├── lib/
│   ├── ai/                 # Prompts, sanitization, client
│   │   └── prompts/
│   │       └── frameworks/ # Methodology-specific prompt files
│   ├── supabase/           # Client + server Supabase setup
│   ├── stripe/             # Tier config, price IDs
│   ├── export/             # PDF + DOCX generation
│   ├── validations/        # Zod schemas
│   └── errors.ts           # Typed error hierarchy
│
├── jobs/                   # Inngest background functions
└── types/                  # Shared TypeScript types
```

---

## Portability

Every component is swappable:

| Component | Currently | Migration Path |
|-----------|-----------|----------------|
| Database | Supabase (PostgreSQL 15) | Export SQL → any Postgres host |
| Auth | Supabase Auth (GoTrue) | Swap to Auth0, Clerk, or custom JWT |
| AI | Anthropic Claude | Swap to OpenAI, Cohere, or self-hosted |
| Hosting | Vercel | Standard Next.js — deploy anywhere |
| Payments | Stripe | Industry standard, widely compatible |

No proprietary APIs. No vendor lock-in. All data exportable.
