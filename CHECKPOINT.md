# CHECKPOINT.md — Session Progress

---

## [2026-01-24] FR-211: Delete Individual Nodes

**Status:** ✅ Complete
**Branch:** main
**Commit:** 4068c65

**Files modified:**
- src/lib/store.ts - Added `deleteSelectedNodes()` action to CanvasState
- src/components/canvas/CanvasToolbar.tsx - Updated trash button to delete selected nodes first
- src/components/canvas/Canvas.tsx - Added Delete/Backspace keyboard shortcut

**What was implemented:**

### Store Changes (store.ts)
- Added `deleteSelectedNodes: () => void` to interface
- Implementation deletes all nodes in `selectedNodes` array
- Properly removes connected edges
- Calls `saveToHistory()` before deletion (undo support)
- Clears selection after deletion

### Toolbar Changes (CanvasToolbar.tsx)
- Trash button now context-aware:
  - If nodes selected: deletes selected nodes (no confirmation)
  - If no selection: clears entire canvas (with confirmation)
- Tooltip shows count of selected nodes

### Keyboard Shortcut (Canvas.tsx)
- Delete or Backspace key deletes selected nodes
- Ignores keypress when user is typing in input/textarea
- Works anywhere on the canvas

**Verification:** lint ✅ | typecheck ✅ | build ✅

**Notes:**
- User can now select a node and press Delete/Backspace or click trash
- Undo/redo fully supported via existing history mechanism
- Multi-select deletion supported (select multiple nodes, delete all at once)

---

## [2026-01-24] FR-454: Strategic Implications UI

**Status:** ✅ Complete
**Branch:** feat/proposal-generation

**Files created:**
- src/components/canvas/StrategicInsightsPanel.tsx (new) - Collapsible panel for strategic insights

**Files modified:**
- src/types/index.ts - Added strategic insights types (PorterStrategicInsights, McKinseyStrategicInsights, SWOTStrategicInsights, BMCStrategicInsights, EvidenceQuality)
- src/services/ai.service.ts - Updated CanvasPopulateResult to include strategic_insights; added extractStrategicInsights()
- src/components/canvas/Canvas.tsx - Pass strategic_insights through to nodes
- src/components/canvas/nodes/PorterNode.tsx - Added StrategicInsightsPanel
- src/components/canvas/nodes/SWOTNode.tsx - Added StrategicInsightsPanel
- src/components/canvas/nodes/McKinseyNode.tsx - Added StrategicInsightsPanel
- src/components/canvas/nodes/BMCNode.tsx - Added StrategicInsightsPanel

**What was implemented:**

### Strategic Insights Types
New TypeScript types for framework-specific AI metadata:
- `PorterStrategicInsights` - intensity_ratings per force
- `McKinseyStrategicInsights` - element_health per element, alignment_issues
- `SWOTStrategicInsights` - factor_priority, tows_strategies
- `BMCStrategicInsights` - value_proposition_fit, coherence_issues
- `EvidenceQuality` - industry_specific_count, generic_count, evidence_gaps

### AIService Updates
- `CanvasPopulateResult` now includes optional `strategic_insights`
- New `extractStrategicInsights()` method parses AI response metadata
- Metadata extraction based on framework type

### Canvas Integration
- Canvas passes `strategic_insights` from API response to node data
- Each framework node receives insights alongside sections

### StrategicInsightsPanel Component
Collapsible panel showing:
- **Porter:** Force intensity ratings (HIGH/MEDIUM/LOW badges)
- **McKinsey:** Element health ratings, alignment issues
- **SWOT:** Factor priorities, TOWS strategies (SO/WO/ST/WT)
- **BMC:** Value proposition fit ratings, coherence issues
- **All:** Strategic implications summary, evidence quality metrics

### UI Features
- Collapsed by default to save space
- Color-coded rating badges (green=strong, yellow=moderate, red=weak)
- Evidence quality shows industry-specific vs generic observation ratio
- Evidence gaps highlighted with warning icon

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Pass (after fix)
- HIGH issue fixed: Cache now includes strategic_insights
- Updated `CacheEntry` interface with `FrameworkCacheData` type
- Cache retrieval and storage both handle strategic_insights

