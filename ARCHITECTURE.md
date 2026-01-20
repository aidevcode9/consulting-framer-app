# ARCHITECTURE.md — Consulting Framer

> Technical architecture, data models, interfaces, and deployment configuration.

**Version:** 1.0  
**Last Updated:** January 2026

---

## Design Principles

1. **Speed First** — Every interaction feels instant (< 100ms perceived latency)
2. **AI-Assisted, Human-Controlled** — AI suggests, humans approve; never auto-send
3. **Offline-Capable** — Core canvas works without network; sync when connected
4. **Framework-Agnostic** — Easy to add new frameworks without code changes
5. **Trust by Design** — Every AI output traceable to source; audit everything

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CONSULTING FRAMER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
│  │   Next.js    │    │   Supabase   │    │   Claude     │               │
│  │   Frontend   │◄──►│   Backend    │◄──►│   AI API     │               │
│  │              │    │              │    │              │               │
│  │  • Canvas    │    │  • Auth      │    │  • Discovery │               │
│  │  • Blocks    │    │  • Database  │    │  • Generate  │               │
│  │  • Export    │    │  • Storage   │    │  • Verify    │               │
│  └──────────────┘    └──────────────┘    └──────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 (App Router) | Server components, streaming, excellent DX |
| **Canvas** | React Flow | Battle-tested node editor, MIT license |
| **State** | Zustand + Immer | Simple, performant, undo/redo built-in |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent design, rapid iteration |
| **Backend** | Supabase (Postgres + Auth + Storage) | All-in-one, excellent free tier |
| **AI** | Claude API (claude-sonnet-4-20250514) | Best reasoning, fast, cost-effective |
| **Documents** | react-pdf + docx | Client-side generation |
| **Hosting** | Vercel | Edge functions, excellent Next.js support |

---

## Data Model

### Core Tables

```sql
-- Organizations (multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    settings JSONB DEFAULT '{}',
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    org_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    industry TEXT,
    company_size TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements (core entity)
CREATE TABLE engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    client_id UUID REFERENCES clients(id),
    created_by UUID REFERENCES users(id),
    
    name TEXT NOT NULL,
    description TEXT,
    engagement_type TEXT NOT NULL,
    
    status TEXT DEFAULT 'draft',
    -- 'draft' | 'discovery' | 'proposed' | 'accepted' | 'active' | 'completed' | 'archived'
    
    canvas_data JSONB DEFAULT '{"blocks": [], "connections": [], "viewport": {"x": 0, "y": 0, "zoom": 1}}',
    discovery_answers JSONB DEFAULT '{}',
    discovery_completeness INT DEFAULT 0,
    
    pricing_model TEXT DEFAULT 'fixed',
    estimated_value DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    
    proposed_start_date DATE,
    proposed_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Blocks
CREATE TABLE canvas_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    
    block_type TEXT NOT NULL,
    position_x FLOAT NOT NULL DEFAULT 0,
    position_y FLOAT NOT NULL DEFAULT 0,
    width FLOAT DEFAULT 400,
    height FLOAT DEFAULT 300,
    content JSONB NOT NULL DEFAULT '{}',
    
    collapsed BOOLEAN DEFAULT FALSE,
    locked BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Block Connections
CREATE TABLE block_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    from_block_id UUID REFERENCES canvas_blocks(id) ON DELETE CASCADE,
    to_block_id UUID REFERENCES canvas_blocks(id) ON DELETE CASCADE,
    connection_type TEXT DEFAULT 'informs',
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Version History
CREATE TABLE engagement_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    canvas_snapshot JSONB NOT NULL,
    trigger TEXT NOT NULL, -- 'auto_save' | 'manual_save' | 'status_change'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generation Audit
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    generation_type TEXT NOT NULL,
    -- 'discovery_questions' | 'discovery_summary' | 'canvas_suggestions' | 'sow' | 'proposal'
    
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    model_id TEXT NOT NULL,
    
    latency_ms INT,
    input_tokens INT,
    output_tokens INT,
    
    status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'modified'
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    description TEXT,
    engagement_type TEXT NOT NULL,
    canvas_data JSONB NOT NULL,
    discovery_questions JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT FALSE,
    use_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_engagements_org ON engagements(org_id);
CREATE INDEX idx_engagements_status ON engagements(status);
CREATE INDEX idx_canvas_blocks_engagement ON canvas_blocks(engagement_id);
CREATE INDEX idx_ai_generations_engagement ON ai_generations(engagement_id);
```

