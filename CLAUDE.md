# CLAUDE.md — Consulting Framer

> Visual engagement builder for consultants. AI discovery → frameworks → professional SOWs.

---

## ⚡ Auto-Trigger Rules

**These behaviors are AUTOMATIC. No command needed.**

| When I... | Claude automatically... |
|-----------|------------------------|
| Say "let's work on Phase X" | Runs `/ws-orchestrate` → batches FRs from that phase |
| Say "implement FR-XXX" or list FRs | Runs `/ws-orchestrate` → validates phase, creates plan |
| Say "continue" or "what's next" | Checks CHECKPOINT.md + STATUS.md → resumes work |
| Say "build/add [feature]" | Runs `/ws-research` first → then `/ws-start-task` |
| Complete an FR | Runs `/ws-verify` → logs to CHECKPOINT.md |
| Say "ship it" or "done for today" | Runs `/ws-status` → `/ws-commit` |

**Before implementing ANYTHING:**
1. Check which phase we're in (STATUS.md)
2. Validate FR is in current phase (or get approval)
3. Research patterns first (`/ws-research`)

---

## 🤖 Orchestrator Protocol

The orchestrator (`/ws-orchestrate`) manages multi-FR sessions:

### Phase Order (STRICT)

| Phase | FRs | Gate |
|-------|-----|------|
| 1. MVP | FR-100, FR-200, FR-300 | — |
| 2. Monetize | FR-400, FR-900 | Phase 1 P0s done |
| 3. Deliver | FR-500, FR-600 | Phase 2 P0s done |
| 4. Manage | FR-700 | Phase 3 P0s done |
| 5. Scale | FR-800, FR-1000 | Phase 4 P0s done |

### Batching Rules

- **Max 3-5 FRs per session** — Stay focused
- **Same phase only** — Unless explicitly approved
- **P0 before P1** — Priorities matter
- **Respect dependencies** — Auth before features that need auth

### Session Flow

```
/ws-orchestrate
    ↓
[Create plan, get approval]
    ↓
For each FR:
    /ws-research → /ws-start-task → /ws-verify → /ws-skeptic → CHECKPOINT.md
    ↓
[Commit working code]
    ↓
/ws-status → Update STATUS.md
```

---

## Reference Docs (Read These First)

| Doc | Purpose | When to Check |
|-----|---------|---------------|
| `REQUIREMENTS.md` | FRs/NFRs with acceptance criteria | Starting any feature |
| `ARCHITECTURE.md` | Service layer, repos, Stripe, AI patterns | Implementing backend |
| `STATUS.md` | Current phase, tasks, blockers | Daily; before picking work |
| `CHECKPOINT.md` | Session progress, handoff context | Resuming work |
| `EVALS.md` | Test scenarios and golden cases | Adding/changing AI logic |

---

## Workflow (Single FR)

1. `/ws-research [FR-NNN]` → Understand patterns, dependencies
2. Look up FR in `REQUIREMENTS.md` → Read acceptance criteria
3. Check `ARCHITECTURE.md` → Find relevant service/repo pattern
4. Implement → Run lint + typecheck + build
5. Log to `CHECKPOINT.md` → Track progress
6. Update `STATUS.md` → Move task to "Shipped"
7. Commit with `type(scope): description (FR-NNN)`

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI | React 18 + Tailwind CSS |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand (client) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Payments | Stripe (Checkout + Webhooks) |
| AI | Anthropic Claude API |
| Background Jobs | Inngest |
| Hosting | Vercel |

---

## Architecture Pattern: Thin Routes, Fat Services

```
API Route (thin)          Service (fat)           Repository
     │                        │                       │
     │ 1. Auth check          │                       │
     │ 2. Parse input         │                       │
     │ 3. Call service ──────▶│ Business logic        │
     │                        │ Validation            │
     │                        │ Usage checks          │
     │                        │ Call repo ───────────▶│ Database access
     │                        │                       │ Map to entities
     │◀─────────────────────── │◀──────────────────────│
     │ 4. Return response     │                       │
```

**Rule:** API routes do auth + input parsing only. All business logic in services.

