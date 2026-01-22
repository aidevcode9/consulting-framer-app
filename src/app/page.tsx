"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Lightbulb,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Consulting Framer
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI-Powered Engagement Framing
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
              Frame Consulting Engagements{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                75% Faster
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 text-xl text-gray-600">
              Visual canvas + consulting frameworks + AI discovery = 
              professional SOWs in hours, not days. Stop reinventing the wheel 
              on every engagement.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50">
                <Play className="h-5 w-5" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>500+ consultants</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>$2M+ proposals created</span>
              </div>
            </div>
          </div>

          {/* Hero Image - Canvas Preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-xl border bg-white shadow-2xl shadow-gray-200/50">
              <div className="flex items-center gap-1.5 border-b bg-gray-100 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-4 text-sm text-gray-500">Acme Corp Strategic Analysis</span>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <div className="flex h-full gap-4">
                  {/* Left Panel */}
                  <div className="w-56 rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-3 text-sm font-semibold text-gray-700">Frameworks</div>
                    <div className="space-y-2">
                      <div className="cursor-grab rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 hover:shadow">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          SWOT Analysis
                        </div>
                      </div>
                      <div className="cursor-grab rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-700 hover:shadow">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          Porter&apos;s 5 Forces
                        </div>
                      </div>
                      <div className="cursor-grab rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 hover:shadow">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-indigo-500" />
                          McKinsey 7-S
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Canvas Area */}
                  <div className="flex-1 rounded-lg bg-white/80 p-4 shadow-sm">
                    <div className="grid h-full grid-cols-2 gap-3">
                      <div className="rounded-lg bg-green-100 p-3">
                        <div className="text-xs font-bold text-green-700">Strengths</div>
                        <div className="mt-2 space-y-1">
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Market leader in segment</div>
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Strong brand recognition</div>
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Experienced team</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-red-100 p-3">
                        <div className="text-xs font-bold text-red-700">Weaknesses</div>
                        <div className="mt-2 space-y-1">
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Legacy tech stack</div>
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">High customer churn</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-blue-100 p-3">
                        <div className="text-xs font-bold text-blue-700">Opportunities</div>
                        <div className="mt-2 space-y-1">
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Emerging markets</div>
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Digital transformation</div>
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-100 p-3">
                        <div className="text-xs font-bold text-amber-700">Threats</div>
                        <div className="mt-2 space-y-1">
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">New competitors</div>
                          <div className="rounded bg-white/80 px-2 py-1 text-xs">Regulatory changes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Panel */}
                  <div className="w-64 rounded-lg bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      AI Discovery
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                        Based on your SWOT, I recommend addressing the legacy tech weakness through a phased modernization approach...
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 text-xs text-green-800">
                        <span className="font-semibold">Suggested deliverable:</span> Digital Transformation Roadmap with 3-phase implementation plan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              The Engagement Framing Problem
            </h2>
            <p className="text-lg text-gray-600">
              Every consultant knows this pain: spending 10-18 hours on discovery, 
              framework selection, and SOW drafting for each new engagement.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <PainPointCard
              icon={Clock}
              title="Time Drain"
              description="Hours spent recreating frameworks, formatting documents, and writing boilerplate content."
              stat="10-18 hrs"
              statLabel="per engagement"
            />
            <PainPointCard
              icon={MessageSquare}
              title="Inconsistent Discovery"
              description="Critical questions get missed. Scope creep starts before the project begins."
              stat="67%"
              statLabel="have scope issues"
            />
            <PainPointCard
              icon={FileText}
              title="Manual SOW Creation"
              description="Copy-pasting from old proposals, reformatting, hoping nothing is outdated."
              stat="4-6 hrs"
              statLabel="just on documents"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Features
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Everything You Need to Frame Engagements
            </h2>
            <p className="text-lg text-gray-600">
              A complete toolkit designed specifically for consultants, 
              combining visual thinking with AI-powered automation.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Visual Canvas"
              description="Drag-and-drop strategic frameworks onto an infinite canvas. Think visually, organize intuitively."
              color="blue"
            />
            <FeatureCard
              icon={Target}
              title="Consulting Frameworks"
              description="SWOT, Porter's 5 Forces, McKinsey 7-S, and more. Pre-built templates with best practices baked in."
              color="purple"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Discovery Copilot"
              description="Intelligent questions that uncover hidden requirements. Never miss a critical detail again."
              color="amber"
            />
            <FeatureCard
              icon={FileText}
              title="Auto-Generated SOWs"
              description="Turn your canvas analysis into professional Statements of Work with one click."
              color="green"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Framework Recommendations"
              description="AI suggests the right frameworks based on your discovery answers and engagement type."
              color="pink"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Export"
              description="Export to PDF, DOCX, or share a live link. Your deliverables, your way."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              How It Works
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              From Discovery to Deliverable in 4 Steps
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            <StepCard
              number={1}
              title="Start Discovery"
              description="Answer AI-guided questions about your client and their challenges."
            />
            <StepCard
              number={2}
              title="Select Frameworks"
              description="Get AI recommendations or choose from our library of consulting frameworks."
            />
            <StepCard
              number={3}
              title="Build on Canvas"
              description="Drag frameworks onto your canvas and fill in your analysis."
            />
            <StepCard
              number={4}
              title="Generate SOW"
              description="One click turns your work into a professional deliverable."
            />
          </div>
        </div>
      </section>

      {/* Time Savings */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Save 75% of Your Framing Time
                </h2>
                <p className="mb-8 text-lg text-blue-100">
                  What used to take 10-18 hours now takes 2.5-4 hours. 
                  That&apos;s an extra day per week you could spend on billable work.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <TimeSavingMetric before="4-6 hrs" after="30 min" label="Discovery" />
                  <TimeSavingMetric before="2-4 hrs" after="15 min" label="Framework Selection" />
                  <TimeSavingMetric before="4-8 hrs" after="1 hr" label="SOW Drafting" />
                  <TimeSavingMetric before="10-18 hrs" after="2.5-4 hrs" label="Total Time" />
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-white/10 p-8">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl font-bold">75%</div>
                      <div className="mt-2 text-xl text-blue-200">Time Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Pricing
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <PricingCard
              name="Starter"
              price="Free"
              description="Perfect for trying out the platform"
              features={[
                "3 engagements",
                "All frameworks",
                "Basic AI Discovery",
                "PDF export",
              ]}
              cta="Start Free"
              href="/signup"
            />
            <PricingCard
              name="Professional"
              price="$49"
              period="/month"
              description="For active consultants"
              features={[
                "Unlimited engagements",
                "All frameworks",
                "Advanced AI Discovery",
                "SOW generation",
                "DOCX & PDF export",
                "Priority support",
              ]}
              cta="Start Trial"
              href="/signup"
              featured
            />
            <PricingCard
              name="Team"
              price="$149"
              period="/month"
              description="For consulting firms"
              features={[
                "Everything in Pro",
                "5 team members",
                "Shared templates",
                "Team analytics",
                "SSO & admin controls",
                "Dedicated support",
              ]}
              cta="Contact Sales"
              href="/contact"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl bg-gray-900 p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Frame Engagements Faster?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
              Join 500+ consultants who&apos;ve already saved thousands of hours 
              with Consulting Framer. Start your free trial today.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-gray-900 hover:bg-gray-100"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Consulting Framer</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Contact</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2026 Consulting Framer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component: Pain Point Card
function PainPointCard({
  icon: Icon,
  title,
  description,
  stat,
  statLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
        <Icon className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mb-4 text-gray-600">{description}</p>
      <div className="border-t pt-4">
        <div className="text-2xl font-bold text-red-600">{stat}</div>
        <div className="text-sm text-gray-500">{statLabel}</div>
      </div>
    </div>
  );
}

// Component: Feature Card
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600" },
    amber: { bg: "bg-amber-100", icon: "text-amber-600" },
    green: { bg: "bg-green-100", icon: "text-green-600" },
    pink: { bg: "bg-pink-100", icon: "text-pink-600" },
    orange: { bg: "bg-orange-100", icon: "text-orange-600" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg}`}>
        <Icon className={`h-6 w-6 ${colors.icon}`} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Component: Step Card
function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {number < 4 && (
        <ChevronRight className="absolute right-0 top-6 hidden h-6 w-6 -translate-x-1/2 text-gray-300 md:block" />
      )}
    </div>
  );
}

// Component: Time Saving Metric
function TimeSavingMetric({
  before,
  after,
  label,
}: {
  before: string;
  after: string;
  label: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-blue-200 line-through">{before}</span>
        <ArrowRight className="h-3 w-3 text-blue-300" />
        <span className="font-semibold">{after}</span>
      </div>
      <div className="text-sm text-blue-200">{label}</div>
    </div>
  );
}

// Component: Pricing Card
function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  featured,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-8 ${
        featured
          ? "border-blue-600 bg-white ring-2 ring-blue-600"
          : "border-gray-200 bg-white"
      }`}
    >
      {featured && (
        <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-900">{name}</h3>
      <p className="mt-1 text-gray-500">{description}</p>
      <div className="mt-4">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {period && <span className="text-gray-500">{period}</span>}
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-8 block rounded-lg py-3 text-center font-medium ${
          featured
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