### Row-Level Security

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE FUNCTION auth.user_org_id() RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Policies (example)
CREATE POLICY "Users see own org engagements"
    ON engagements FOR SELECT
    USING (org_id = auth.user_org_id());

CREATE POLICY "Users can create in own org"
    ON engagements FOR INSERT
    WITH CHECK (org_id = auth.user_org_id());
```

---

## Block Type Definitions

```typescript
// types/blocks.ts

export interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'strategy' | 'implementation' | 'assessment' | 'discovery';
  contentSchema: JSONSchema;
  defaultContent: Record<string, unknown>;
  defaultWidth: number;
  defaultHeight: number;
  discoveryCategories: string[];
  exportTemplate: string;
}

// Example: SWOT Block
export const swotBlock: BlockDefinition = {
  type: 'swot',
  name: 'SWOT Analysis',
  description: 'Analyze strengths, weaknesses, opportunities, threats',
  icon: 'Grid2X2',
  category: 'strategy',
  
  contentSchema: {
    type: 'object',
    properties: {
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      opportunities: { type: 'array', items: { type: 'string' } },
      threats: { type: 'array', items: { type: 'string' } },
    },
  },
  
  defaultContent: {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  },
  
  defaultWidth: 500,
  defaultHeight: 400,
  discoveryCategories: ['current_state', 'market'],
  
  exportTemplate: `
## SWOT Analysis

**Strengths:** {{#each strengths}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Weaknesses:** {{#each weaknesses}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Opportunities:** {{#each opportunities}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Threats:** {{#each threats}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
`,
};

// Block Registry
export const blockRegistry: Record<string, BlockDefinition> = {
  swot: swotBlock,
  stakeholder_map: stakeholderMapBlock,
  timeline: timelineBlock,
  scope: scopeBlock,
  deliverables: deliverablesBlock,
  risk_register: riskRegisterBlock,
  pricing: pricingBlock,
  raci: raciBlock,
  problem_statement: problemStatementBlock,
  success_metrics: successMetricsBlock,
};
```

---

## AI Service Interface

```typescript
// services/ai/types.ts

export interface AIService {
  generateDiscoveryQuestions(params: {
    engagementType: string;
    clientIndustry?: string;
    existingAnswers?: Record<string, string>;
  }): Promise<DiscoveryQuestion[]>;

  summarizeDiscovery(params: {
    engagementType: string;
    answers: Record<string, string>;
  }): Promise<DiscoverySummary>;

  suggestCanvasBlocks(params: {
    engagementType: string;
    discoveryAnswers: Record<string, string>;
    existingBlocks: CanvasBlock[];
  }): Promise<BlockSuggestion[]>;

  generateDocument(params: {
    documentType: 'sow' | 'proposal' | 'executive_summary';
    engagement: Engagement;
    blocks: CanvasBlock[];
    style: 'professional' | 'conversational' | 'technical';
  }): Promise<GeneratedDocument>;

