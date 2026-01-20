-- Consulting Framer Database Schema
-- Run this in Supabase SQL Editor or via migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT,
    role TEXT DEFAULT 'consultant',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagements (main entity)
CREATE TABLE IF NOT EXISTS public.engagements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic info
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_industry TEXT,
    description TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'discovery' CHECK (status IN ('discovery', 'framing', 'scoping', 'active', 'completed', 'on_hold')),
    
    -- Canvas data (JSON storage for flexibility)
    canvas_data JSONB DEFAULT '{"nodes": [], "edges": [], "viewport": {"x": 0, "y": 0, "zoom": 1}}',
    
    -- Discovery data
    discovery_answers JSONB DEFAULT '{}',
    discovery_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    estimated_value DECIMAL(12, 2),
    estimated_duration_weeks INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Framework Templates (pre-built frameworks)
CREATE TABLE IF NOT EXISTS public.framework_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'strategy', 'analysis', 'planning', 'operations'
    
    -- Template structure
    node_template JSONB NOT NULL, -- Default nodes for this framework
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    is_system BOOLEAN DEFAULT TRUE, -- System templates vs user-created
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discovery Questions (AI-driven)
CREATE TABLE IF NOT EXISTS public.discovery_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Question content
    question TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'business_context', 'problem_definition', 'stakeholders', 'constraints', 'success_criteria'
    
    -- Question behavior
    question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'select', 'multi_select', 'number', 'date', 'scale')),
    options JSONB, -- For select/multi_select types
    
    -- Conditional logic
    depends_on UUID REFERENCES public.discovery_questions(id),
    show_when JSONB, -- Condition for showing this question
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT FALSE,
    
    -- AI hints
    ai_context TEXT, -- Context for AI to understand the answer
    follow_up_prompt TEXT, -- Prompt for AI follow-up questions
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables (SOWs, Proposals)
CREATE TABLE IF NOT EXISTS public.deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID NOT NULL REFERENCES public.engagements(id) ON DELETE CASCADE,
    
    -- Deliverable info
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sow', 'proposal', 'summary', 'report')),
    
    -- Content
    content JSONB NOT NULL, -- Structured content
    content_markdown TEXT, -- Rendered markdown
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_draft BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- AI Interactions Log (for learning and audit)
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Interaction details
    interaction_type TEXT NOT NULL, -- 'discovery', 'framework_recommend', 'scope_generate', 'chat'
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    
    -- Performance tracking
    latency_ms INTEGER,
    tokens_used INTEGER,
    model_used TEXT,
    
    -- Quality tracking
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_engagements_user_id ON public.engagements(user_id);
CREATE INDEX idx_engagements_status ON public.engagements(status);
CREATE INDEX idx_engagements_created_at ON public.engagements(created_at DESC);
CREATE INDEX idx_framework_templates_category ON public.framework_templates(category);
CREATE INDEX idx_framework_templates_slug ON public.framework_templates(slug);
CREATE INDEX idx_discovery_questions_category ON public.discovery_questions(category);
CREATE INDEX idx_deliverables_engagement_id ON public.deliverables(engagement_id);
CREATE INDEX idx_ai_interactions_engagement_id ON public.ai_interactions(engagement_id);
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Engagements: Users can only access their own engagements
CREATE POLICY "Users can view own engagements" ON public.engagements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own engagements" ON public.engagements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own engagements" ON public.engagements
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own engagements" ON public.engagements
    FOR DELETE USING (auth.uid() = user_id);

-- Deliverables: Access through engagement ownership
CREATE POLICY "Users can view own deliverables" ON public.deliverables
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.engagements 
            WHERE id = deliverables.engagement_id 
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create own deliverables" ON public.deliverables
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.engagements 
            WHERE id = engagement_id 
            AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update own deliverables" ON public.deliverables
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.engagements 
            WHERE id = deliverables.engagement_id 
            AND user_id = auth.uid()
        )
    );

-- AI Interactions: Users can only see their own
CREATE POLICY "Users can view own ai_interactions" ON public.ai_interactions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ai_interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Framework templates: Everyone can read system templates
CREATE POLICY "Anyone can view system templates" ON public.framework_templates
    FOR SELECT USING (is_system = TRUE OR created_by = auth.uid());

-- Discovery questions: Everyone can read
CREATE POLICY "Anyone can view discovery questions" ON public.discovery_questions
    FOR SELECT USING (TRUE);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_engagements_updated_at
    BEFORE UPDATE ON public.engagements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON public.deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA: Framework Templates
-- ============================================

