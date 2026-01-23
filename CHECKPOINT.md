# CHECKPOINT.md — Session Progress

---

## [2026-01-22] FR-404, FR-406: Discovery Summary + Canvas Auto-populate

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/app/api/ai/summary/route.ts (new) - POST /api/ai/summary endpoint
- src/app/api/ai/populate-canvas/route.ts (new) - POST /api/ai/populate-canvas endpoint

**Files modified:**
- src/lib/ai/prompts.ts - Added CANVAS_POPULATE_PROMPT and buildCanvasPopulatePrompt
- src/services/ai.service.ts - Added generateCanvasContent method

**What was implemented:**

### FR-404: Discovery Summary
- POST /api/ai/summary endpoint
- Generates executive summary from discovery answers
- Uses existing DISCOVERY_SUMMARY_PROMPT

### FR-406: Canvas Auto-populate
- POST /api/ai/populate-canvas endpoint
- Generates structured content for SWOT, Porter, McKinsey 7S frameworks
- Returns sections with 3-5 items per section
- Mock responses when no API key configured

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it

**Commit:** 7053a75

**Notes:**
- All Phase 2 AI Discovery P0s are now complete
- FR-406 is P1 but was quick to implement alongside FR-404

---

## [2026-01-22] Security: Prompt Injection Defense

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/ai/sanitize.ts (new) - Input sanitization for AI prompts

**Files modified:**
- src/lib/ai/prompts.ts - Apply sanitization to all user inputs
- src/services/ai.service.ts - Add injection detection logging

**What was implemented:**
- Pattern detection for common injection attempts (role hijacking, instruction overrides, system prompt extraction)
- Input length limits: short (200), medium (1000), long (5000) chars
- Neutralization wraps suspicious patterns as `[user said: ...]`
- Delimiter escaping for code blocks and special sequences
- Warning logs when potential injection attempts detected

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it (prompt injection now defended)

**Commit:** e37fbd9

---

## [2026-01-22] FR-402, FR-405: AI Discovery + Framework Recommendations

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/ai/client.ts (new) - AI client with Anthropic/Gemini support, timeout, telemetry
- src/lib/ai/prompts.ts (new) - System prompts for discovery, recommendations, summary
- src/services/ai.service.ts (new) - AI service with usage tracking
- src/app/api/ai/recommend-frameworks/route.ts (new) - POST /api/ai/recommend-frameworks

**Files modified:**
- src/app/api/ai/discovery/route.ts - Refactored to use AIService with auth + validation
- .env - Added AI_PROVIDER, GEMINI_API_KEY config options
- STATUS.md - Updated checklist

**What was implemented:**

### FR-402: AI Follow-up Questions
- AI client abstraction supporting Anthropic (default) and Gemini 2.0 Flash
- 30s timeout with graceful error handling
- Request ID tracking for telemetry
- Discovery prompts for generating follow-up questions
- Usage limit enforcement before each AI call
- Token usage tracked in ai_interactions table

### FR-405: Framework Recommendations
- POST /api/ai/recommend-frameworks endpoint
- Prompts for analyzing discovery and suggesting frameworks
- Returns confidence scores, reasoning, and focus areas
- Mock response when no API key configured

**AI Providers:**
- Default: `AI_PROVIDER=anthropic` (Claude Sonnet)
- Alternative: `AI_PROVIDER=gemini` (Gemini 2.0 Flash)

**Telemetry logged:**
- Request ID, provider, model
- Input/output token counts
- Latency in milliseconds
- Prompt length, response length

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- Timeout handling: ✅
- Usage limits checked: ✅
- API keys server-side: ✅
- Token tracking: ✅

**Commit:** b30d958

---

## [2026-01-22] FR-1101, FR-903: Logger Utility + Usage Limits

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/logger.ts (new) - Logger utility with module prefixes
- src/repositories/usage.repo.ts (new) - Usage counts from database
- src/services/usage.service.ts (new) - Usage limit checks and tracking
- src/app/api/usage/route.ts (new) - GET /api/usage endpoint
- supabase/migrations/001_add_subscription_fields.sql (new) - Adds subscription fields to profiles

**Files modified:**
- src/lib/errors.ts (updated UsageLimitError signature)
- src/lib/api-utils.ts (handle UsageLimitError with 429 status)
- src/services/engagement.service.ts (added usage limit check on create)
- STATUS.md (moved FR-1101, FR-903 to Shipped)
- REQUIREMENTS.md (added FR-1100 Infrastructure section)

**What was implemented:**

### FR-1101: Logger Utility
- `createLogger(module)` returns logger with debug, info, warn, error methods
- Consistent prefixes like `[Auth]`, `[Billing]`, `[Canvas]`
- Dev mode: all levels; Prod mode: warn and error only
- Pre-configured loggers exported: `loggers.auth`, `loggers.billing`, etc.

### FR-903: Usage Limits Enforcement
- UsageRepository: Counts engagements, AI queries (this month), SOW generations
- UsageService.canPerformAction(): Checks limits before allowing actions
- UsageService.getUsageInfo(): Returns tier, counts, limits, remaining, percentUsed
- GET /api/usage: Returns usage summary for authenticated user
- EngagementService.create() now checks usage limit before creating
- UsageLimitError returns 429 with upgrade flag

**Tier Limits:**
| Tier | Engagements | AI Queries/Mo | SOW Generations |
|------|-------------|---------------|-----------------|
| Free | 2 | 10 | 0 |
| Trial | 999 | 100 | 5 |
| Pro | 999 | 500 | 999 |
| Team | 999 | 2000 | 999 |

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Commit:** 08b57ce

