# ARCHITECTURE.md — Consulting Framer

> Technical architecture for 100-1000 users. Next.js + Supabase + Stripe + Claude.

---

## ⚠️ Implementation Status

This document describes both **current implementation** and **target architecture**.

| Component | Status | Notes |
|-----------|--------|-------|
| **Landing Page** | ✅ Implemented | `src/app/page.tsx` |
| **App Workspace UI** | ✅ Implemented | `src/app/app/page.tsx` |
| **Canvas + React Flow** | ✅ Implemented | 3 framework nodes working |
| **Discovery Panel UI** | ✅ Implemented | Mock data, no AI yet |
| **Zustand Stores** | ✅ Implemented | `src/lib/store.ts` |
| **Supabase Client** | ✅ Implemented | `src/lib/supabase/` |
| **Error Classes** | ✅ Implemented | `src/lib/errors.ts` |
| **API Utils** | ✅ Implemented | `src/lib/api-utils.ts` |
| **Stripe Config** | ✅ Implemented | `src/lib/stripe/config.ts` |
| **AI Prompts** | ✅ Implemented | `src/lib/ai/prompts.ts` |
| **Inngest Setup** | ✅ Implemented | `src/jobs/inngest.ts` (client only) |
| **Base Service** | ✅ Implemented | `src/services/base.service.ts` (shell) |
| **Base Repository** | ✅ Implemented | `src/repositories/base.repo.ts` (shell) |
| --- | --- | --- |
| **Supabase Auth** | 📋 Planned | Phase 2 |
| **Database Persistence** | 📋 Planned | Phase 2 |
| **AIService (full)** | 📋 Planned | Phase 2 |
| **EngagementService** | 📋 Planned | Phase 2 |
| **UsageService** | 📋 Planned | Phase 2 |
| **BillingService** | 📋 Planned | Phase 2 |
| **All Repositories** | 📋 Planned | Phase 2 |
| **Background Jobs** | 📋 Planned | Phase 3 |
| **Stripe Integration** | 📋 Planned | Phase 2 |
| **SOW Generation** | 📋 Planned | Phase 3 |

**Legend:** ✅ = Working code exists | 📋 = Documented pattern, implement when needed

---

## Design Principles

1. **Thin Routes, Fat Services** — API routes handle auth only; business logic in services
2. **Repository Pattern** — Database access abstracted for testability
3. **Supabase = Managed PostgreSQL** — We use Supabase for convenience, not lock-in
4. **Type-safe end-to-end** — TypeScript + Zod + generated types
5. **AI calls are server-only** — Never expose API keys to browser
6. **Background jobs for long tasks** — SOW generation queued, not blocking

---

## System Architecture

