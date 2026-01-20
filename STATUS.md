# STATUS.md — Consulting Framer

Last updated: 2026-01-20

---

## Current Phase: 1 — Core Canvas

**Goal:** Visual engagement builder with framework library  
**Target:** End of February 2026

---

## Now

| Task | FR | Branch | Started | Notes |
|------|-----|--------|---------|-------|
| Project setup | — | main | 01-20 | Initialize Next.js + Supabase + React Flow |

## Next (Priority Order)

| Task | FR | Depends On | Notes |
|------|-----|------------|-------|
| Database schema setup | FR-001 | Project setup | Create Supabase tables per ARCHITECTURE.md |
| Canvas component | FR-002 | Database | React Flow integration with node types |
| Framework node library | FR-003 | Canvas | SWOT, Porter's 5 Forces, McKinsey 7-S |
| Node connections | FR-004 | Framework nodes | Drag-to-connect with relationship labels |
| Auto-save | FR-005 | Canvas | Debounced save to Supabase |
| Canvas zoom/pan | FR-006 | Canvas | Standard navigation controls |
| Undo/redo | FR-007 | Auto-save | Command pattern implementation |
| Export to PNG/PDF | FR-008 | Canvas | Canvas snapshot functionality |
| Framework templates | FR-009 | Framework nodes | Pre-built starter canvases |
| Engagement dashboard | FR-010 | Database | List/search/filter engagements |

## Blocked

| Task | FR | Waiting On | Since | Action |
|------|-----|------------|-------|--------|
| — | — | — | — | — |

## Shipped

| Task | FR | PR | Date |
|------|-----|-----|------|
| Requirements documentation | — | — | 01-20 |
| Architecture documentation | — | — | 01-20 |
| Project planning | — | — | 01-20 |

---

## Phase 1 Progress

| FR | Requirement | Status |
|----|-------------|--------|
| FR-001 | Create new engagement | ⬜ TODO |
| FR-002 | Visual canvas with drag-drop | ⬜ TODO |
| FR-003 | Framework node library | ⬜ TODO |
| FR-004 | Connect nodes with relationships | ⬜ TODO |
| FR-005 | Auto-save canvas state | ⬜ TODO |
| FR-006 | Canvas zoom/pan/navigation | ⬜ TODO |
| FR-007 | Undo/redo operations | ⬜ TODO |
| FR-008 | Export canvas to PNG/PDF | ⬜ TODO |
| FR-009 | Framework templates | ⬜ TODO |
| FR-010 | Engagement list/dashboard | ⬜ TODO |

**Remaining:** 10 of 10 FRs

---

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 01-20 | **Next.js 14 + App Router** | Best DX, server components for performance |
| 01-20 | **React Flow for canvas** | Most mature, best docs, MIT license |
| 01-20 | **Supabase for backend** | Auth + DB + Storage in one; fast setup |
| 01-20 | **Claude API for AI features** | Best reasoning for consulting frameworks |
| 01-20 | **5-phase approach** | Ship working canvas first, add AI second |
| 01-20 | **PostgreSQL JSON columns** | Flexible canvas_data storage; no schema migrations for node changes |

---

## Risks / Unknowns

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| React Flow learning curve | Delays Phase 1 | Prototype early; use examples | ⬜ TODO |
| Canvas performance with many nodes | Poor UX | Virtualization; test with 100+ nodes | ⬜ TODO |
| AI response latency | User frustration | Streaming responses; optimistic UI | ⬜ Phase 2 |
| Claude API rate limits | Feature blocked | Caching; request batching | ⬜ Phase 2 |
| SOW generation quality | Low trust | Extensive EVALS; human review step | ⬜ Phase 3 |

---

## Kill Criteria

| Condition | Deadline | Action |
|-----------|----------|--------|
| Canvas unusable after 2 weeks dev | 02-07 | Switch to Excalidraw or simpler approach |
| No user interest after demo | 03-15 | Pivot to simpler tool or different market |
| AI features don't save time | 04-01 | Focus on manual workflow, reduce AI scope |

---

## Time Savings Targets (Key Metrics)

| Activity | Current (Manual) | Target (With Tool) | Savings |
|----------|------------------|-------------------|---------|
| Discovery intake | 2-4 hours | 30-45 min | **75%** |
| Framework selection | 30-60 min | 5-10 min | **80%** |
| SOW/Proposal draft | 4-8 hours | 1-2 hours | **75%** |
| Scope visualization | 2-3 hours | 30 min | **80%** |
| **Total engagement framing** | **10-18 hours** | **2.5-4 hours** | **75%** |

> These targets will be validated in EVALS.md test scenarios.

---

## Upcoming Phases (Reference)

| Phase | FRs | Goal | Target |
|-------|-----|------|--------|
| 1. Core Canvas | FR-001 to FR-010 | Visual engagement builder | Feb 2026 |
| 2. AI Discovery | FR-011 to FR-020 | AI-guided intake & frameworks | Mar 2026 |
| 3. Deliverables | FR-021 to FR-030 | SOW/Proposal generation | Apr 2026 |
| 4. Tracking | FR-031 to FR-040 | Milestones, status, billing | May 2026 |
| 5. Collaboration | FR-041 to FR-050 | Multi-user, templates marketplace | Jun 2026 |

---

## Quality Checkpoints

Before shipping each phase:

- [ ] All FRs have acceptance criteria met
- [ ] EVALS pass rate ≥ 95%
- [ ] No critical/high severity bugs
- [ ] Performance targets met (p95 < 500ms for canvas ops)
- [ ] User testing feedback incorporated

---

## Quick Links

| Doc | Purpose |
|-----|---------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | What to build |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How to build |
| [CLAUDE.md](./CLAUDE.md) | AI context & rules |
| [EVALS.md](./EVALS.md) | Test scenarios |
| [README.md](./README.md) | Project overview |

---

## Daily Workflow

```
1. Check STATUS.md → find task in "Next"
2. Move to "Now" → create branch
3. Look up FR in REQUIREMENTS.md → acceptance criteria
4. Check ARCHITECTURE.md → relevant schema/component
5. Implement → run tests
6. Update STATUS.md → move to "Shipped"
7. Commit with (FR-NNN) reference
```
