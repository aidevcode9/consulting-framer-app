# Consulting Framer — Requirements v1.0

> **The visual engagement builder that turns discovery conversations into professional deliverables in minutes, not days.**

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Active Development

---

## Executive Summary

### The Problem

Consultants waste **7+ hours per engagement** on administrative work:
- 2-3 hours on discovery calls without structured capture
- 2-3 hours manually writing SOWs and proposals
- 1-2 hours formatting and revising documents
- Ongoing scope creep from poorly defined boundaries

**Result:** 40% of consulting engagements experience scope creep, and 64% of project failures trace back to poorly defined scope.

### The Solution

**Consulting Framer** is a visual engagement builder that:
1. **Guides discovery** with AI-powered questions tailored to engagement type
2. **Visualizes scope** on an interactive canvas using proven consulting frameworks
3. **Generates deliverables** (SOW, proposals, contracts) with one click
4. **Tracks engagements** from proposal to completion

### Time Savings (Validated Targets)

| Activity | Before | After | Savings |
|----------|--------|-------|---------|
| Discovery capture | 2-3 hrs | 30 min | **75%** |
| SOW creation | 2-3 hrs | 15 min | **90%** |
| Proposal formatting | 1-2 hrs | 5 min | **95%** |
| Scope change tracking | Manual | Automatic | **100%** |
| **Total per engagement** | **7+ hrs** | **< 1 hr** | **85%+** |

### Trust & Accuracy Guarantees

- ✅ **Framework-validated** — Built on proven consulting methodologies (McKinsey 7-S, SWOT, etc.)
- ✅ **AI-verified outputs** — Every generated document checked against canvas data
- ✅ **Version-controlled** — Full audit trail of all changes
- ✅ **Human-in-the-loop** — AI suggests, consultant approves
- ✅ **Test coverage** — 95%+ automated test coverage on all AI outputs

---

## Product Goals

### Primary Goals

1. **Reduce engagement setup time by 85%** — From 7+ hours to under 1 hour
2. **Eliminate scope creep** — Clear visual boundaries with change tracking
3. **Increase proposal win rates** — Professional, consistent deliverables
4. **Build institutional knowledge** — Reusable templates and frameworks

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first SOW | < 30 minutes | Analytics |
| Proposal completion rate | > 90% | Funnel tracking |
| User-reported time savings | > 80% | Survey |
| AI suggestion acceptance rate | > 70% | Usage analytics |
| Document accuracy (no manual fixes) | > 95% | User feedback |

### Non-Goals (v1)

- Full project management (use Monday, Asana, etc.)
- Time tracking and invoicing (use Harvest, FreshBooks, etc.)
- CRM functionality (use HubSpot, Pipedrive, etc.)
- Legal contract review (consult attorney)

---

## User Personas

### Primary: Independent Consultant

**"Sarah" — Strategy Consultant, Solo Practice**
- 5-10 client engagements per year
- Spends 20% of time on admin instead of billable work
- Needs professional deliverables to compete with big firms
- Values speed and simplicity over features

### Secondary: Boutique Consulting Firm

**"Marcus" — Partner at 10-person firm**
- 30-50 engagements per year across team
- Needs consistency across consultants
- Wants to build reusable IP and templates
- Values collaboration and oversight

---

## Functional Requirements

### FR-100: Core Canvas (Phase 1)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-101 | Create new engagement canvas | User can create canvas with name, client, type; persists across sessions | P0 |
| FR-102 | Add framework blocks to canvas | Drag-drop framework components; blocks snap to grid | P0 |
| FR-103 | Edit block content inline | Click any block and edit directly; auto-save within 2s | P0 |
| FR-104 | Connect blocks with relationships | Draw arrows between blocks; types: depends on, informs, delivers to | P0 |
| FR-105 | Zoom and pan canvas | Zoom 25%-400%; pan with mouse drag; minimap shows full canvas | P0 |
| FR-106 | Undo/redo all actions | Ctrl+Z undoes; Ctrl+Shift+Z redoes; 50-action history | P0 |
| FR-107 | Auto-save with conflict resolution | Saves every 5 seconds; conflict prompts merge or overwrite | P0 |
| FR-108 | Canvas templates library | 10+ pre-built templates (strategy, implementation, etc.) | P1 |
| FR-109 | Duplicate and fork canvases | Duplicate own canvas; fork creates linked copy | P1 |
| FR-110 | Canvas version history | View/restore any previous version; versions auto-created | P1 |