INSERT INTO public.framework_templates (name, slug, description, category, node_template) VALUES
(
    'SWOT Analysis',
    'swot',
    'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    'strategy',
    '{
        "type": "swot",
        "sections": [
            {"id": "strengths", "label": "Strengths", "color": "#22c55e", "position": {"x": 0, "y": 0}},
            {"id": "weaknesses", "label": "Weaknesses", "color": "#ef4444", "position": {"x": 300, "y": 0}},
            {"id": "opportunities", "label": "Opportunities", "color": "#3b82f6", "position": {"x": 0, "y": 250}},
            {"id": "threats", "label": "Threats", "color": "#f59e0b", "position": {"x": 300, "y": 250}}
        ]
    }'
),
(
    'Porter''s Five Forces',
    'porter-five-forces',
    'Analyze competitive forces in an industry',
    'strategy',
    '{
        "type": "porter",
        "sections": [
            {"id": "rivalry", "label": "Competitive Rivalry", "color": "#8b5cf6", "position": {"x": 200, "y": 150}},
            {"id": "suppliers", "label": "Supplier Power", "color": "#06b6d4", "position": {"x": 0, "y": 150}},
            {"id": "buyers", "label": "Buyer Power", "color": "#10b981", "position": {"x": 400, "y": 150}},
            {"id": "substitutes", "label": "Threat of Substitutes", "color": "#f97316", "position": {"x": 200, "y": 300}},
            {"id": "entrants", "label": "Threat of New Entrants", "color": "#ec4899", "position": {"x": 200, "y": 0}}
        ]
    }'
),
(
    'McKinsey 7-S',
    'mckinsey-7s',
    'Analyze organizational effectiveness across 7 elements',
    'strategy',
    '{
        "type": "mckinsey7s",
        "sections": [
            {"id": "strategy", "label": "Strategy", "color": "#6366f1", "position": {"x": 200, "y": 0}},
            {"id": "structure", "label": "Structure", "color": "#8b5cf6", "position": {"x": 350, "y": 80}},
            {"id": "systems", "label": "Systems", "color": "#a855f7", "position": {"x": 350, "y": 200}},
            {"id": "shared_values", "label": "Shared Values", "color": "#d946ef", "position": {"x": 200, "y": 140}},
            {"id": "style", "label": "Style", "color": "#ec4899", "position": {"x": 200, "y": 280}},
            {"id": "staff", "label": "Staff", "color": "#f43f5e", "position": {"x": 50, "y": 200}},
            {"id": "skills", "label": "Skills", "color": "#ef4444", "position": {"x": 50, "y": 80}}
        ]
    }'
),
(
    'Business Model Canvas',
    'business-model-canvas',
    'Map out the key components of a business model',
    'strategy',
    '{
        "type": "bmc",
        "sections": [
            {"id": "key_partners", "label": "Key Partners", "color": "#8b5cf6", "position": {"x": 0, "y": 0}},
            {"id": "key_activities", "label": "Key Activities", "color": "#6366f1", "position": {"x": 150, "y": 0}},
            {"id": "key_resources", "label": "Key Resources", "color": "#3b82f6", "position": {"x": 150, "y": 150}},
            {"id": "value_props", "label": "Value Propositions", "color": "#22c55e", "position": {"x": 300, "y": 0}},
            {"id": "customer_relationships", "label": "Customer Relationships", "color": "#10b981", "position": {"x": 450, "y": 0}},
            {"id": "channels", "label": "Channels", "color": "#14b8a6", "position": {"x": 450, "y": 150}},
            {"id": "customer_segments", "label": "Customer Segments", "color": "#06b6d4", "position": {"x": 600, "y": 0}},
            {"id": "cost_structure", "label": "Cost Structure", "color": "#ef4444", "position": {"x": 0, "y": 300}},
            {"id": "revenue_streams", "label": "Revenue Streams", "color": "#f59e0b", "position": {"x": 400, "y": 300}}
        ]
    }'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Discovery Questions
-- ============================================

INSERT INTO public.discovery_questions (question, description, category, question_type, sort_order, is_required, ai_context) VALUES
-- Business Context
('What is the client''s primary business or industry?', 'Understanding the client''s core business helps frame the engagement.', 'business_context', 'text', 1, TRUE, 'Use this to understand industry-specific challenges and terminology.'),
('What is the approximate company size?', 'Employee count and revenue range', 'business_context', 'select', 2, TRUE, 'Company size affects solution complexity and resource requirements.'),
('Who are the key stakeholders for this engagement?', 'Names, roles, and their involvement level', 'business_context', 'text', 3, TRUE, 'Stakeholder mapping is critical for engagement success.'),

-- Problem Definition
('What is the primary challenge or opportunity the client wants to address?', 'The core reason for this engagement', 'problem_definition', 'text', 10, TRUE, 'This is the central problem statement that drives the engagement.'),
('What has the client already tried to address this?', 'Previous initiatives, solutions, or approaches', 'problem_definition', 'text', 11, FALSE, 'Understanding past attempts prevents repeating failures.'),
('What does success look like for the client?', 'Specific outcomes or metrics they want to achieve', 'problem_definition', 'text', 12, TRUE, 'Success criteria should be measurable and time-bound.'),

-- Constraints
('What is the expected timeline for this engagement?', 'Weeks, months, or specific deadlines', 'constraints', 'text', 20, TRUE, 'Timeline affects scope and approach significantly.'),
('What is the approximate budget range?', 'Budget constraints help scope the engagement appropriately', 'constraints', 'select', 21, FALSE, 'Budget determines team size and solution sophistication.'),
('Are there any technical or organizational constraints?', 'Systems, processes, or policies that limit options', 'constraints', 'text', 22, FALSE, 'Constraints often define what solutions are viable.'),

-- Success Criteria
('How will success be measured?', 'KPIs, metrics, or qualitative measures', 'success_criteria', 'text', 30, TRUE, 'Measurable success criteria enable clear deliverables.'),
('What are the risks if this engagement fails?', 'Business impact of not solving the problem', 'success_criteria', 'text', 31, FALSE, 'Risk assessment helps prioritize and justify investment.')

ON CONFLICT DO NOTHING;
