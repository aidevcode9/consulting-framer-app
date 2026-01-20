# CLAUDE.md — Consulting Framer

> Visual engagement builder for consultants. Turns discovery → canvas → professional deliverables.

## Reference Docs (Read These)

| Doc | Purpose | When to Check |
|-----|---------|---------------|
| `REQUIREMENTS.md` | FRs/NFRs with acceptance criteria | Starting a new feature |
| `ARCHITECTURE.md` | Data model, interfaces, tech stack | Implementing components |
| `STATUS.md` | Current phase, active tasks | Daily; before picking work |
| `EVALS.md` | Golden test cases, pass/fail | Changing AI logic |

**Workflow:**
1. Check `STATUS.md` → find task
2. Look up FR in `REQUIREMENTS.md` → acceptance criteria
3. Check `ARCHITECTURE.md` → schema, interfaces
4. Implement → tests + evals
5. Update `STATUS.md` → shipped
6. Commit with `(FR-NNN)`

---

## Stack

- **Frontend:** Next.js 14 + React Flow + Tailwind + shadcn/ui
- **State:** Zustand + Immer (with undo/redo via zundo)
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime)
- **AI:** Claude API (claude-sonnet-4-20250514)
- **Export:** react-pdf + docx
- **Hosting:** Vercel

---

## File Layout

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Login, signup
│   ├── (dashboard)/         # Main app
│   │   ├── engagements/     # Canvas, discovery, export
│   │   ├── templates/
│   │   └── settings/
│   └── api/                 # API routes
│       ├── ai/              # Discovery, generate, verify
│       └── export/          # PDF/DOCX
├── components/
│   ├── canvas/              # Canvas, blocks
│   ├── discovery/           # Discovery wizard
│   ├── export/              # Document preview
│   └── ui/                  # shadcn components
├── lib/
│   ├── supabase/           # Client, server
│   ├── ai/                 # Claude wrapper, prompts
│   └── export/             # PDF, DOCX generators
├── store/                   # Zustand stores
└── types/                   # TypeScript definitions
```

---

## Commands

```bash
# Dev server
pnpm dev

# Tests
pnpm test

# Evals (AI golden tests)
pnpm eval

# Lint + format
pnpm lint
pnpm format

# Type check
pnpm typecheck

# Build
pnpm build
```

---

## Invariants — Current (Enforced Now)

🚨 **NEVER violate:**

1. **Human approval required** — No AI-generated content goes to client without explicit user approval
2. **Canvas is source of truth** — Generated documents must trace every claim to a canvas block
3. **Audit everything** — All AI generations logged with input, output, model, timestamp
4. **Multi-tenant isolation** — RLS on all tables; users only see their org's data
5. **No data invention** — AI must flag missing data with `[NEEDS: ...]`, not make it up

---

## Invariants — Planned

| Rule | FR | Phase |
|------|-----|-------|
| Offline canvas editing | FR-107 | Phase 2 |
| Real-time collaboration | FR-702 | Phase 5 |

---

## Quality Gates

| Check | Command | Blocks PR |
|-------|---------|-----------|
| Lint | `pnpm lint` | ✅ Yes |
| Types | `pnpm typecheck` | ✅ Yes |
| Unit tests | `pnpm test` | ✅ Yes |
| Evals | `pnpm eval` | ✅ Yes (95%+) |
| Build | `pnpm build` | ✅ Yes |

**No exceptions.** Fix before merging.

---

## Commit Convention

```
type(scope): description (FR-NNN)

# Examples:
feat(canvas): add SWOT block component (FR-201)
feat(ai): implement discovery question generation (FR-302)
fix(export): handle missing deliverables gracefully (FR-408)
test(evals): add SOW generation golden tests
```

Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

---

## Mistakes (Learn from These)

| Date | Mistake | Rule Added |
|------|---------|------------|
| — | — | (No mistakes yet — document as they happen) |

**Rule:** Every mistake becomes a documented rule.

---

## Red Flags — Stop and Ask

- Removing verification/traceability from document generation
- Bypassing human approval workflow
- Logging raw client data without redaction
- Skipping evals for AI changes
- Any change to `lib/ai/prompts.ts` without eval coverage

---

## Key Files (Read First)

| File | Purpose |
|------|---------|
| `REQUIREMENTS.md` | What to build |
| `ARCHITECTURE.md` | How to build |
| `STATUS.md` | What to do now |
| `EVALS.md` | How to verify AI |
| `src/lib/ai/prompts.ts` | AI prompt templates |
| `src/lib/ai/verify.ts` | Document verification |
| `src/store/canvas.ts` | Canvas state management |
| `src/types/blocks.ts` | Block type definitions |

---

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## AI Guidelines

### Discovery Questions
- Generate 10-20 questions per engagement type
- Cover: problem, stakeholders, constraints, success, risks
- Include `suggestedBlocks` to auto-populate canvas
- Support follow-up questions based on answers

### Document Generation
- Always include `[Source: block_type]` tags for traceability
- Flag missing data as `[NEEDS: description]`
- Never invent information not in canvas
- Calculate confidence score 0-100%

### Verification
- Check every claim has canvas source
- Detect timeline vs deliverable conflicts
- Detect scope vs deliverable gaps
- Block export if confidence < 80%

---

## Testing Strategy

### Unit Tests
- Block components render correctly
- Canvas state updates properly
- Export templates compile

### Integration Tests
- Discovery flow end-to-end
- Document generation pipeline
- Auth and RLS

### Evals (AI Golden Tests)
- Discovery questions cover all categories
- Generated SOW includes all canvas data
- Verification catches inconsistencies
- No fabricated information

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Canvas load | < 2s |
| Block drag | < 16ms |
| AI discovery | < 3s |
| AI generation | < 10s |
| Export PDF | < 30s |

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] API routes validate auth
- [ ] AI prompts sanitize user input
- [ ] Document generation escapes HTML
- [ ] Rate limiting on AI endpoints
- [ ] Audit logging for sensitive actions
