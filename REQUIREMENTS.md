# Consulting Framer — Requirements v1.1

> **Visual engagement builder: AI discovery → frameworks → professional deliverables in minutes.**

**Version:** 1.1  
**Last Updated:** January 2026  
**Target:** 100-1000 paying users  
**Status:** Active Development

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.3 | Jan 2026 | Added FR-211 (Delete individual nodes) — single node deletion from canvas |
| v1.2 | Jan 2026 | Added FR-450 (Framework Intelligence) — professional-grade framework prompts with methodology sources |
| v1.1 | Jan 2026 | Added FR-900 (Billing), FR-1000 (Organizations), NFR-500 (Scale) |
| v1.0 | Jan 2026 | Initial release — 60 FRs, 16 NFRs |

---

## Executive Summary

### The Problem

Consultants waste **7+ hours per engagement** on administrative work:
- 2-3 hours on discovery calls without structured capture
- 2-3 hours manually writing SOWs and proposals
- 1-2 hours formatting and revising documents

### The Solution

**Consulting Framer** combines:
1. **AI Discovery** — Guided questions tailored to engagement type
2. **Visual Canvas** — Drag-drop consulting frameworks
3. **Auto-Generation** — One-click SOW/proposal creation

### Time Savings Target

| Activity | Before | After | Savings |
|----------|--------|-------|---------|
| Discovery | 2-3 hrs | 30 min | 75% |
| SOW creation | 2-3 hrs | 15 min | 90% |
| Total | 7+ hrs | < 1 hr | **85%** |

---

## Business Model

### Subscription Tiers

| Tier | Price | Target | Limits |
|------|-------|--------|--------|
| **Free** | $0 | Trial users | 2 engagements, 10 AI queries/mo |
| **Pro** | $49/mo | Solo consultants | Unlimited engagements, 500 AI queries/mo |
| **Team** | $149/mo | Firms (5 seats) | + Shared templates, team analytics |

### Revenue Targets

| Users | Mix | MRR |
|-------|-----|-----|
| 100 | 60% Pro, 5% Team | $3,700 |
| 500 | 55% Pro, 10% Team | $21,200 |
| 1000 | 50% Pro, 15% Team | $47,000 |

---

## User Personas

### Primary: Solo Consultant ("Sarah")
- 5-10 engagements/year
- Needs professional deliverables
- Price sensitive, values simplicity
- **Tier:** Pro ($49/mo)

### Secondary: Boutique Firm ("Marcus")
- 30-50 engagements/year across team
- Needs consistency and templates
- Values collaboration features
- **Tier:** Team ($149/mo)

---

## Functional Requirements

### FR-100: Authentication & Profiles (Phase 1)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-101 | Email/password signup | User registers with email; verification email sent | P0 |
| FR-102 | OAuth login (Google) | One-click Google sign-in; creates profile | P0 |
| FR-103 | User profile | Name, avatar, company; editable in settings | P0 |
| FR-104 | Password reset | Email link; expires in 1 hour | P0 |
| FR-105 | Session management | JWT tokens; 7-day refresh; logout all devices | P1 |
| FR-106 | Delete account | User can delete; data purged within 30 days | P1 |

### FR-200: Core Canvas (Phase 1)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-201 | Create engagement | Name, client, type; persists to database | P0 |
| FR-202 | Drag-drop frameworks | Add SWOT, Porter, McKinsey to canvas | P0 |
| FR-203 | Inline editing | Click block → edit content; auto-save 2s | P0 |
| FR-204 | Connect blocks | Draw arrows; relationship types | P1 |
| FR-205 | Zoom/pan canvas | 25%-400% zoom; mouse pan; minimap | P0 |
| FR-206 | Undo/redo | Ctrl+Z/Ctrl+Shift+Z; 50-action history | P0 |
| FR-207 | Auto-save | Save every 5 seconds; dirty indicator | P0 |
| FR-208 | Canvas templates | 5+ pre-built templates | P1 |
| FR-209 | Duplicate canvas | Copy engagement with all content | P1 |
| FR-210 | Version history | View/restore previous versions | P2 |
| FR-211 | Delete individual nodes | Select node → delete removes only that node; undo supported | P0 |

