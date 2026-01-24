# STATUS.md — Consulting Framer

Last updated: 2026-01-23 (evening)

---

## ⚡ What Works Right Now

**Working (can demo):**
- ✅ Landing page at `/`
- ✅ Login/signup at `/login` and `/signup`
- ✅ Google OAuth integration
- ✅ Protected routes (redirects to login)
- ✅ Sign out functionality
- ✅ Workspace UI at `/app`
- ✅ Canvas with drag-drop, zoom, pan, undo/redo
- ✅ 4 framework nodes: SWOT, Porter, McKinsey, BMC
- ✅ **Discovery panel with branching** (FR-407)
- ✅ **Industry templates** (FR-408: Tech, Healthcare, Retail, Finance, Manufacturing)
- ✅ Framework panel (drag-drop to canvas)
- ✅ **AI follow-up questions** (FR-402, needs API key)
- ✅ **Framework recommendations** (FR-405, needs API key)
- ✅ **Discovery summary** (FR-404, needs API key)
- ✅ **Canvas auto-populate** (FR-406, needs API key)
- ✅ **Framework-specific prompts** (FR-451: Porter, McKinsey, SWOT with methodology v2.0.0)
- ✅ **Usage limits enforcement** (tier-based limits)
- ✅ **Prompt injection defense** (input sanitization)
- ✅ Note block
- ✅ **Database persistence** (engagements save to Supabase)
- ✅ **Auto-save** (canvas saves every 5 seconds)
- ✅ **Engagement list** (loads from database on login)
- ✅ **User profile/settings** at `/app/settings`
- ✅ **Password reset** via email
- ✅ **Status workflow** (change status from header)
- ✅ **Search/filter** (by title, client, status)
- ✅ **Archive engagements** (hide/restore)
- ✅ **SOW generation** (FR-501, needs API key)
- ✅ **SOW preview** (FR-509, with placeholder detection)
- ✅ **Export PDF** (FR-503, from SOW preview)
- ✅ **Export DOCX** (FR-504, from SOW preview)
- ✅ **Generate Proposal** (FR-502, needs API key)
- ✅ **Proposal export** (PDF/DOCX)

**Not Working Yet:**
- ⚠️ AI requires API key (set `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`)
- ⚠️ Billing stub only (no real Stripe yet - `STRIPE_STUB_MODE=true`)

**To Demo:** Run `npm run dev` → visit `localhost:3000/app`

---

## Current Phase: 3 (Deliverables) ✅ COMPLETE

**Phase 1 Goal:** Canvas + 3 frameworks + auth + persistence ✅ **COMPLETE**
**Phase 2 Goal:** Stripe billing + AI discovery ✅ **COMPLETE**
**Phase 3 Goal:** SOW generation + exports ✅ **COMPLETE**

---

## Now

| Task | FR | Branch | Started | Notes |
|------|-----|--------|---------|-------|
| — | — | — | — | Session complete. PR pending review. |

## Next (Priority Order)

| Task | FR | Depends On | Notes |
|------|-----|------------|-------|
| **BMC prompt enhancement** | FR-451 | — | Value proposition fit, 9-block methodology |
| **Industry context** | FR-453 | FR-451 | Industry-specific evidence |
| **Strategic implications** | FR-454 | FR-451 | Display intensity_ratings, element_health, tows_strategies already in AI response |
| **Real Stripe** | FR-902 | End of project | See "Deferred" section |

## Deferred (End of Project)

| Task | FR | Notes |
|------|-----|-------|
| Real Stripe integration | FR-902 | Webhook as source of truth, signature verification, `subscriptions` table, remove direct tier updates |

## Blocked

| Task | FR | Waiting On | Since | Action |
|------|-----|------------|-------|--------|
| — | — | — | — | — |

## Shipped (This Week)