> 📋 **Note:** Diagram shows TARGET architecture. Currently only the highlighted components are implemented.

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                │
│                 (Browser / Mobile Web)                          │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ ✅ Next.js App  │  │ 📋 API Routes   │  │ 📋 Middleware  │  │
│  │   (React SSR)   │  │  /api/* (thin)  │  │  (Auth check)  │  │
│  └─────────────────┘  └────────┬────────┘  └────────────────┘  │
│                                │                                 │
│                    ┌───────────┴───────────┐                    │
│                    │ 📋 SERVICE LAYER      │                    │
│                    │  ┌─────────────────┐  │                    │
│                    │  │ AIService       │  │                    │
│                    │  │ BillingService  │  │                    │
│                    │  │ EngagementSvc   │  │                    │
│                    │  │ UsageService    │  │                    │
│                    │  └─────────────────┘  │                    │
│                    │           │           │                    │
│                    │  ┌─────────────────┐  │                    │
│                    │  │ 📋 REPOSITORIES │  │                    │
│                    │  │ EngagementRepo  │  │                    │
│                    │  │ UserRepo        │  │                    │
│                    │  │ UsageRepo       │  │                    │
│                    │  └─────────────────┘  │                    │
│                    └───────────┬───────────┘                    │
│                                │                                 │
│  ┌─────────────────────────────┴─────────────────────────────┐  │
│  │                 📋 BACKGROUND JOBS                         │  │
│  │              (Inngest / Vercel Cron)                       │  │
│  │  • SOW Generation (long-running)                          │  │
│  │  • Usage rollup                                           │  │
│  │  • Subscription sync                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📋 SUPABASE     │  │ 📋 ANTHROPIC    │  │ 📋 STRIPE       │
│  (PostgreSQL)   │  │                 │  │                 │
│                 │  │ • Claude API    │  │ • Checkout      │
│ • Auth          │  │ • claude-sonnet │  │ • Subscriptions │
│ • Database      │  │                 │  │ • Webhooks      │
│ • RLS Policies  │  │                 │  │ • Portal        │
│ • Storage       │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

✅ = Implemented    📋 = Planned (patterns documented below)
```

---

## Why This Architecture?

### Supabase IS PostgreSQL

Supabase is not a proprietary database. It's:
- **PostgreSQL 15** with extensions (uuid-ossp, etc.)
- **PostgREST** for auto-generated APIs (we don't use this heavily)
- **GoTrue** for auth (we use this)
- **Row Level Security** (standard Postgres feature)

**If we outgrow Supabase:** Export SQL, spin up any Postgres, swap connection string. The schema is portable.

### Why Service Layer?

Without it:
```typescript
// ❌ BAD: Business logic in API route
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 50 lines of business logic here...
  // Can't test without HTTP
  // Can't reuse in other routes
  // Grows into spaghetti
}
```

With it:
```typescript
// ✅ GOOD: Route is thin, service is testable
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const service = new AIService();
  const result = await service.generateFollowUp(user.id, await req.json());
  
  return Response.json(result);
}
```

### Why Repositories?

Services shouldn't know about Supabase specifics:
```typescript
// ❌ BAD: Service coupled to Supabase
class EngagementService {
  async get(id: string) {
    const { data } = await supabase.from('engagements').select('*').eq('id', id);
    return data;
  }
}

// ✅ GOOD: Repository abstracts database
class EngagementService {
  constructor(private repo: EngagementRepository) {}
  
  async get(id: string) {
    return this.repo.findById(id);  // Could be Supabase, Prisma, raw SQL...
  }
}
```

---

## File Structure

### Currently Implemented ✅

```
consulting-framer-app/
├── .claude/
│   └── commands/              # ✅ Slash commands
│       ├── ws-start-task.md
│       ├── ws-verify.md
│       ├── ws-skeptic.md
│       ├── ws-commit.md
│       ├── ws-status.md
│       └── ws-mistake.md
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # ✅ Landing page
│   │   ├── layout.tsx         # ✅ Root layout
│   │   ├── globals.css        # ✅ Styles
│   │   ├── app/
│   │   │   └── page.tsx       # ✅ Workspace UI (mock data)
│   │   └── api/
│   │       └── ai/
│   │           └── discovery/
│   │               └── route.ts  # ✅ Basic route (needs service)
│   │
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx        # ✅ React Flow canvas
│   │   │   ├── CanvasToolbar.tsx # ✅ Undo/redo/zoom
│   │   │   ├── FrameworkPanel.tsx # ✅ Drag-drop panel
│   │   │   └── nodes/
│   │   │       ├── SWOTNode.tsx      # ✅ Working
│   │   │       ├── PorterNode.tsx    # ✅ Working
│   │   │       ├── McKinseyNode.tsx  # ✅ Working
│   │   │       └── NoteNode.tsx      # ✅ Working
│   │   └── discovery/
│   │       └── DiscoveryPanel.tsx  # ✅ UI only (mock questions)
│   │
│   ├── services/
│   │   ├── base.service.ts    # ✅ Shell (error handling pattern)
│   │   └── index.ts           # ✅ Exports
│   │
│   ├── repositories/
│   │   ├── base.repo.ts       # ✅ Shell (query pattern)
│   │   └── index.ts           # ✅ Exports
│   │
│   ├── jobs/
│   │   └── inngest.ts         # ✅ Client setup only
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # ✅ Browser client
│   │   │   └── server.ts      # ✅ Server client
│   │   ├── stripe/
│   │   │   └── config.ts      # ✅ Tier limits, price IDs
│   │   ├── ai/
│   │   │   ├── service.ts     # ✅ Basic functions
│   │   │   └── prompts.ts     # ✅ All prompts
│   │   ├── errors.ts          # ✅ Error classes
│   │   ├── api-utils.ts       # ✅ Route helpers
│   │   ├── store.ts           # ✅ Zustand stores
│   │   └── utils.ts           # ✅ cn() helper
│   │
│   └── types/
│       └── index.ts           # ✅ TypeScript types
│
├── supabase/
│   └── schema.sql             # ✅ Full schema (not deployed)
│
└── [docs]                     # ✅ All documentation
```

### Planned for Phase 2 📋

```
src/
├── app/
│   ├── (auth)/                   # 📋 Auth pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── (dashboard)/              # 📋 Protected routes
│   │   ├── layout.tsx            # Auth wrapper
│   │   ├── page.tsx              # Dashboard
│   │   ├── settings/
│   │   │   └── billing/page.tsx
│   │   └── engagements/
│   │       └── [id]/page.tsx
│   │
│   └── api/
│       ├── engagements/          # 📋 CRUD routes
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── ai/
│       │   ├── recommend/route.ts
│       │   └── generate/route.ts
│       ├── billing/
│       │   ├── checkout/route.ts
│       │   └── portal/route.ts
│       └── webhooks/
│           └── stripe/route.ts
│
├── services/                     # 📋 Business logic
│   ├── ai.service.ts
│   ├── engagement.service.ts
│   ├── billing.service.ts
│   └── usage.service.ts
│
├── repositories/                 # 📋 Database access
│   ├── engagement.repo.ts
│   ├── user.repo.ts
│   ├── usage.repo.ts
│   └── deliverable.repo.ts
│
├── jobs/                         # 📋 Background tasks
│   ├── generate-sow.ts
│   └── sync-usage.ts
│
├── components/
│   └── billing/                  # 📋 Billing UI
│       ├── PricingTable.tsx
│       ├── UsageDisplay.tsx
│       └── UpgradePrompt.tsx
│
└── lib/
    └── supabase/
        └── admin.ts              # 📋 Service role client
```

---

## Service Layer Implementation

> 📋 **STATUS: PLANNED PATTERNS** — Copy these when implementing Phase 2.
> Currently only `base.service.ts` exists as a shell.

### Base Service Pattern ✅ Implemented

```typescript
// src/services/base.service.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/lib/errors';

export abstract class BaseService {
  constructor(protected supabase: SupabaseClient) {}

  protected handleError(error: unknown, context: string): never {
    console.error(`[${this.constructor.name}] ${context}:`, error);
    
    if (error instanceof AppError) throw error;
    
    throw new AppError(
      'INTERNAL_ERROR',
      `Failed to ${context}`,
      { cause: error }
    );
  }
}
```

### AI Service 📋 PLANNED

```typescript
// src/services/ai.service.ts
import Anthropic from '@anthropic-ai/sdk';
import { BaseService } from './base.service';
import { UsageRepository } from '@/repositories/usage.repo';
import { AIInteractionRepository } from '@/repositories/ai-interaction.repo';
import { 
  DISCOVERY_SYSTEM_PROMPT, 
  FRAMEWORK_RECOMMEND_PROMPT,
  SOW_GENERATE_PROMPT 
} from '@/lib/ai/prompts';
import { AppError } from '@/lib/errors';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

interface DiscoveryInput {
  question: string;
  previousAnswers: Record<string, string>;
  engagementType?: string;
}

interface DiscoveryOutput {
  followUpQuestion: string;
  suggestedFrameworks?: string[];
}

export class AIService extends BaseService {
  private anthropic: Anthropic;
  private usageRepo: UsageRepository;
  private aiRepo: AIInteractionRepository;

  constructor(supabase: SupabaseClient) {
    super(supabase);
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.usageRepo = new UsageRepository(supabase);
    this.aiRepo = new AIInteractionRepository(supabase);
  }

  /**
   * Generate follow-up question for discovery
   */
  async generateDiscoveryFollowUp(
    userId: string,
    input: DiscoveryInput
  ): Promise<DiscoveryOutput> {
    const startTime = Date.now();

    try {
      // Check usage limits
      const canProceed = await this.usageRepo.checkLimit(userId, 'ai_queries');
      if (!canProceed) {
        throw new AppError('USAGE_LIMIT_EXCEEDED', 'AI query limit reached');
      }

      // Build prompt
      const userMessage = this.buildDiscoveryPrompt(input);

      // Call Claude with retry
      const response = await this.callWithRetry(
        DISCOVERY_SYSTEM_PROMPT,
        userMessage
      );

      const latencyMs = Date.now() - startTime;

      // Log interaction
      await this.aiRepo.create({
        userId,
        interactionType: 'discovery',
        prompt: userMessage.slice(0, 1000),
        response: response.content.slice(0, 2000),
        model: MODEL,
        tokensPrompt: response.usage.input_tokens,
        tokensCompletion: response.usage.output_tokens,
        latencyMs,
        status: 'success',
      });

      // Increment usage
      await this.usageRepo.increment(userId, 'ai_queries');

      // Parse response
      return this.parseDiscoveryResponse(response.content);

    } catch (error) {
      // Log error
      await this.aiRepo.create({
        userId,
        interactionType: 'discovery',
        prompt: input.question.slice(0, 1000),
        model: MODEL,
        latencyMs: Date.now() - startTime,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      this.handleError(error, 'generate discovery follow-up');
    }
  }

  /**
   * Recommend frameworks based on discovery answers
   */
  async recommendFrameworks(
    userId: string,
    discoveryAnswers: Record<string, string>
  ): Promise<string[]> {
    const startTime = Date.now();

    try {
      const canProceed = await this.usageRepo.checkLimit(userId, 'ai_queries');
      if (!canProceed) {
        throw new AppError('USAGE_LIMIT_EXCEEDED', 'AI query limit reached');
      }

      const userMessage = JSON.stringify(discoveryAnswers, null, 2);
      
      const response = await this.callWithRetry(
        FRAMEWORK_RECOMMEND_PROMPT,
        userMessage
      );

      await this.aiRepo.create({
        userId,
        interactionType: 'recommend',
        prompt: userMessage.slice(0, 1000),
        response: response.content.slice(0, 2000),
        model: MODEL,
        tokensPrompt: response.usage.input_tokens,
        tokensCompletion: response.usage.output_tokens,
        latencyMs: Date.now() - startTime,
        status: 'success',
      });

      await this.usageRepo.increment(userId, 'ai_queries');

      return this.parseFrameworkRecommendations(response.content);

    } catch (error) {
      this.handleError(error, 'recommend frameworks');
    }
  }

  /**
   * Call Claude with retry and timeout
   */
  private async callWithRetry(
    systemPrompt: string,
    userMessage: string,
    retries = MAX_RETRIES
  ): Promise<{ content: string; usage: { input_tokens: number; output_tokens: number } }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await this.anthropic.messages.create({
          model: MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });

        clearTimeout(timeout);

        const content = response.content[0].type === 'text'
          ? response.content[0].text
          : '';

        return {
          content,
          usage: {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens,
          },
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Anthropic.AuthenticationError) throw error;
        if (error instanceof Anthropic.BadRequestError) throw error;

        // Exponential backoff
        if (attempt < retries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('AI call failed after retries');
  }

  private buildDiscoveryPrompt(input: DiscoveryInput): string {
    let prompt = `Current answer: ${input.question}\n\n`;
    
    if (Object.keys(input.previousAnswers).length > 0) {
      prompt += `Previous context:\n${JSON.stringify(input.previousAnswers, null, 2)}\n\n`;
    }

    prompt += 'Generate a follow-up question to deepen understanding.';
    return prompt;
  }

  private parseDiscoveryResponse(content: string): DiscoveryOutput {
    // Extract follow-up question (simple parsing, could use structured output)
    return {
      followUpQuestion: content.trim(),
    };
  }

  private parseFrameworkRecommendations(content: string): string[] {
    // Parse framework list from response
    const frameworks: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('SWOT')) frameworks.push('swot');
      if (line.includes('Porter')) frameworks.push('porter');
      if (line.includes('McKinsey') || line.includes('7-S')) frameworks.push('mckinsey');
      if (line.includes('Business Model Canvas')) frameworks.push('bmc');
    }

    return [...new Set(frameworks)].slice(0, 4);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Engagement Service 📋 PLANNED

```typescript
// src/services/engagement.service.ts
import { BaseService } from './base.service';
import { EngagementRepository } from '@/repositories/engagement.repo';
import { UsageRepository } from '@/repositories/usage.repo';
import { AppError } from '@/lib/errors';
import { Engagement, CreateEngagementInput, UpdateEngagementInput } from '@/types';

export class EngagementService extends BaseService {
  private engagementRepo: EngagementRepository;
  private usageRepo: UsageRepository;

  constructor(supabase: SupabaseClient) {
    super(supabase);
    this.engagementRepo = new EngagementRepository(supabase);
    this.usageRepo = new UsageRepository(supabase);
  }

  async list(userId: string): Promise<Engagement[]> {
    return this.engagementRepo.findByUser(userId);
  }

  async get(userId: string, engagementId: string): Promise<Engagement> {
    const engagement = await this.engagementRepo.findById(engagementId);
    
    if (!engagement) {
      throw new AppError('NOT_FOUND', 'Engagement not found');
    }

    // Verify ownership (RLS should catch this, but defense in depth)
    if (engagement.userId !== userId) {
      throw new AppError('FORBIDDEN', 'Access denied');
    }

    return engagement;
  }

  async create(userId: string, input: CreateEngagementInput): Promise<Engagement> {
    // Check engagement limit
    const canCreate = await this.usageRepo.checkLimit(userId, 'engagements');
    if (!canCreate) {
      throw new AppError('USAGE_LIMIT_EXCEEDED', 'Engagement limit reached');
    }

    const engagement = await this.engagementRepo.create({
      userId,
      title: input.title,
      clientName: input.clientName,
      clientIndustry: input.clientIndustry,
      status: 'draft',
      canvasData: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      discoveryAnswers: {},
    });

    await this.usageRepo.increment(userId, 'engagements_created');

    return engagement;
  }

  async update(
    userId: string,
    engagementId: string,
    input: UpdateEngagementInput
  ): Promise<Engagement> {
    // Verify ownership
    await this.get(userId, engagementId);

    return this.engagementRepo.update(engagementId, input);
  }

  async updateCanvas(
    userId: string,
    engagementId: string,
    canvasData: CanvasData
  ): Promise<void> {
    await this.get(userId, engagementId);
    await this.engagementRepo.updateCanvas(engagementId, canvasData);
  }

  async delete(userId: string, engagementId: string): Promise<void> {
    await this.get(userId, engagementId);
    await this.engagementRepo.delete(engagementId);
  }
}
```

### Usage Service 📋 PLANNED

```typescript
// src/services/usage.service.ts
import { BaseService } from './base.service';
import { UsageRepository } from '@/repositories/usage.repo';
import { UserRepository } from '@/repositories/user.repo';
import { TIER_LIMITS } from '@/lib/stripe/config';

export interface UsageStatus {
  tier: string;
  limits: typeof TIER_LIMITS['free'];
  current: {
    engagements: number;
    aiQueries: number;
    sowGenerated: number;
  };
  percentUsed: {
    engagements: number;
    aiQueries: number;
    sowGenerated: number;
  };
}

export class UsageService extends BaseService {
  private usageRepo: UsageRepository;
  private userRepo: UserRepository;

  constructor(supabase: SupabaseClient) {
    super(supabase);
    this.usageRepo = new UsageRepository(supabase);
    this.userRepo = new UserRepository(supabase);
  }

  async getStatus(userId: string): Promise<UsageStatus> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 'User not found');

    const tier = user.subscriptionTier || 'free';
    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];

    const [engagements, monthlyUsage] = await Promise.all([
      this.usageRepo.countEngagements(userId),
      this.usageRepo.getMonthlyUsage(userId),
    ]);

    const current = {
      engagements,
      aiQueries: monthlyUsage.aiQueries,
      sowGenerated: monthlyUsage.sowGenerated,
    };

    return {
      tier,
      limits,
      current,
      percentUsed: {
        engagements: Math.round((current.engagements / limits.engagements) * 100),
        aiQueries: Math.round((current.aiQueries / limits.ai_queries_per_month) * 100),
        sowGenerated: Math.round((current.sowGenerated / limits.sow_generations) * 100),
      },
    };
  }

  async canPerformAction(
    userId: string,
    action: 'create_engagement' | 'ai_query' | 'generate_sow'
  ): Promise<boolean> {
    const status = await this.getStatus(userId);

    switch (action) {
      case 'create_engagement':
        return status.current.engagements < status.limits.engagements;
      case 'ai_query':
        return status.current.aiQueries < status.limits.ai_queries_per_month;
      case 'generate_sow':
        return status.current.sowGenerated < status.limits.sow_generations;
      default:
        return false;
    }
  }
}
```

---

## Repository Layer Implementation

> 📋 **STATUS: PLANNED PATTERNS** — Copy these when implementing Phase 2.
> Currently only `base.repo.ts` exists as a shell.

### Base Repository ✅ Implemented

```typescript
// src/repositories/base.repo.ts
import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseRepository<T> {
  constructor(
    protected supabase: SupabaseClient,
    protected tableName: string
  ) {}

  protected async query<R>(
    fn: (query: any) => Promise<{ data: R | null; error: any }>
  ): Promise<R> {
    const { data, error } = await fn(this.supabase.from(this.tableName));
    
    if (error) {
      console.error(`[${this.tableName}] Query error:`, error);
      throw error;
    }

    return data as R;
  }
}
```

### Engagement Repository 📋 PLANNED

```typescript
// src/repositories/engagement.repo.ts
import { BaseRepository } from './base.repo';
import { Engagement, CreateEngagementData, UpdateEngagementData, CanvasData } from '@/types';

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

  async findByUser(userId: string): Promise<Engagement[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapToEntity);
  }

  async create(input: CreateEngagementData): Promise<Engagement> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        user_id: input.userId,
        title: input.title,
        client_name: input.clientName,
        client_industry: input.clientIndustry,
        status: input.status,
        canvas_data: input.canvasData,
        discovery_answers: input.discoveryAnswers,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateEngagementData): Promise<Engagement> {
    const updateData: Record<string, any> = {};
    
    if (input.title !== undefined) updateData.title = input.title;
    if (input.clientName !== undefined) updateData.client_name = input.clientName;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.discoveryAnswers !== undefined) updateData.discovery_answers = input.discoveryAnswers;

    const { data, error } = await this.supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapToEntity(data);
  }

  async updateCanvas(id: string, canvasData: CanvasData): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .update({ canvas_data: canvasData })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToEntity(row: any): Engagement {
    return {
      id: row.id,
      userId: row.user_id,
      orgId: row.org_id,
      title: row.title,
      clientName: row.client_name,
      clientIndustry: row.client_industry,
      description: row.description,
      status: row.status,
      canvasData: row.canvas_data,
      discoveryAnswers: row.discovery_answers,
      discoveryCompleted: row.discovery_completed,
      tags: row.tags,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

### Usage Repository 📋 PLANNED

```typescript
// src/repositories/usage.repo.ts
import { BaseRepository } from './base.repo';
import { TIER_LIMITS } from '@/lib/stripe/config';

export class UsageRepository extends BaseRepository<any> {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'usage_daily');
  }

  async checkLimit(userId: string, limitType: keyof typeof TIER_LIMITS['free']): Promise<boolean> {
    // Get user tier
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const tier = (profile?.subscription_tier || 'free') as keyof typeof TIER_LIMITS;
    const limit = TIER_LIMITS[tier][limitType];

    // Get current usage
    if (limitType === 'engagements') {
      const { count } = await this.supabase
        .from('engagements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'archived');

      return (count || 0) < limit;
    }

    // Monthly limits
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usage } = await this.supabase
      .from(this.tableName)
      .select('ai_queries, sow_generated')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    const field = limitType === 'ai_queries_per_month' ? 'ai_queries' : 'sow_generated';
    const current = usage?.reduce((sum, row) => sum + (row[field] || 0), 0) || 0;

    return current < limit;
  }

  async increment(userId: string, field: string): Promise<void> {
    await this.supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_field: field,
    });
  }

  async countEngagements(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('engagements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'archived');

    return count || 0;
  }

  async getMonthlyUsage(userId: string): Promise<{ aiQueries: number; sowGenerated: number }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from(this.tableName)
      .select('ai_queries, sow_generated')
      .eq('user_id', userId)
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    return {
      aiQueries: data?.reduce((sum, row) => sum + (row.ai_queries || 0), 0) || 0,
      sowGenerated: data?.reduce((sum, row) => sum + (row.sow_generated || 0), 0) || 0,
    };
  }
}
```

---

## Background Jobs (Inngest)

> 📋 **STATUS: SETUP ONLY** — `src/jobs/inngest.ts` client exists.
> Actual job functions (generate-sow, sync-usage) are planned for Phase 3.

### Setup ✅ Implemented

```typescript
// src/jobs/inngest.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'consulting-framer',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