### FR-300: Framework Library (Phase 1)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-301 | SWOT Analysis | 4-quadrant; add/edit items inline | P0 |
| FR-302 | Porter's Five Forces | Diamond layout; 5 force sections | P0 |
| FR-303 | McKinsey 7-S | 7 elements; hard/soft grouping | P0 |
| FR-304 | Business Model Canvas | 9 blocks; standard layout | P1 |
| FR-305 | Stakeholder Map | Power/interest matrix | P1 |
| FR-306 | Timeline/Roadmap | Gantt-style; milestones | P1 |
| FR-307 | Scope Definition | In/out of scope lists | P1 |
| FR-308 | Risk Register | Risk, impact, mitigation | P1 |
| FR-309 | RACI Matrix | Roles grid | P2 |
| FR-310 | Custom Note | Free-form text block | P0 |

### FR-400: AI Discovery Copilot (Phase 2)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-401 | Discovery questionnaire | 7-15 questions per engagement type | P0 |
| FR-402 | AI follow-up questions | Claude asks clarifying questions | P0 |
| FR-403 | Progress tracking | % complete; skip/required indicators | P0 |
| FR-404 | Discovery summary | AI generates executive summary | P0 |
| FR-405 | Framework recommendations | AI suggests frameworks based on answers | P0 |
| FR-406 | Auto-populate canvas | AI fills framework blocks from discovery | P1 |
| FR-407 | Question branching | Answers trigger conditional questions | P1 |
| FR-408 | Discovery templates | Different question sets by industry | P1 |
| FR-409 | Export discovery notes | PDF/DOCX of Q&A transcript | P2 |
| FR-410 | Client discovery form | Shareable link for async input | P2 |

### FR-450: Framework Intelligence (Phase 2)

Professional-grade framework analysis that veteran consultants will recognize and trust.

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-451 | Framework-specific prompts | Each framework (SWOT, Porter, McKinsey 7-S, BMC) has dedicated prompt with proper methodology; output matches academic/practitioner standards | P0 |
| FR-452 | Methodology sources | Each framework prompt includes original source attribution (Porter 1979, McKinsey, Humphrey); output includes methodology notes | P0 |
| FR-453 | Industry context | Framework analysis incorporates industry-specific benchmarks and competitive dynamics; prompts request industry evidence | P1 |
| FR-454 | Strategic implications | Each framework output includes actionable "so what" recommendations; not just observations but strategic options | P1 |
| FR-455 | Framework validation | Output validated against expected structure (e.g., SWOT has 4 quadrants, Porter has 5 forces with ratings) | P1 |

**Acceptance Criteria Details:**

**FR-451: Framework-Specific Prompts**
- SWOT: Internal vs External distinction; SO/WO/ST/WT strategic options
- Porter: 5 forces with intensity ratings (High/Medium/Low); industry-specific evidence
- McKinsey 7-S: Hard elements (Strategy, Structure, Systems) vs Soft elements; alignment analysis
- BMC: Value proposition fit; segment-block coherence

**FR-452: Methodology Sources**
- SWOT: Albert Humphrey, Stanford Research Institute (1960s)
- Porter: Michael Porter, "How Competitive Forces Shape Strategy" (HBR, 1979)
- McKinsey 7-S: Tom Peters, Robert Waterman, McKinsey & Company (1980s)
- BMC: Alexander Osterwalder, "Business Model Generation" (2010)

**FR-453: Industry Context**
- Prompt requests specific industry evidence for each insight
- Considers typical competitive intensity by industry vertical
- Flags generic vs industry-specific observations

**FR-454: Strategic Implications**
- Display AI-generated metadata already in enhanced prompts (v2.0.0):
  - Porter: `intensity_ratings` (HIGH/MEDIUM/LOW per force), `strategic_implications`
  - McKinsey: `element_health` (STRONG/MODERATE/WEAK), `alignment_issues`
  - SWOT: `factor_priority`, `tows_strategies` (SO/WO/ST/WT options)
- Add "Strategic Insights" panel to framework nodes showing:
  - Overall assessment summary
  - Top priority actions
  - Key risks/opportunities
- Link strategic implications to SOW generation for context