**Notes:**
- Panel only shows when strategic_insights data is available
- Backwards compatible - old nodes without insights work fine
- Completes FR-450 Framework Intelligence group

---

## [2026-01-24] FR-453: Industry Context for Framework Prompts

**Status:** ✅ Complete
**Branch:** feat/proposal-generation

**Files modified:**
- src/lib/ai/prompts/frameworks/porter.prompt.ts (v2.0.0 → v2.1.0)
- src/lib/ai/prompts/frameworks/mckinsey.prompt.ts (v2.0.0 → v2.1.0)
- src/lib/ai/prompts/frameworks/swot.prompt.ts (v2.0.0 → v2.1.0)
- src/lib/ai/prompts/frameworks/bmc.prompt.ts (v2.0.0 → v2.1.0)

**What was implemented:**

### Industry Context Requirements
Each framework prompt now includes:

1. **INDUSTRY CONTEXT section** with:
   - Instructions to ground observations in industry-specific evidence
   - Guidance on typical patterns by industry vertical (Tech/SaaS, Professional Services, Healthcare, Manufacturing, Retail/E-commerce, Financial Services)
   - Direction to distinguish generic vs industry-specific observations
   - Calibration guidance against industry norms

2. **Evidence Quality tracking** in JSON output:
   ```json
   "evidence_quality": {
     "industry_specific_count": <number>,
     "generic_count": <number>,
     "evidence_gaps": ["Areas needing more industry context"]
   }
   ```

3. **Updated user prompts** to request:
   - Industry-specific evidence grounding
   - Flagging of generic vs industry-specific insights

### Framework-Specific Industry Considerations

**Porter's Five Forces (v2.1.0)**
- Industry-specific competitive intensity patterns
- Vertical-specific force considerations (network effects, regulatory barriers, etc.)

**McKinsey 7-S (v2.1.0)**
- Organizational patterns by vertical (agile structures, compliance culture, etc.)
- Industry-calibrated element health assessments

**SWOT Analysis (v2.1.0)**
- Industry-typical strengths/weaknesses/opportunities/threats
- Vertical-specific factors (IP, supply chain, regulatory, etc.)

**Business Model Canvas (v2.1.0)**
- Business model patterns by vertical (freemium, utilization, etc.)
- Industry-calibrated value proposition fit

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Notes:**
- FR-454 (Strategic Implications UI) is next
- Evidence quality tracking enables future UI for showing industry-specific vs generic ratio

---

## [2026-01-24] FR-451: BMC Prompt Enhancement

**Status:** ✅ Complete
**Branch:** feat/proposal-generation

**Files created:**
- src/lib/ai/prompts/frameworks/bmc.prompt.ts (new) - Business Model Canvas v2.0.0

**Files modified:**
- src/lib/ai/prompts/frameworks/index.ts - Added BMC to FRAMEWORK_PROMPTS registry
- src/lib/ai/prompts/index.ts - Added BMC exports

**What was implemented:**

### Business Model Canvas Prompt (Osterwalder 2010)

**9 Building Blocks organized by area:**
- **Infrastructure (How):** Key Partners, Key Activities, Key Resources
- **Offering (What):** Value Propositions
- **Customers (Who):** Customer Relationships, Channels, Customer Segments
- **Finances (How Much):** Cost Structure, Revenue Streams

**Value Proposition Fit Analysis:**
- segment_vp_fit: STRONG | MODERATE | WEAK
- vp_channel_fit: STRONG | MODERATE | WEAK
- relationship_revenue_fit: STRONG | MODERATE | WEAK

**Coherence Issue Detection:**
- Identifies gaps/misalignments between blocks
- Strategic implications for business model viability

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Source:** Osterwalder, A. & Pigneur, Y. (2010). Business Model Generation. Wiley.

---

## [2026-01-23] FR-451, FR-452: Framework Intelligence Prompts

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/ai/prompts/frameworks/porter.prompt.ts (new) - Porter's Five Forces v2.0.0
- src/lib/ai/prompts/frameworks/mckinsey.prompt.ts (new) - McKinsey 7-S v2.0.0
- src/lib/ai/prompts/frameworks/swot.prompt.ts (new) - SWOT Analysis v2.0.0
- src/lib/ai/prompts/frameworks/index.ts (new) - Framework prompts registry