### SOW Generation Job 📋 PLANNED

```typescript
// src/jobs/generate-sow.ts
import { inngest } from './inngest';
import { createAdminClient } from '@/lib/supabase/admin';
import { AIService } from '@/services/ai.service';
import { EngagementRepository } from '@/repositories/engagement.repo';
import { DeliverableRepository } from '@/repositories/deliverable.repo';

export const generateSOW = inngest.createFunction(
  { 
    id: 'generate-sow',
    retries: 2,
  },
  { event: 'sow/generate.requested' },
  async ({ event, step }) => {
    const { engagementId, userId } = event.data;
    const supabase = createAdminClient();  // Service role for background job

    // Step 1: Get engagement data
    const engagement = await step.run('fetch-engagement', async () => {
      const repo = new EngagementRepository(supabase);
      return repo.findById(engagementId);
    });

    if (!engagement) {
      throw new Error(`Engagement ${engagementId} not found`);
    }

    // Step 2: Generate SOW content (can take 30-60 seconds)
    const sowContent = await step.run('generate-content', async () => {
      const aiService = new AIService(supabase);
      return aiService.generateSOW(userId, engagement);
    });

    // Step 3: Save deliverable
    const deliverable = await step.run('save-deliverable', async () => {
      const repo = new DeliverableRepository(supabase);
      return repo.create({
        engagementId,
        userId,
        type: 'sow',
        title: `SOW - ${engagement.title}`,
        content: sowContent,
        status: 'draft',
      });
    });

    // Step 4: Notify user (could send email, push notification, etc.)
    await step.run('notify-user', async () => {
      // TODO: Send notification
      console.log(`SOW generated for user ${userId}: ${deliverable.id}`);
    });

    return { deliverableId: deliverable.id };
  }
);
```