---

## File Layout

```
src/
├── app/
│   ├── (auth)/           # Login, signup pages
│   ├── (dashboard)/      # Protected app pages
│   └── api/              # ⚠️ THIN ROUTES ONLY
│       ├── ai/
│       ├── engagements/
│       ├── billing/
│       └── webhooks/
│
├── services/             # ⭐ BUSINESS LOGIC HERE
│   ├── ai.service.ts
│   ├── engagement.service.ts
│   ├── billing.service.ts
│   └── usage.service.ts
│
├── repositories/         # ⭐ DATABASE ACCESS HERE
│   ├── engagement.repo.ts
│   ├── user.repo.ts
│   └── usage.repo.ts
│
├── jobs/                 # ⭐ BACKGROUND JOBS
│   ├── inngest.ts
│   ├── generate-sow.ts
│   └── sync-usage.ts
│
├── components/
│   ├── canvas/
│   ├── discovery/
│   └── billing/
│
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── ai/
│   └── errors.ts
│
├── store/                # Zustand (client state)
│
└── types/
```

---

## Slash Commands

Located in `.claude/commands/`. Use with `/ws-command-name` in Claude Code.

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/ws-orchestrate` | **Batch FRs, follow the plan** | Starting a work session |
| `/ws-research` | **Pre-implementation research** | Before any new FR |
| `/ws-start-task` | Begin work on a single task | After research approved |
| `/ws-verify` | Run lint, typecheck, build | After implementation |
| `/ws-skeptic` | **Adversarial review** | **After every FR (no exceptions)** |
| `/ws-commit` | Commit, push, create PR | After skeptic passes |
| `/ws-status` | Update STATUS.md | Start/end of session |
| `/ws-mistake` | Log mistake to CLAUDE.md | When something breaks |

**Workflow (every FR, no exceptions):**
```
/ws-research → /ws-start-task → /ws-verify → /ws-skeptic → /ws-commit
```

---

## Shell Commands

```bash
# Development
npm run dev           # Start dev server (localhost:3000)

# Quality checks (ALL MUST PASS)
npm run lint          # ESLint
npm run typecheck     # TypeScript strict
npm run build         # Production build

# Database
npx supabase db push  # Push schema changes
npx supabase gen types typescript --local > src/types/database.ts

# Background jobs (local dev)
npx inngest-cli dev   # Start Inngest dev server
```

---

## Invariants — NEVER Violate

| Rule | Why | Enforcement |
|------|-----|-------------|
| **Follow phase order** | Dependencies matter | Orchestrator validates |
| **Research before implement** | Understand patterns first | `/ws-research` required |
| **Skeptic after every FR** | Catch failure modes early | `/ws-skeptic` always runs |
| **Business logic in services, not routes** | Testable, reusable | Code review |
| **API keys server-side only** | Security | Never import in components |
| **RLS on all user tables** | Multi-tenant isolation | Supabase policies |
| **Check usage before AI calls** | Tier limits | `UsageService.canPerformAction()` |
| **Stripe webhooks = billing truth** | Consistency | Never update tier from client |
| **"use client" for interactivity** | Next.js 14 requirement | React hooks = client |
| **Background jobs for > 10s tasks** | Vercel timeout | Inngest for SOW generation |
| **Log to CHECKPOINT.md** | Track progress, enable handoff | After each FR |

---

## Key Patterns

### 1. API Route (Thin)

```typescript
// src/app/api/engagements/route.ts
import { createClient } from '@/lib/supabase/server';
import { EngagementService } from '@/services/engagement.service';
import { handleApiError } from '@/lib/api-utils';