**Files modified:**
- src/lib/ai/prompts/index.ts - Added framework prompt exports, updated getAllPromptMetadata()
- src/services/ai.service.ts - Updated generateCanvasContent() to use framework-specific prompts

**What was implemented:**

### FR-451: Framework-Specific Prompts
Each framework now has a dedicated prompt file with:
- **Porter's Five Forces (v2.0.0)**
  - 5 forces with intensity ratings (HIGH/MEDIUM/LOW)
  - Detailed methodology for each force (rivalry, entrants, suppliers, buyers, substitutes)
  - Strategic implications summary
  - Source: Porter, M.E. (1979, 2008). Harvard Business Review.

- **McKinsey 7-S (v2.0.0)**
  - Hard elements: Strategy, Structure, Systems
  - Soft elements: Shared Values, Style, Staff, Skills
  - Element health assessment (STRONG/MODERATE/WEAK)
  - Alignment issue detection
  - Source: Waterman, Peters & Phillips (1980). Business Horizons.

- **SWOT Analysis (v2.0.0)**
  - Internal factors (Strengths, Weaknesses) vs External factors (Opportunities, Threats)
  - TOWS Matrix strategic options (SO, WO, ST, WT strategies)
  - Factor prioritization
  - Source: Humphrey/SRI (1960s), Weihrich TOWS (1982).

### FR-452: Methodology Sources
- Each prompt includes academic citations
- SOURCE objects exported for reference
- Methodology guidance embedded in system prompts

### Prompt Versioning System
- PromptMetadata with id, version, description, lastUpdated, changelog
- Version logged in AI usage tracking
- getFrameworkPrompt() helper returns null for unsupported types (graceful fallback)
- getAllFrameworkPromptMetadata() for monitoring/debugging

### AIService Updates
- generateCanvasContent() now checks for enhanced prompts via getFrameworkPrompt()
- Uses framework-specific systemPrompt and buildUserPrompt when available
- Falls back to generic CANVAS_POPULATE_PROMPT for BMC/Note
- Increased maxTokens (2048) for enhanced prompts
- Logs prompt version in usage telemetry

**Security:**
- All user inputs sanitized via sanitizeForPrompt()
- Injection detection logging preserved
- Usage limits enforced before AI calls

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- Prompt versioning implemented
- Sources included
- Graceful fallback for unsupported frameworks
- All security measures maintained

**Commit:** 8f7823c

**Notes:**
- BMC prompt enhancement is P1 (next priority)
- Industry context (FR-453) and Strategic implications (FR-454) are next
- Enhanced prompts use ~2x tokens due to detailed methodology

---

## [2026-01-22] FR-502: Generate Proposal

**Status:** ✅ Complete
**Branch:** feat/proposal-generation

**Files created:**
- src/lib/ai/prompts/proposal.prompt.ts (new) - Proposal generation prompt
- src/app/api/proposal/generate/route.ts (new) - POST /api/proposal/generate endpoint
- src/components/proposal/ProposalPreviewModal.tsx (new) - Modal to preview generated proposals
- src/lib/export/proposal-pdf.ts (new) - PDF export for proposals
- src/lib/export/proposal-docx.ts (new) - DOCX export for proposals

**Files modified:**
- src/types/index.ts - Added GeneratedProposal, ProposalPhase, ProposalInvestment, ProposalOption types
- src/lib/ai/prompts/index.ts - Added proposal prompt exports
- src/services/ai.service.ts - Added generateProposal method
- src/lib/export/index.ts - Added proposal export functions
- src/app/app/page.tsx - Added Generate Proposal button and ProposalPreviewModal

**What was implemented:**

### FR-502: Generate Proposal
- POST /api/proposal/generate endpoint
- Client-facing proposal generation (distinct from internal SOW)
- Generates structured proposal with:
  - Executive summary (persuasive, value-focused)
  - Situation analysis (client understanding)
  - Proposed approach (methodology overview)
  - Key benefits (4-6 business outcomes)
  - Methodology phases with outcomes
  - Investment options with pricing
  - Next steps (actionable)
  - Why us section