### API Route to Trigger Job 📋 PLANNED

```typescript
// src/app/api/ai/generate/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/jobs/inngest';
import { UsageService } from '@/services/usage.service';

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { engagementId } = await req.json();

  // Check usage limit
  const usageService = new UsageService(supabase);
  const canGenerate = await usageService.canPerformAction(user.id, 'generate_sow');

  if (!canGenerate) {
    return NextResponse.json(
      { error: 'SOW generation limit reached', upgrade: true },
      { status: 429 }
    );
  }

  // Trigger background job
  await inngest.send({
    name: 'sow/generate.requested',
    data: {
      engagementId,
      userId: user.id,
    },
  });

  // Return immediately - job runs in background
  return NextResponse.json({
    status: 'processing',
    message: 'SOW generation started. You will be notified when complete.',
  });
}
```

### Inngest API Route 📋 PLANNED

```typescript
// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/jobs/inngest';
import { generateSOW } from '@/jobs/generate-sow';
import { syncUsage } from '@/jobs/sync-usage';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateSOW,
    syncUsage,
  ],
});
```

---

## Timeout & Error Handling

> **STATUS:** Error classes ✅ implemented. Timeout patterns 📋 planned.

### Vercel Config for Long Routes 📋 PLANNED

```typescript
// src/app/api/ai/discovery/route.ts

// Increase timeout for AI routes (Vercel Pro required for > 10s)
export const maxDuration = 30;  // 30 seconds

export async function POST(req: Request) {
  // ... route implementation
}
```