  verifyDocument(params: {
    document: GeneratedDocument;
    blocks: CanvasBlock[];
  }): Promise<VerificationResult>;
}
```

---

## AI Prompts

### Discovery Questions

```typescript
export const DISCOVERY_SYSTEM = `You are an expert consultant scoping engagements.

Generate discovery questions that cover:
1. Core problem/opportunity
2. Key stakeholders
3. Constraints (budget, timeline, resources)
4. Success criteria
5. Risks and blockers

Return JSON:
{
  "questions": [
    {
      "id": "q1",
      "text": "...",
      "category": "problem|stakeholders|constraints|success|risks",
      "required": true,
      "suggestedBlocks": ["swot", "stakeholder_map"]
    }
  ]
}`;
```

### Document Generation

```typescript
export const SOW_SYSTEM = `You are generating a Statement of Work.

Requirements:
1. Professional and clear
2. No ambiguity about scope
3. Deliverables with acceptance criteria
4. Realistic timeline
5. Assumptions and dependencies
6. Risks and mitigation

CRITICAL: Every statement must trace to canvas data.
Do NOT invent information. Flag missing data with [NEEDS: description].

Include [Source: block_type] tags for traceability.`;
```

---

## Frontend Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, signup
│   ├── (dashboard)/
│   │   ├── engagements/
│   │   │   ├── page.tsx       # List
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Canvas
│   │   │       ├── discovery/ # Discovery mode
│   │   │       └── export/    # Export preview
│   │   ├── templates/
│   │   └── settings/
│   └── api/
│       ├── ai/
│       │   ├── discovery/
│       │   ├── generate/
│       │   └── verify/
│       └── export/
│
├── components/
│   ├── canvas/
│   │   ├── Canvas.tsx
│   │   ├── BlockNode.tsx
│   │   └── blocks/            # Block-specific components
│   ├── discovery/
│   │   ├── DiscoveryWizard.tsx
│   │   └── QuestionCard.tsx
│   └── export/
│       └── DocumentPreview.tsx
│
├── lib/
│   ├── supabase/
│   ├── ai/
│   └── export/
│
├── store/
│   ├── canvas.ts              # Zustand store
│   └── discovery.ts
│
└── types/
    ├── blocks.ts
    └── database.ts
```

---

## State Management

```typescript
// store/canvas.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';

interface CanvasState {
  blocks: CanvasBlock[];
  connections: BlockConnection[];
  viewport: { x: number; y: number; zoom: number };
  selectedBlockIds: string[];
  
  addBlock: (type: string, position: { x: number; y: number }) => void;
  updateBlock: (id: string, content: Partial<CanvasBlock>) => void;
  deleteBlock: (id: string) => void;
  addConnection: (from: string, to: string, type: string) => void;
  
  loadCanvas: (engagementId: string) => Promise<void>;
  saveCanvas: () => Promise<void>;
}

export const useCanvasStore = create<CanvasState>()(
  temporal(
    immer((set, get) => ({
      // ... implementation with undo/redo support
    })),
    { limit: 50 }
  )
);
```

---

## Verification Pipeline

```typescript
// services/verification.ts

export async function verifyDocument(
  document: GeneratedDocument,
  blocks: CanvasBlock[]
): Promise<VerificationResult> {
  const issues: VerificationIssue[] = [];
  
  // 1. Check all claims have sources
  for (const section of document.sections) {
    const claims = extractClaims(section.content);
    for (const claim of claims) {
      const source = findSourceBlock(claim, blocks);
      if (!source) {
        issues.push({
          type: 'unverified_claim',
          severity: 'high',
          section: section.name,
          claim: claim.text,
          suggestion: 'Add supporting data to canvas or remove claim',
        });
      }
    }
  }
  
  // 2. Check timeline consistency
  const timeline = blocks.find(b => b.type === 'timeline');
  const deliverables = blocks.find(b => b.type === 'deliverables');
  if (timeline && deliverables) {
    const conflicts = findTimelineConflicts(timeline, deliverables);
    issues.push(...conflicts);
  }
  
  // 3. Check scope vs deliverables alignment
  const scope = blocks.find(b => b.type === 'scope');
  if (scope && deliverables) {
    const gaps = findScopeDeliverableGaps(scope, deliverables);
    issues.push(...gaps);
  }
  
  // 4. Calculate confidence score
  const confidence = calculateConfidence(issues);
  
  return {
    isValid: issues.filter(i => i.severity === 'high').length === 0,
    confidence,
    issues,
    traceability: buildTraceabilityMap(document, blocks),
  };
}
```

---

## Performance Budgets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s |
| Canvas load (50 blocks) | < 2.0s |
| Block drag latency | < 16ms |
| AI question generation | < 3s |
| Document generation | < 10s |
| Bundle size (main) | < 200KB |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# AI
ANTHROPIC_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://consultingframer.com
```

---

## Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/ai/**": { "maxDuration": 30 },
    "app/api/export/**": { "maxDuration": 60, "memory": 1024 }
  }
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | Jan 2026 | Initial architecture |