- Mock proposal when no API key configured
- 60 second timeout for long-running generations
- Export to PDF and DOCX

**Security:**
- Usage limits checked BEFORE AI call (sow_generation action)
- Prompt injection defense with sanitizeForPrompt()
- Auth check + engagement ownership verification
- Input validation with Zod schema

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- All AI checklist items passed
- All auth checklist items passed
- All data integrity checklist items passed

**Commit:** de934b9

**Notes:**
- Phase 3 Deliverables is now COMPLETE!
- All P0s done: FR-501, FR-502, FR-503, FR-504, FR-508, FR-509
- Proposal is client-facing pitch; SOW is internal scope document

---

## [2026-01-22] Lesson Learned: Git Branching

**Issue:** Used `feat/auth-email-google` branch for 15+ unrelated features beyond auth.

**What went wrong:**
- Branch accumulated: Auth → AI Discovery → SOW → Exports
- Branch name became misleading
- One giant PR instead of focused reviews
- Harder to revert specific features if issues arise

**Best practice:**
1. One feature branch per feature (or tightly related set)
2. Merge to main when complete
3. Create new branch for next feature
4. Small, focused PRs

**Correction:** Creating PR for current branch, then fresh `feat/proposal-generation` for FR-502.

---

## [2026-01-22] FR-503, FR-504: Export PDF + DOCX

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/lib/export/pdf.ts (new) - PDF export using jsPDF
- src/lib/export/docx.ts (new) - DOCX export using docx library
- src/lib/export/index.ts (new) - Export utilities index

**Files modified:**
- src/components/sow/SOWPreviewModal.tsx - Added export dropdown with PDF/DOCX options
- package.json - Added docx and file-saver dependencies

**What was implemented:**

### FR-503: Export PDF
- Professional PDF generation using jsPDF (already installed)
- Full SOW sections: executive summary, objectives, deliverables, timeline, assumptions, risks
- Color-coded risk badges (high/medium/low)
- Proper pagination with page breaks
- Header with engagement info, footer with page numbers
- Download as `SOW_ClientName_YYYY-MM-DD.pdf`

### FR-504: Export DOCX
- Word document generation using docx library
- Styled headings, tables for timeline
- Professional formatting matching PDF output
- Download as `SOW_ClientName_YYYY-MM-DD.docx`

### Export UI
- Dropdown menu in SOW preview footer
- Loading state during export
- Error handling with user alerts
- Click-outside to close dropdown

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- Client-side export, no API calls needed
- No sensitive data exposure
- Proper error handling

**Commit:** d907c70

**Notes:**
- Phase 3 exports complete
- FR-502 (Generate Proposal) is the remaining P0

---

## [2026-01-22] FR-509, FR-508: SOW Preview + Placeholder Detection

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/components/sow/SOWPreviewModal.tsx (new) - Modal to preview generated SOW

**Files modified:**
- src/app/app/page.tsx - Added SOW preview modal, generate button, placeholder detection

**What was implemented:**

### FR-509: Preview Before Export
- SOWPreviewModal component with full SOW display
- Executive summary, objectives, deliverables, timeline, assumptions, risks sections
- Professional styling with icons and color-coded badges
- "Generate SOW" button in Scope panel with loading state
- Integration with existing /api/sow/generate endpoint

### FR-508: Placeholder Detection
- Detects incomplete sections:
  - Executive summary too short (< 50 chars)
  - Less than 2 objectives
  - Less than 2 deliverables
  - No timeline phases
  - No risks identified
  - Less than 3 discovery questions answered
  - No frameworks on canvas
- Warning banner in preview modal
- Lists all detected issues for user

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- All security checklists passed
- Placeholder detection comprehensive

**Commit:** 38f49d1

**Notes:**
- Export functionality (FR-503, FR-504) is next
- Preview modal shows "Export" button with placeholder alert

---

## [2026-01-22] FR-501: SOW Generation