### Error Classes ✅ Implemented

```typescript
// src/lib/errors.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

// Specific error types
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Authentication required');
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('FORBIDDEN', 'Access denied');
  }
}

export class UsageLimitError extends AppError {
  constructor(limit: string) {
    super('USAGE_LIMIT_EXCEEDED', `${limit} limit reached`, { upgrade: true });
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, cause?: unknown) {
    super('AI_SERVICE_ERROR', message, { cause: String(cause) });
  }
}
```

### Error Handler Utility ✅ Implemented

```typescript
// src/lib/api-utils.ts
import { NextResponse } from 'next/server';
import { AppError } from './errors';

export function handleApiError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof AppError) {
    const status = {
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      USAGE_LIMIT_EXCEEDED: 429,
      VALIDATION_ERROR: 400,
    }[error.code] || 500;

    return NextResponse.json(error.toJSON(), { status });
  }

  return NextResponse.json(
    { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// Usage in API route:
export async function POST(req: Request) {
  try {
    // ... route logic
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## API Route Patterns

> 📋 **STATUS: PATTERN EXAMPLES** — Copy these when implementing API routes.
> Currently only `src/app/api/ai/discovery/route.ts` exists (basic version).

### Thin Route with Service 📋 PATTERN

```typescript
// src/app/api/engagements/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EngagementService } from '@/services/engagement.service';
import { handleApiError } from '@/lib/api-utils';
import { createEngagementSchema } from '@/lib/validations';