| Task | FR | Commit | Date |
|------|-----|--------|------|
| Porter prompt enhancement | FR-451, FR-452 | 8f7823c | 01-23 |
| McKinsey 7-S prompt enhancement | FR-451, FR-452 | 8f7823c | 01-23 |
| SWOT prompt enhancement | FR-451, FR-452 | 8f7823c | 01-23 |
| Prompt versioning system | FR-451 | 8f7823c | 01-23 |
| Business Model Canvas node | FR-304 | — | 01-23 |
| Framework content caching | — | — | 01-23 |
| PROMO daily AI limit (env) | — | — | 01-23 |
| Generate Proposal | FR-502 | — | 01-22 |
| Export PDF | FR-503 | — | 01-22 |
| Export DOCX | FR-504 | — | 01-22 |
| SOW preview | FR-509 | — | 01-22 |
| Placeholder detection | FR-508 | — | 01-22 |
| SOW generation | FR-501 | — | 01-22 |
| Question branching | FR-407 | — | 01-22 |
| Discovery templates | FR-408 | — | 01-22 |
| Discovery summary | FR-404 | 7053a75 | 01-22 |
| Canvas auto-populate | FR-406 | 7053a75 | 01-22 |
| Prompt injection defense | Security | e37fbd9 | 01-22 |
| AI follow-up questions | FR-402 | b30d958 | 01-22 |
| Framework recommendations | FR-405 | b30d958 | 01-22 |
| Usage limits enforcement | FR-903 | — | 01-22 |
| Logger utility | FR-1101 | — | 01-22 |
| Billing stub (mock Stripe) | FR-901 | — | 01-22 |
| Archive engagements | FR-704 | — | 01-22 |
| Search/filter | FR-703 | — | 01-22 |
| Status workflow | FR-702 | — | 01-22 |
| Password reset | FR-104 | — | 01-22 |
| User profile page | FR-103 | — | 01-22 |
| Input validation | FR-701 | — | 01-22 |
| Database persistence | FR-201, FR-207 | — | 01-22 |
| Engagement list | FR-701 | — | 01-22 |
| Sign out button | FR-101 | — | 01-22 |
| Auto-save (5 sec) | FR-207 | — | 01-22 |
| Supabase Auth (email + Google) | FR-101, FR-102 | #1 | 01-21 |
| Protected routes middleware | — | #1 | 01-21 |
| Error handling foundation | — | #1 | 01-21 |
| Landing page | — | — | 01-20 |
| Canvas with React Flow | FR-202, FR-205, FR-206 | — | 01-20 |
| SWOT framework node | FR-301 | — | 01-20 |
| Porter's Five Forces node | FR-302 | — | 01-20 |
| McKinsey 7-S node | FR-303 | — | 01-20 |
| Discovery panel (mock) | FR-401, FR-403 | — | 01-20 |
| Framework panel (drag-drop) | FR-202 | — | 01-20 |
| Canvas toolbar | FR-206 | — | 01-20 |
| Zustand state management | — | — | 01-20 |
| Project documentation | — | — | 01-20 |

---

## Phase Overview

| Phase | Weeks | Goal | Revenue Gate |
|-------|-------|------|--------------|
| **1. MVP** | 1-2 | Canvas + auth + save | — |
| **2. Billing** | 3-4 | Stripe + usage limits | ✅ Can charge |
| **3. AI Discovery** | 5-6 | Real Claude integration | ✅ Core value |
| **4. Deliverables** | 7-8 | SOW generation | ✅ Full value |
| **5. Polish** | 9-10 | More frameworks, UX | — |

---

## Phase 1 Checklist

### Auth (FR-100) ✅ Complete
- [x] FR-101: Email/password signup
- [x] FR-102: Google OAuth
- [x] FR-103: User profile ✅
- [x] FR-104: Password reset ✅

### Canvas (FR-200)
- [x] FR-201: Create engagement ✅ **With DB persistence**
- [x] FR-202: Drag-drop frameworks
- [x] FR-203: Inline editing
- [ ] FR-204: Connect blocks (P1, deferred)
- [x] FR-205: Zoom/pan
- [x] FR-206: Undo/redo
- [x] FR-207: Auto-save to database ✅

### Frameworks (FR-300) ✅ Complete
- [x] FR-301: SWOT Analysis
- [x] FR-302: Porter's Five Forces
- [x] FR-303: McKinsey 7-S
- [x] FR-304: Business Model Canvas ✅
- [x] FR-310: Note block

### Engagement Management (FR-700) ✅ Complete
- [x] FR-701: Engagement list ✅
- [x] FR-702: Status workflow ✅
- [x] FR-703: Search/filter ✅
- [x] FR-704: Archive engagements ✅

---

## Phase 2 Checklist

### Billing (FR-900)
- [x] FR-901: Subscription tiers defined ✅ **Stub mode**
- [~] FR-902: Stripe Checkout integration ⚠️ **Stub only; real Stripe deferred**
- [x] FR-903: Usage limits enforcement ✅
- [x] FR-904: Upgrade flow ✅ **Stub mode**
- [x] FR-906: 14-day trial ✅ **Stub mode**
- [x] FR-907: Billing portal ✅ **Stub mode**