### FR-200: Framework Library (Phase 1)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-201 | SWOT Analysis block | 4-quadrant visual; AI suggests items; export standalone | P0 |
| FR-202 | Stakeholder Map block | Power/interest matrix; add/remove stakeholders inline | P0 |
| FR-203 | Timeline/Roadmap block | Gantt-style; drag to adjust dates; milestones and phases | P0 |
| FR-204 | Scope Definition block | In-scope/out-scope lists; assumptions; dependencies | P0 |
| FR-205 | Deliverables List block | Name, description, acceptance criteria, owner, due date | P0 |
| FR-206 | Risk Register block | Risk, likelihood, impact, mitigation; auto-priority score | P0 |
| FR-207 | Pricing Calculator block | Effort estimation; T&M vs fixed price; margin calculator | P1 |
| FR-208 | RACI Matrix block | Roles and responsibilities; visual R/A/C/I indicators | P1 |
| FR-209 | Problem Statement block | Current state, desired state, gap analysis | P1 |
| FR-210 | Success Metrics block | KPIs with targets, baselines, measurement methods | P1 |

### FR-300: AI Discovery Copilot (Phase 2)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-301 | Engagement type selection | Select type (strategy, implementation, etc.); AI tailors questions | P0 |
| FR-302 | AI-generated discovery questions | 10-20 questions per type; user can add/remove | P0 |
| FR-303 | Question branching logic | Answers trigger follow-up questions; configurable | P0 |
| FR-304 | Voice/text input for answers | Type or dictate; speech-to-text with punctuation | P1 |
| FR-305 | AI summary of discovery | Executive summary of key findings after discovery | P0 |
| FR-306 | Auto-populate canvas from discovery | AI suggests blocks based on answers; user approves each | P0 |
| FR-307 | Discovery session recording | Record call; AI transcribes and extracts key points | P2 |
| FR-308 | Client-facing discovery form | Shareable link for client async answers | P1 |
| FR-309 | Discovery completeness score | 0-100% complete; highlights gaps | P0 |
| FR-310 | Framework recommendations | AI recommends frameworks based on discovery; explains why | P0 |

### FR-400: Deliverable Generation (Phase 3)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-401 | Generate Statement of Work | One click generates SOW from canvas; all data included | P0 |
| FR-402 | Generate Proposal | Client-facing proposal; professional formatting; branding | P0 |
| FR-403 | Generate Executive Summary | One-page summary suitable for stakeholder briefing | P0 |
| FR-404 | Multiple export formats | PDF, DOCX, Google Docs; formatting preserved | P0 |
| FR-405 | Custom branding/templates | Upload logo, colors, fonts; applied to all exports | P1 |
| FR-406 | Section-by-section generation | Regenerate individual sections; accept/reject each | P0 |
| FR-407 | AI writing style options | Professional, conversational, technical tone | P1 |
| FR-408 | Placeholder detection | AI flags [PLACEHOLDER] or incomplete sections before export | P0 |
| FR-409 | Version comparison | Compare two versions; highlight changes | P1 |
| FR-410 | E-signature integration | DocuSign/HelloSign for client signature | P2 |

### FR-500: AI Verification & Trust (Phase 3)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-501 | Canvas-to-document traceability | Every sentence links back to canvas source | P0 |
| FR-502 | Completeness checker | AI checks all required fields before generation | P0 |
| FR-503 | Consistency validator | AI flags inconsistencies (timeline vs deliverables, etc.) | P0 |
| FR-504 | Scope creep detector | Compares current to original; highlights additions | P0 |
| FR-505 | Pricing sanity check | AI flags if pricing seems too high/low for type | P1 |
| FR-506 | Risk assessment summary | Auto-generates risk summary from scope and timeline | P0 |
| FR-507 | Confidence score per section | 0-100% confidence for each generated section | P1 |
| FR-508 | Human approval workflow | Preview before export; require explicit approval | P0 |
| FR-509 | Audit log | All AI generations logged with inputs, outputs, approvals | P0 |
| FR-510 | Feedback loop | User rates AI output; feedback improves suggestions | P1 |