// GET /api/engagements - List engagements
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new EngagementService(supabase);
    const engagements = await service.list(user.id);

    return NextResponse.json({ engagements });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/engagements - Create engagement
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const input = createEngagementSchema.parse(body);

    const service = new EngagementService(supabase);
    const engagement = await service.create(user.id, input);

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Server only, for background jobs

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Stripe Price IDs
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxx
STRIPE_PRICE_TEAM_YEARLY=price_xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Inngest (background jobs)
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://consultingframer.com
```

---

## Stripe Integration

> 📋 **STATUS: CONFIG ONLY** — `src/lib/stripe/config.ts` exists with tier limits.
> Actual checkout, webhooks, and portal are planned for Phase 2.

### Price Config ✅ Implemented

```typescript
// src/lib/stripe/config.ts

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY!,
  team_monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
  team_yearly: process.env.STRIPE_PRICE_TEAM_YEARLY!,
} as const;

export const TIER_LIMITS = {
  free: {
    engagements: 2,
    ai_queries_per_month: 10,
    sow_generations: 0,
  },
  trial: {
    engagements: 999,
    ai_queries_per_month: 100,
    sow_generations: 5,
  },
  pro: {
    engagements: 999,
    ai_queries_per_month: 500,
    sow_generations: 999,
  },
  team: {
    engagements: 999,
    ai_queries_per_month: 2000,
    sow_generations: 999,
    seats: 5,
  },
} as const;