**Status:** ✅ Complete
**Branch:** feat/auth-email-google

**Files created:**
- src/app/api/sow/generate/route.ts (new) - POST /api/sow/generate endpoint

**Files modified:**
- src/lib/ai/prompts.ts - Added SOW_GENERATION_PROMPT and buildSOWGenerationPrompt
- src/services/ai.service.ts - Added generateSOW method with canvas insights extraction

**What was implemented:**

### FR-501: Generate SOW
- POST /api/sow/generate endpoint
- Takes engagementId, fetches engagement with canvas_data and discovery_answers
- Extracts framework insights from canvas nodes (SWOT, Porter, McKinsey)
- Formats discovery answers for prompt context
- Generates comprehensive SOW with:
  - Executive summary
  - Objectives (3-5)
  - Deliverables with acceptance criteria (3-6)
  - Timeline with phases (2-4)
  - Assumptions (3-5)
  - Risks with mitigations (2-4)
- Mock SOW returned when no API key configured
- 60 second timeout for long-running generations

**Security:**
- Usage limits checked BEFORE AI call (sow_generation action)
- Prompt injection defense with sanitizeForPrompt()
- Auth check + engagement ownership verification
- Input validation with Zod schema

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Ship it
- All AI checklist items passed
- All auth checklist items passed
- All data integrity checklist items passed

**Commit:** 96a2ad9

**Notes:**
- Phase 3 Deliverables has begun
- FR-509 (Preview) and FR-508 (Placeholder detection) are next

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

## [2026-01-24] FR-456: Methodology Transparency

**Status:** ✅ Complete
**Branch:** main

**Files modified:**
- src/types/index.ts - Added MethodologySource, FrameworkMethodology types
- src/lib/ai/prompts/frameworks/index.ts - Added getFrameworkSource(), getFrameworkDisplayName() helpers
- src/lib/ai/prompts/frameworks/swot.prompt.ts - Fixed source structure (swot/tows → primary/extended)
- src/lib/ai/prompts/frameworks/bmc.prompt.ts - Fixed source structure (vpd → extended)
- src/lib/ai/prompts/index.ts - Added methodology helper exports
- src/services/ai.service.ts - Added buildMethodology(), summarizeDiscoveryInputs() methods
- src/components/canvas/StrategicInsightsPanel.tsx - Added Methodology section with citations
- src/components/canvas/Canvas.tsx - Added methodology to cache and node updates
- src/components/canvas/nodes/PorterNode.tsx - Added methodology prop
- src/components/canvas/nodes/McKinseyNode.tsx - Added methodology prop
- src/components/canvas/nodes/SWOTNode.tsx - Added methodology prop
- src/components/canvas/nodes/BMCNode.tsx - Added methodology prop
- REQUIREMENTS.md - Added FR-456
- STATUS.md - Added FR-456 task

**What was implemented:**

### Types (MethodologySource, FrameworkMethodology)
- MethodologySource: author, authors, year, title, publication, note
- FrameworkMethodology: framework_name, source, prompt_version, last_updated, discovery_inputs_summary

### Helper Functions
- getFrameworkSource(type) - Returns framework source definition
- getFrameworkDisplayName(type) - Returns display name (e.g., "Porter's Five Forces")

### AI Service Updates
- buildMethodology() - Constructs methodology object from framework config
- summarizeDiscoveryInputs() - "X questions answered" summary

### StrategicInsightsPanel Methodology Section
- Version badge (e.g., "v2.1.0")
- Primary citation with academic formatting
- Optional "Updated" and "Extended" sources
- Discovery inputs summary

### Framework Source Fixes
- SWOT_SOURCE: Changed keys from swot/tows to primary/extended
- BMC_SOURCE: Changed key from vpd to extended

**Verification:**
- lint: ✅
- typecheck: ✅
- build: ✅

**Skeptic Review:** ✅ Pass
- Fixed: Extended source display was missing (now renders for SWOT/BMC)

**Notes:**
- PE technology advisors can now see academic citations for framework methodology
- Prompt version visible for transparency
- Discovery context shows how many inputs informed the analysis
- Completes FR-450 Framework Intelligence group

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