**Notes:**
- Database migration adds subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id to profiles
- Usage checks integrated into engagement creation
- Ready for AI service integration (FR-402) to check ai_query limits

---

## [2026-01-22] Phase 1 Completion: FR-103, FR-104, FR-702, FR-703, FR-704

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/repositories/profile.repo.ts (new)
- src/services/profile.service.ts (new)
- src/app/api/profile/route.ts (new)
- src/app/app/settings/page.tsx (new)
- src/app/(auth)/reset-password/page.tsx (new)
- src/app/(auth)/reset-password/confirm/page.tsx (new)
- src/lib/validations/profile.ts (new)

**Files modified:**
- src/app/(auth)/actions.ts (added requestPasswordReset, updatePassword)
- src/app/(auth)/login/page.tsx (fixed forgot password link)
- src/app/auth/callback/route.ts (handle recovery type)
- src/app/app/page.tsx (status selector, search/filter, archive)

**What was implemented:**

### FR-103: User Profile
- Profile repository + service (CRUD for profiles table)
- GET/PATCH /api/profile endpoints
- Settings page at /app/settings
- Edit full name, company, role

### FR-104: Password Reset
- Request reset via email (Supabase resetPasswordForEmail)
- Reset confirmation page
- Password update after clicking email link
- Redirect to app after success

### FR-702: Status Workflow
- Clickable status dropdown in header
- All 6 statuses: discovery, framing, scoping, active, completed, on_hold
- Real-time update via PATCH API

### FR-703: Search/Filter
- Search by title or client name
- Filter chips: All, Active, Discovery, Completed
- Count shown in header
- Client-side filtering for instant feedback

### FR-704: Archive Engagements
- "on_hold" status used as archive
- Archive button on hover (per engagement)
- "Show Archived" toggle with count
- Restore button for archived items

**Skeptic Reviews:** All ✅ Ship it

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Notes:**
- Phase 1 MVP is now complete!
- All auth group (FR-100) P0s done: FR-101, FR-102, FR-103, FR-104
- All engagement management P0s done: FR-701, FR-702, FR-703, FR-704

---

## [2026-01-22] FR-701: Input Validation Fix

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/validations/engagement.ts (new)

**Files modified:**
- src/app/api/engagements/route.ts (added Zod validation)
- src/app/api/engagements/[id]/route.ts (added Zod validation)
- src/app/api/engagements/[id]/canvas/route.ts (added Zod validation)

**What was implemented:**
1. **Zod validation schemas:**
   - `uuidSchema` - UUID format validation for route params
   - `createEngagementSchema` - title, client_name required, optional fields
   - `updateEngagementSchema` - all fields optional with constraints
   - `canvasDataSchema` - validates nodes, edges, viewport structure
   - `saveCanvasSchema` - wraps canvas_data for PATCH endpoint
2. **validateInput helper** - Generic function that throws ValidationError on invalid input
3. **Applied validation to all API routes** - UUID params and request bodies

**Skeptic Review:** ✅ Ship it
- All user inputs validated before processing
- UUID params validated to prevent injection
- Proper error propagation through service → API → client

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Notes:**
- Fixed type mismatch: Zod schemas now use `.optional()` (not `.nullable().optional()`) to match existing TypeScript types
- ValidationError maps to 400 status via handleApiError

---

## [2026-01-22] FR-201, FR-207, FR-701: Database Persistence

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/repositories/engagement.repo.ts (new)
- src/services/engagement.service.ts (new)
- src/app/api/engagements/route.ts (new)
- src/app/api/engagements/[id]/route.ts (new)
- src/app/api/engagements/[id]/canvas/route.ts (new)

**Files modified:**
- src/app/app/page.tsx (connected to real API, added sign out, auto-save)

**What was implemented:**
1. **Sign out button** - Added to user menu dropdown in app header
2. **EngagementRepository** - Database access layer for engagements table
3. **EngagementService** - Business logic layer with ownership checks
4. **API Routes:**
   - GET /api/engagements - List user's engagements
   - POST /api/engagements - Create new engagement
   - GET /api/engagements/[id] - Get single engagement
   - PATCH /api/engagements/[id] - Update engagement
   - DELETE /api/engagements/[id] - Delete engagement
   - PATCH /api/engagements/[id]/canvas - Save canvas data (auto-save)
5. **App page updates:**
   - Fetch engagements from API on mount
   - Create engagements via API
   - Load canvas data when selecting engagement
   - Auto-save canvas every 5 seconds (debounced)
   - Saving indicator in header

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Notes:**
- Supabase was configured during this session (env vars, schema.sql, Google OAuth)
- RLS policies are enforced via database (schema.sql already deployed)
- Auto-save uses 5-second debounce to avoid excessive API calls

---

## [2026-01-21] FR-101, FR-102: Supabase Auth

**Status:** ✅ Complete
**Branch:** feat/auth-email-google
**Commit:** 5663055

**Files created:**
- src/lib/errors.ts
- src/lib/api-utils.ts
- src/app/(auth)/layout.tsx
- src/app/(auth)/actions.ts
- src/app/(auth)/login/page.tsx
- src/app/(auth)/signup/page.tsx
- src/app/auth/callback/route.ts
- src/middleware.ts
- .eslintrc.json

**Files modified:**
- src/lib/store.ts (added useAuthStore)
- src/app/page.tsx (updated CTAs)
- Multiple canvas components (type fixes)
- src/types/index.ts (React Flow compatibility)

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

---