export function getTierFromPriceId(priceId: string): keyof typeof TIER_LIMITS {
  if (priceId === STRIPE_PRICES.pro_monthly || priceId === STRIPE_PRICES.pro_yearly) {
    return 'pro';
  }
  if (priceId === STRIPE_PRICES.team_monthly || priceId === STRIPE_PRICES.team_yearly) {
    return 'team';
  }
  return 'free';
}
```

### Webhook Handler 📋 PLANNED

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTierFromPriceId } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(supabase, subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutComplete(supabase: any, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);

  // Upsert subscription record
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });

  // Update profile tier
  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
    })
    .eq('id', userId);
}

async function handleSubscriptionChange(supabase: any, subscription: Stripe.Subscription) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  const priceId = subscription.items.data[0].price.id;
  const tier = subscription.status === 'active' ? getTierFromPriceId(priceId) : 'free';

  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: subscription.status,
    })
    .eq('id', sub.user_id);
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (sub) {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'past_due' })
      .eq('id', sub.user_id);
  }
}
```

---

## Database Schema

> ✅ **STATUS: SCHEMA DEFINED** — Full schema in `supabase/schema.sql`.
> Not yet deployed to Supabase. Deploy with `npx supabase db push` in Phase 2.

See `supabase/schema.sql` for complete schema including:
- profiles
- subscriptions
- organizations
- org_members
- engagements
- framework_templates
- discovery_questions
- deliverables
- usage_daily
- ai_interactions