export async function POST(req: Request) {
  try {
    // 1. Auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse input
    const input = await req.json();

    // 3. Call service (all business logic there)
    const service = new EngagementService(supabase);
    const result = await service.create(user.id, input);

    // 4. Return response
    return Response.json({ engagement: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 2. Service (Fat)

```typescript
// src/services/engagement.service.ts
export class EngagementService extends BaseService {
  private repo: EngagementRepository;
  private usageRepo: UsageRepository;

  constructor(supabase: SupabaseClient) {
    super(supabase);
    this.repo = new EngagementRepository(supabase);
    this.usageRepo = new UsageRepository(supabase);
  }

  async create(userId: string, input: CreateEngagementInput): Promise<Engagement> {
    // Business logic: check limits
    const canCreate = await this.usageRepo.checkLimit(userId, 'engagements');
    if (!canCreate) {
      throw new UsageLimitError('Engagement limit reached');
    }

    // Create via repository
    const engagement = await this.repo.create({
      userId,
      ...input,
    });

    // Track usage
    await this.usageRepo.increment(userId, 'engagements_created');

    return engagement;
  }
}
```

### 3. Repository (Database Access)

```typescript
// src/repositories/engagement.repo.ts
export class EngagementRepository extends BaseRepository<Engagement> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'engagements');
  }

  async findById(id: string): Promise<Engagement | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapToEntity(data) : null;
  }
}
```

### 4. Background Job (Long-running)

```typescript
// src/jobs/generate-sow.ts
export const generateSOW = inngest.createFunction(
  { id: 'generate-sow' },
  { event: 'sow/generate.requested' },
  async ({ event, step }) => {
    const { engagementId, userId } = event.data;

    const engagement = await step.run('fetch', async () => { /* ... */ });
    const content = await step.run('generate', async () => { /* ... */ });
    await step.run('save', async () => { /* ... */ });
  }
);
```

---

## Common Mistakes (Learn from These)

| Mistake | Rule |
|---------|------|
| Started coding without `/ws-research` | Always research patterns first |
| Worked on Phase 2 FR with Phase 1 incomplete | Follow phase order strictly |
| Business logic in API route | Move to service; route should be < 20 lines |
| Direct Supabase calls in service | Use repository |
| Forgot "use client" on component | Add directive for interactive components |
| Exposed ANTHROPIC_API_KEY | Never use process.env without NEXT_PUBLIC_ in components |
| Updated subscription tier from client | Only Stripe webhooks update billing state |
| Long AI call in API route | Use Inngest for > 10s tasks |
| Missing RLS policy on new table | Every table needs policies before deploy |
| Didn't log to CHECKPOINT.md | Always track progress for handoff |
| Ran manual checks instead of `/ws-verify` | Always use `/ws-verify` skill before commit |
| Skipped `/ws-skeptic` after FR | Run `/ws-skeptic` after EVERY FR - no exceptions |

---

## Red Flags — Stop and Ask

- Skipping `/ws-research` "because I know what to do"
- Skipping `/ws-skeptic` after an FR "because it looks fine"
- Skipping `/ws-verify` and running manual checks instead
- Working on FR from wrong phase without approval
- Adding business logic to API routes (> 20 lines)
- Importing `@supabase/supabase-js` directly in services
- Removing or bypassing usage limit checks
- Adding API keys to client components
- Disabling RLS policies "for testing"
- Skipping typecheck because "it's just a quick fix"
- AI calls without timeout handling
- Not logging to CHECKPOINT.md

---

## Quality Gates

All must pass before merge:

```bash
npm run lint       # Zero errors
npm run typecheck  # Zero errors
npm run build      # Builds successfully
```

---

## CHECKPOINT.md Format

After each FR:

```markdown
## [HH:MM] FR-NNN: [Title]

**Status:** ✅ Complete | ⚠️ Partial | ❌ Blocked
**Files changed:** [list]
**Verification:** lint ✅ | typecheck ✅ | build ✅
**Commit:** abc1234
**Notes:** [decisions, issues, context]

---
```

---

## Quick Reference

| Need | Location |
|------|----------|
| What to work on | STATUS.md → Now / Next |
| Feature specs | REQUIREMENTS.md → FR-xxx |
| Patterns to follow | ARCHITECTURE.md |
| Last session progress | CHECKPOINT.md |
| Database schema | `supabase/schema.sql` |
| Stripe config | `src/lib/stripe/config.ts` |
| AI prompts | `src/lib/ai/prompts.ts` |
| Error classes | `src/lib/errors.ts` |
| Type definitions | `src/types/index.ts` |
