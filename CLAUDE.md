# CLAUDE.md — Consulting Framer

> Visual engagement builder for consultants. AI discovery → frameworks → professional SOWs.

## Reference Docs (Read These First)

| Doc | Purpose | When to Check |
|-----|---------|---------------|
| `REQUIREMENTS.md` | FRs/NFRs with acceptance criteria | Starting any feature |
| `ARCHITECTURE.md` | Service layer, repos, Stripe, AI patterns | Implementing backend |
| `STATUS.md` | Current phase, tasks, blockers | Daily; before picking work |
| `EVALS.md` | Test scenarios and golden cases | Adding/changing AI logic |

## Workflow

1. Check `STATUS.md` → find task in "Next" or "Now"
2. Look up FR in `REQUIREMENTS.md` → read acceptance criteria
3. Check `ARCHITECTURE.md` → find relevant service/repo pattern
4. Implement → run lint + typecheck + build
5. Update `STATUS.md` → move task to "Shipped"
6. Commit with `type(scope): description (FR-NNN)`

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
     │◀────────────────────── │◀──────────────────────│
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
| `/ws-start-task` | Begin work on a task | Starting any new feature |
| `/ws-verify` | Run lint, typecheck, build | Before committing |
| `/ws-skeptic` | Adversarial code review | After implementing AI features |
| `/ws-commit` | Commit, push, create PR | After verify passes |
| `/ws-status` | Update STATUS.md | Start/end of session |
| `/ws-mistake` | Log mistake to CLAUDE.md | When something breaks |

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
| **Business logic in services, not routes** | Testable, reusable | Code review |
| **API keys server-side only** | Security | Never import in components |
| **RLS on all user tables** | Multi-tenant isolation | Supabase policies |
| **Check usage before AI calls** | Tier limits | `UsageService.canPerformAction()` |
| **Stripe webhooks = billing truth** | Consistency | Never update tier from client |
| **"use client" for interactivity** | Next.js 14 requirement | React hooks = client |
| **Background jobs for > 10s tasks** | Vercel timeout | Inngest for SOW generation |

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

  private mapToEntity(row: any): Engagement {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      // ... map snake_case to camelCase
    };
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

    // Step 1: Fetch data
    const engagement = await step.run('fetch', async () => {
      // ...
    });

    // Step 2: Generate (can take 30-60s)
    const content = await step.run('generate', async () => {
      // ...
    });

    // Step 3: Save
    await step.run('save', async () => {
      // ...
    });
  }
);
```

---

## Common Mistakes (Learn from These)

| Mistake | Rule |
|---------|------|
| Business logic in API route | Move to service; route should be < 20 lines |
| Direct Supabase calls in service | Use repository; service shouldn't know about `supabase.from()` |
| Forgot "use client" on component | Add directive at top of interactive components |
| Exposed ANTHROPIC_API_KEY | Never use process.env without NEXT_PUBLIC_ in components |
| Updated subscription tier from client | Only Stripe webhooks update billing state |
| Long AI call in API route | Use Inngest for > 10s tasks |
| Missing RLS policy on new table | Every table needs policies before deploy |

---

## Red Flags — Stop and Ask

- Adding business logic to API routes (> 20 lines)
- Importing `@supabase/supabase-js` directly in services
- Removing or bypassing usage limit checks
- Adding API keys to client components
- Disabling RLS policies "for testing"
- Skipping typecheck because "it's just a quick fix"
- AI calls without timeout handling

---

## Quality Gates

All must pass before merge:

```bash
npm run lint       # Zero errors
npm run typecheck  # Zero errors
npm run build      # Builds successfully
```

---

## Error Handling

Use custom error classes:

```typescript
// Throwing errors in services
throw new NotFoundError('Engagement');
throw new UsageLimitError('AI queries');
throw new ForbiddenError();

// API routes catch and format
try {
  // ...
} catch (error) {
  return handleApiError(error);  // Returns proper status codes
}
```

---

## AI Service Usage

All Claude API calls go through `AIService`:

```typescript
const aiService = new AIService(supabase);

// Discovery follow-up
const response = await aiService.generateDiscoveryFollowUp(userId, {
  question: userAnswer,
  previousAnswers: context,
});

// Framework recommendations
const frameworks = await aiService.recommendFrameworks(userId, discoveryAnswers);

// SOW generation (triggers background job)
await inngest.send({
  name: 'sow/generate.requested',
  data: { engagementId, userId },
});
```

---

## Stripe Billing

**Golden rule:** Never trust client-side payment status.

```typescript
// ✅ CORRECT: Check from database (synced by webhook)
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier')
  .eq('id', userId)
  .single();

if (profile.subscription_tier === 'pro') {
  // User has paid
}

// ❌ WRONG: Trust client-side claim
if (request.body.isPro) {
  // Never do this
}
```

---

## Quick Reference

| Need | Location |
|------|----------|
| Database schema | `supabase/schema.sql` |
| Service patterns | `ARCHITECTURE.md` → Service Layer |
| API endpoints | `ARCHITECTURE.md` → API Route Patterns |
| Feature specs | `REQUIREMENTS.md` → FR-xxx |
| Current tasks | `STATUS.md` → Now / Next |
| Test scenarios | `EVALS.md` |
| Stripe config | `src/lib/stripe/config.ts` |
| AI prompts | `src/lib/ai/prompts.ts` |
| Error classes | `src/lib/errors.ts` |
| Type definitions | `src/types/index.ts` |