### FR-600: Engagement Tracking (Phase 4)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-601 | Engagement status workflow | Draft → Proposed → Accepted → Active → Completed → Archived | P0 |
| FR-602 | Milestone tracking | Mark milestones complete; auto-update progress | P0 |
| FR-603 | Deliverable checklist | Track status; link to actual files when complete | P0 |
| FR-604 | Change request workflow | Log scope changes; show timeline/budget impact; approval | P1 |
| FR-605 | Client portal (read-only) | Shareable link for client to view progress | P1 |
| FR-606 | Engagement dashboard | List view; filter by status, client, date | P0 |

### FR-700: Collaboration (Phase 5)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-701 | Invite team members | Add by email; assign role (owner, editor, viewer) | P0 |
| FR-702 | Real-time collaboration | Multiple users edit simultaneously; see cursors | P1 |
| FR-703 | Comments and mentions | Comment on any block; @mention users; notifications | P0 |
| FR-704 | Approval workflows | Require approval before status changes | P1 |
| FR-705 | Activity feed | Recent activity; who did what when | P0 |

### FR-800: User Experience

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| FR-801 | Onboarding flow | First canvas in < 10 minutes with guided tour | P0 |
| FR-802 | Keyboard shortcuts | Common actions have shortcuts; ? shows cheat sheet | P0 |
| FR-803 | Mobile-responsive viewer | View (not edit) on mobile; full edit on tablet+ | P1 |
| FR-804 | Dark mode | System-preference or manual toggle | P1 |
| FR-805 | Search across engagements | Full-text search of content, client names, tags | P0 |
| FR-806 | Quick actions menu | Cmd+K opens command palette | P1 |

---

## Non-Functional Requirements

### NFR-100: Performance

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-101 | Canvas load time | < 2 seconds for 50 blocks |
| NFR-102 | AI response time | Discovery questions < 3s; document generation < 10s |
| NFR-103 | Real-time sync latency | < 500ms for edits to appear |
| NFR-104 | Export generation time | < 30 seconds for typical engagement |

### NFR-200: Reliability

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-201 | Uptime SLA | 99.9% uptime |
| NFR-202 | Data durability | No data loss; auto-save every 5 seconds |
| NFR-203 | Graceful degradation | Canvas works if AI unavailable |
| NFR-204 | Backup and recovery | Daily backups; point-in-time recovery |

### NFR-300: Security

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-301 | Authentication | Email/password + MFA; SSO for enterprise |
| NFR-302 | Authorization | Role-based access; least privilege |
| NFR-303 | Encryption | TLS 1.3 in transit; AES-256 at rest |
| NFR-304 | Audit logging | All changes logged with user, timestamp |

### NFR-400: AI Quality & Trust

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| NFR-401 | AI output accuracy | > 95% content requires no manual fixes |
| NFR-402 | AI consistency | Same inputs produce semantically similar outputs |
| NFR-403 | Human-in-the-loop | No AI output goes to client without approval |
| NFR-404 | Eval test coverage | 95%+ coverage with golden test cases |

---

## Phasing Summary

| Phase | Timeline | FRs | Goal |
|-------|----------|-----|------|
| **1. Core Canvas** | Weeks 1-4 | FR-100, FR-200 | Visual builder with 6 framework blocks |
| **2. AI Discovery** | Weeks 5-8 | FR-300 | AI-guided discovery populates canvas |
| **3. Deliverables** | Weeks 9-12 | FR-400, FR-500 | One-click SOW/proposal with verification |
| **4. Tracking** | Weeks 13-16 | FR-600 | Engagement lifecycle management |
| **5. Collaboration** | Weeks 17-20 | FR-700 | Multi-user teams |

---

## Competitive Positioning

| Feature | Consulting Framer | PandaDoc | Miro | Bonsai |
|---------|-------------------|----------|------|--------|
| Visual canvas | ✅ Purpose-built | ❌ | ✅ Generic | ❌ |
| Consulting frameworks | ✅ 15+ | ❌ | ⚠️ Templates | ❌ |
| AI discovery | ✅ Guided Q&A | ❌ | ❌ | ❌ |
| SOW generation | ✅ One-click | ⚠️ Manual | ❌ | ⚠️ Templates |
| Scope verification | ✅ AI-powered | ❌ | ❌ | ❌ |

**Our unique value:** The only tool that combines visual scoping + AI discovery + verified deliverable generation in one workflow.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Jan 2026 | Initial release — 60 FRs, 16 NFRs |