All tables have RLS policies enabled.

---

## Key Constraints

| Constraint | Rationale |
|------------|-----------|
| **Thin routes, fat services** | Testable, reusable business logic |
| **Repository pattern** | Database access abstracted; swap Supabase later if needed |
| **Background jobs for > 10s tasks** | Vercel timeout protection |
| **RLS on all tables** | Multi-tenant security |
| **API keys server-side only** | Never expose to browser |
| **Stripe webhooks = billing truth** | Don't trust client-side payment status |
| **Usage checked before AI calls** | Enforce tier limits |

---

## Scaling Considerations

| Users | Infrastructure | Notes |
|-------|----------------|-------|
| 0-100 | Vercel Hobby + Supabase Free | $0/mo |
| 100-500 | Vercel Pro + Supabase Pro | $45/mo |
| 500-2000 | + Inngest Pro | $95/mo |
| 2000+ | Consider dedicated backend | If complexity demands |

---

## Cost Estimates (per 1000 users)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Vercel Pro | Hosting | $20 |
| Supabase Pro | Database + Auth | $25-75 |
| Anthropic | ~5000 queries × $0.01 | $50-100 |
| Inngest | Background jobs | $25-50 |
| Stripe | 2.9% + $0.30 per txn | ~$300 |
| **Total** | | **~$450-550** |

Revenue at 1000 users (~$40K MRR) → **~98% margin**