### FR-500: Deliverable Generation (Phase 3)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-501 | Generate SOW | One-click; includes all canvas data | P0 |
| FR-502 | Generate proposal | Client-facing; professional format | P0 |
| FR-503 | Export PDF | High-quality PDF output | P0 |
| FR-504 | Export DOCX | Editable Word document | P0 |
| FR-505 | Custom branding | Logo, colors in exports | P1 |
| FR-506 | Section regeneration | Regenerate individual sections | P1 |
| FR-507 | Tone selection | Professional/conversational/technical | P1 |
| FR-508 | Placeholder detection | Flag incomplete sections | P0 |
| FR-509 | Preview before export | Full preview with approval | P0 |
| FR-510 | Template library | 5+ SOW/proposal templates | P1 |

### FR-600: AI Verification & Trust (Phase 3)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-601 | Source traceability | Every sentence links to canvas source | P0 |
| FR-602 | Completeness check | Require all fields before generation | P0 |
| FR-603 | Consistency validation | Flag timeline/deliverable mismatches | P1 |
| FR-604 | Confidence scores | 0-100% per generated section | P1 |
| FR-605 | Human approval gate | Explicit approve before export | P0 |
| FR-606 | Generation audit log | Log all AI inputs/outputs | P0 |

### FR-700: Engagement Management (Phase 4)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-701 | Engagement list | Dashboard with all engagements | P0 |
| FR-702 | Status workflow | Draft → Proposed → Active → Complete | P0 |
| FR-703 | Search/filter | By client, status, date, tags | P0 |
| FR-704 | Archive engagements | Hide from list; recoverable | P0 |
| FR-705 | Duplicate engagement | Copy as new draft | P1 |
| FR-706 | Tags/labels | Custom tags for organization | P1 |

### FR-800: Collaboration (Phase 5) — Team Tier Only

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-801 | Invite team members | Email invite; assign role | P0 |
| FR-802 | Role permissions | Owner, Editor, Viewer | P0 |
| FR-803 | Shared templates | Org-wide framework templates | P0 |
| FR-804 | Comments | Comment on any block | P1 |
| FR-805 | Activity feed | Who did what when | P1 |
| FR-806 | Real-time collab | Multiple cursors (future) | P2 |

### FR-900: Billing & Subscriptions (Phase 2)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-901 | Subscription tiers | Free, Pro ($49), Team ($149) | P0 |
| FR-902 | Stripe integration | Checkout, portal, webhooks | P0 |
| FR-903 | Usage limits | Enforce per-tier limits | P0 |
| FR-904 | Upgrade flow | In-app upgrade prompts | P0 |
| FR-905 | Downgrade flow | Handled at period end | P0 |
| FR-906 | Trial period | 14-day Pro trial; no card required | P0 |
| FR-907 | Billing portal | Stripe customer portal link | P0 |
| FR-908 | Usage display | Show current usage vs limits | P0 |
| FR-909 | Overage handling | Soft block with upgrade prompt | P0 |
| FR-910 | Invoices | Access via Stripe portal | P1 |

### FR-1000: Organizations (Phase 5) — Team Tier

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-1001 | Create organization | Name, owner; linked to Team subscription | P0 |
| FR-1002 | Seat management | Add/remove members up to limit | P0 |
| FR-1003 | Member roles | Admin, Member; permissions differ | P0 |
| FR-1004 | Org-wide templates | Shared framework templates | P0 |
| FR-1005 | Usage dashboard | Org usage across all members | P1 |
| FR-1006 | Transfer ownership | Owner can transfer to admin | P1 |
| FR-1007 | Leave organization | Member can leave; data stays | P1 |

---

### FR-1100: Infrastructure & Developer Experience

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-1101 | Logger utility | Consistent prefixes `[Module]`; dev/prod modes; timestamp option | P2 |
| FR-1102 | Error tracking | Client-side error capture; optional Sentry integration | P2 |
| FR-1103 | Feature flags | Simple flags for gradual rollout | P2 |

---

## Non-Functional Requirements

### NFR-100: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-101 | Canvas load | < 2s for 50 nodes |
| NFR-102 | AI response | < 3s discovery, < 10s generation |
| NFR-103 | Page load | < 1.5s LCP |
| NFR-104 | Export generation | < 30s for typical SOW |

