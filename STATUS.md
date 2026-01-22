# STATUS.md — Consulting Framer

Last updated: 2026-01-22

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
- ✅ 3 framework nodes: SWOT, Porter, McKinsey
- ✅ Discovery panel UI (mock questions, no AI)
- ✅ Framework panel (drag-drop to canvas)
- ✅ Note block
- ✅ **Database persistence** (engagements save to Supabase)
- ✅ **Auto-save** (canvas saves every 5 seconds)
- ✅ **Engagement list** (loads from database on login)

**Not Working Yet:**
- ❌ No real AI (discovery uses hardcoded questions)
- ❌ No Stripe/billing (tier limits not enforced)
- ❌ No SOW generation

**To Demo:** Run `npm run dev` → visit `localhost:3000/app`

---

## Current Phase: 1 — MVP Foundation

**Goal:** Canvas + 3 frameworks + auth + persistence
**Target:** End of January 2026

---

## Now

| Task | FR | Branch | Started | Notes |
|------|-----|--------|---------|-------|
| — | — | — | — | Ready for next task |

## Next (Priority Order)

| Task | FR | Depends On | Notes |
|------|-----|------------|-------|
| User profile page | FR-103 | ✅ Auth | Settings + account |
| Password reset | FR-104 | ✅ Auth | Email link flow |
| Status workflow | FR-702 | ✅ FR-701 | Draft → Active → Complete |
| Search/filter | FR-703 | ✅ FR-701 | Filter by client, status |

## Blocked

| Task | FR | Waiting On | Since | Action |
|------|-----|------------|-------|--------|
| — | — | — | — | — |

## Shipped (This Week)

| Task | FR | PR | Date |
|------|-----|-----|------|
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

### Auth (FR-100)
- [x] FR-101: Email/password signup
- [x] FR-102: Google OAuth
- [ ] FR-103: User profile
- [ ] FR-104: Password reset

### Canvas (FR-200)
- [x] FR-201: Create engagement ✅ **With DB persistence**
- [x] FR-202: Drag-drop frameworks
- [x] FR-203: Inline editing
- [ ] FR-204: Connect blocks
- [x] FR-205: Zoom/pan
- [x] FR-206: Undo/redo
- [x] FR-207: Auto-save to database ✅

### Frameworks (FR-300)
- [x] FR-301: SWOT Analysis
- [x] FR-302: Porter's Five Forces
- [x] FR-303: McKinsey 7-S
- [x] FR-310: Note block

### Engagement Management (FR-700)
- [x] FR-701: Engagement list ✅
- [ ] FR-702: Status workflow
- [ ] FR-703: Search/filter

---

## Phase 2 Checklist

### Billing (FR-900)
- [ ] FR-901: Subscription tiers defined
- [ ] FR-902: Stripe Checkout integration
- [ ] FR-903: Usage limits enforcement
- [ ] FR-904: Upgrade flow
- [ ] FR-906: 14-day trial
- [ ] FR-907: Billing portal

### AI Discovery (FR-400)
- [x] FR-401: Discovery questionnaire *(mock)*
- [ ] FR-402: Claude follow-up questions
- [x] FR-403: Progress tracking
- [ ] FR-405: Framework recommendations

---

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
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
