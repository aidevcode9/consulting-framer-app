# CHECKPOINT.md — Session Progress

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