### AI Discovery (FR-400) ✅ All P0s + P1s Complete
- [x] FR-401: Discovery questionnaire *(mock)*
- [x] FR-402: Claude follow-up questions ✅
- [x] FR-403: Progress tracking
- [x] FR-404: Discovery summary ✅
- [x] FR-405: Framework recommendations ✅
- [x] FR-406: Auto-populate canvas ✅
- [x] FR-407: Question branching ✅ (P1)
- [x] FR-408: Discovery templates ✅ (P1)

---

## Phase 3 Checklist ✅ COMPLETE

### Deliverables (FR-500)
- [x] FR-501: Generate SOW ✅
- [x] FR-502: Generate proposal ✅
- [x] FR-503: Export PDF ✅
- [x] FR-504: Export DOCX ✅
- [x] FR-508: Placeholder detection ✅
- [x] FR-509: Preview before export ✅

---

## Framework Intelligence Checklist (FR-450)

### Framework-Specific Prompts (FR-451) ✅ Partially Complete
- [x] Porter's Five Forces — 5 forces with intensity ratings ✅
- [x] McKinsey 7-S — Hard vs Soft elements, alignment analysis ✅
- [x] SWOT Analysis — TOWS matrix, strategic options ✅
- [ ] Business Model Canvas — Value proposition fit (P1)

### Methodology & Sources (FR-452) ✅ Complete
- [x] Add source citations to prompts (Porter 1979, McKinsey 1980, TOWS 1982) ✅
- [x] Methodology notes in system prompts ✅
- [x] Prompt versioning with changelog ✅

### Industry Context (FR-453)
- [ ] Industry-specific evidence requirements
- [ ] Competitive intensity benchmarks by vertical

### Strategic Implications (FR-454)
- [ ] "So what" recommendations in output
- [ ] Actionable strategic options

---

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 01-23 | Prompt versioning with metadata | Track prompt versions (semver), changelog, last updated; logged in AI usage tracking |
| 01-23 | Framework-specific prompts in /frameworks folder | Separate files per framework with methodology sources; fallback to generic prompt for unsupported types |
| 01-22 | Stripe stub mode for development | Build billing UI without real credentials; defer real Stripe to end |
| 01-22 | Thin routes, fat services pattern | Matches ARCHITECTURE.md; testable |
| 01-22 | 5-second auto-save debounce | Balance between data safety and API load |
| 01-21 | Server-side auth with @supabase/ssr | Secure cookies; works with SSR/RSC |
| 01-21 | Server Actions for auth forms | Simpler than API routes; type-safe |
| 01-20 | Next.js + Supabase + Stripe stack | Fastest to market; scales to 1000 users |
| 01-20 | Three tiers: Free/Pro/Team | Covers solo consultants + small firms |
| 01-20 | 14-day trial, no card required | Reduce friction; convert with value |
| 01-20 | Start with 3 frameworks | SWOT, Porter, McKinsey most requested |
| 01-20 | Defer real-time collab | Adds complexity; do after PMF |

---

## Risks / Unknowns

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Stripe webhook reliability | Billing state mismatch | Idempotent handlers + reconciliation job | ⬜ TODO |
| Claude API rate limits | User experience | Implement retry + queue | ⬜ TODO |
| Canvas performance at scale | Slow with 50+ nodes | Virtualization if needed | ⬜ TODO |
| SOW quality consistency | User trust | Extensive evals + human review | ⬜ TODO |

---

## Kill Criteria

| Condition | Deadline | Action |
|-----------|----------|--------|
| < 50 signups after launch | 30 days post-launch | Pivot positioning or market |
| < 5 paying users | 45 days post-launch | Re-evaluate pricing/value prop |
| > 30% churn in month 2 | 60 days post-launch | User research; fix retention |

---

## Metrics to Track (Post-Launch)

| Metric | Target | Current |
|--------|--------|---------|
| Signups | 100 in 30 days | — |
| Activation (create 1 engagement) | 60% | — |
| Trial → Paid conversion | 20% | — |
| MRR | $1,000 | — |
| Churn | < 10% monthly | — |

---

## Archive

<details>
<summary>Pre-launch (Jan 2026)</summary>

- Initial project setup
- Documentation structure
- MVP codebase created

</details>