### NFR-200: Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-201 | Uptime | 99.9% |
| NFR-202 | Data durability | Auto-save; no data loss |
| NFR-203 | Graceful degradation | Canvas works if AI unavailable |
| NFR-204 | Backups | Daily; 30-day retention |

### NFR-300: Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-301 | Authentication | Supabase Auth; MFA optional |
| NFR-302 | Authorization | RLS on all tables |
| NFR-303 | Encryption | TLS 1.3 transit; AES-256 rest |
| NFR-304 | API keys | Server-side only; never exposed |
| NFR-305 | GDPR | Data export; account deletion |

### NFR-400: AI Quality

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-401 | Output accuracy | > 95% no manual fixes |
| NFR-402 | Hallucination rate | < 2% fabricated content |
| NFR-403 | Human approval | 100% before client-facing |
| NFR-404 | Eval coverage | 90%+ golden test cases |

### NFR-500: Scalability (100-1000 Users)

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-501 | Concurrent users | 100 simultaneous |
| NFR-502 | Database connections | Pool 20-50 |
| NFR-503 | API rate limits | 100 req/min per user |
| NFR-504 | Storage per user | 100MB canvas data |
| NFR-505 | Cost per user | < $0.50/mo infrastructure |

---

## Data Model Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| profiles | User data | id, email, full_name, avatar_url, subscription_tier |
| subscriptions | Billing state | user_id, stripe_customer_id, status, current_period_end |
| organizations | Team accounts | id, name, owner_id, subscription_id |
| org_members | Team membership | org_id, user_id, role |
| engagements | Canvas + discovery | id, user_id, org_id, title, canvas_data, discovery_answers |
| framework_templates | Reusable templates | id, org_id, name, canvas_data |
| usage_daily | Limit tracking | user_id, date, ai_queries, engagements_created |
| ai_interactions | Audit log | id, user_id, engagement_id, prompt, response, tokens |

> **Full schema:** See ARCHITECTURE.md

---

## Phasing Summary

| Phase | Weeks | FRs | Goal | Revenue Gate |
|-------|-------|-----|------|--------------|
| **1. MVP** | 1-4 | FR-100, FR-200, FR-300 | Canvas + 3 frameworks + auth | — |
| **2. Monetize** | 5-8 | FR-400, FR-900 | AI discovery + Stripe billing | ✅ Can charge |
| **3. Deliver** | 9-12 | FR-500, FR-600 | SOW generation + verification | ✅ Full value |
| **4. Manage** | 13-16 | FR-700 | Engagement dashboard | — |
| **5. Scale** | 17-20 | FR-800, FR-1000 | Teams + organizations | ✅ Team tier |

---

## API Surface (Minimum)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/signup | Create account | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/engagements | List user's engagements | User |
| POST | /api/engagements | Create engagement | User |
| GET | /api/engagements/[id] | Get engagement | Owner |
| PATCH | /api/engagements/[id] | Update engagement | Owner |
| DELETE | /api/engagements/[id] | Delete engagement | Owner |
| POST | /api/ai/discovery | AI follow-up question | User |
| POST | /api/ai/recommend | Framework recommendations | User |
| POST | /api/ai/generate | Generate SOW/proposal | User |
| POST | /api/billing/checkout | Create Stripe checkout | User |
| POST | /api/billing/portal | Stripe portal link | User |
| POST | /api/webhooks/stripe | Stripe webhook handler | Stripe |

---

## Success Criteria

### Phase 1 Complete When:
- [ ] User can sign up, log in, log out
- [ ] User can create engagement with canvas
- [ ] User can add SWOT, Porter, McKinsey frameworks
- [ ] Canvas persists to database
- [ ] Works on desktop Chrome/Safari/Firefox

### Phase 2 Complete When:
- [ ] AI discovery questionnaire works
- [ ] AI recommends frameworks
- [ ] Stripe checkout works
- [ ] Usage limits enforced
- [ ] First paying customer

### MVP Success (90 days):
- [ ] 100 registered users
- [ ] 20 paying users
- [ ] $1,000 MRR
- [ ] < 5% churn
