# Environment Variables Reference

Last updated: 2026-01-20

---

## Overview

This document describes all environment variables used in the Consulting Framer app across all deployment phases. Variables are organized by phase to help you understand what's needed now vs. what's coming in future releases.

**Quick Navigation:**
- [Phase 1 (MVP)](#phase-1-mvp---currently-required) - Required now ✅
- [Phase 2 (Billing)](#phase-2-billing---planned) - Planned for monetization 📋
- [Phase 3 (Delivery)](#phase-3-delivery---planned) - Planned for SOW generation 📋
- [Development vs Production](#development-vs-production)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Reference Table

| Variable | Phase | Required | Type | Description |
|----------|-------|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 1 | Yes | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1 | Yes | Public | Supabase anonymous/public key |
| `ANTHROPIC_API_KEY` | 1 | Yes* | Secret | Claude API key for AI features |
| `NEXT_PUBLIC_POSTHOG_KEY` | 1 | No | Public | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | 1 | No | Public | PostHog analytics endpoint |
| `SUPABASE_SERVICE_ROLE_KEY` | 2 | Yes | Secret | Admin database access (bypasses RLS) |
| `NEXT_PUBLIC_APP_URL` | 2 | Yes | Public | Application base URL for redirects |
| `STRIPE_SECRET_KEY` | 2 | Yes | Secret | Stripe secret key for billing |
| `STRIPE_WEBHOOK_SECRET` | 2 | Yes | Secret | Stripe webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 2 | Yes | Public | Stripe publishable key for frontend |
| `STRIPE_PRICE_PRO_MONTHLY` | 2 | Yes | Secret | Stripe price ID for Pro monthly tier |
| `STRIPE_PRICE_PRO_YEARLY` | 2 | Yes | Secret | Stripe price ID for Pro yearly tier |
| `STRIPE_PRICE_TEAM_MONTHLY` | 2 | Yes | Secret | Stripe price ID for Team monthly tier |
| `STRIPE_PRICE_TEAM_YEARLY` | 2 | Yes | Secret | Stripe price ID for Team yearly tier |
| `INNGEST_EVENT_KEY` | 3 | Yes | Secret | Inngest event authentication key |
| `INNGEST_SIGNING_KEY` | 3 | Yes | Secret | Inngest webhook signature verification |

\* Required for AI features; app falls back to mock mode if missing

---

## Phase 1 (MVP) - Currently Required

These variables are needed for the current MVP implementation.

### NEXT_PUBLIC_SUPABASE_URL

- **Type:** Public (safe to expose to browser)
- **Format:** `https://your-project-id.supabase.co`
- **Where to Get:**
  1. Go to [Supabase Dashboard](https://app.supabase.com)
  2. Select your project
  3. Navigate to Settings > API
  4. Copy "Project URL"
- **Used In:**
  - `src/lib/supabase/client.ts` - Browser client initialization
  - `src/lib/supabase/server.ts` - Server client initialization
- **Required:** Yes
- **Example:** `https://abcdefghijklmnop.supabase.co`

---

### NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Type:** Public (safe to expose to browser)
- **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **Where to Get:**
  1. Go to Supabase Dashboard > Settings > API
  2. Copy "anon" key under "Project API keys" (NOT service_role)
- **Used In:**
  - `src/lib/supabase/client.ts` - Browser authentication
  - `src/lib/supabase/server.ts` - Server-side requests
- **Required:** Yes
- **Security:** This key is safe to expose - Row Level Security (RLS) policies protect your data
- **Note:** Don't confuse this with the `service_role` key (which should never be exposed)

---

### ANTHROPIC_API_KEY

- **Type:** Secret (⚠️ SERVER ONLY - never expose to browser)
- **Format:** `sk-ant-api03-...` (new Claude API format)
- **Where to Get:**
  1. Go to [Anthropic Console](https://console.anthropic.com/account/keys)
  2. Create a new API key
  3. Copy the key (starts with `sk-ant-`)
- **Used In:**
  - `src/lib/ai/service.ts` - All AI service functions
  - `src/app/api/ai/discovery/route.ts` - Discovery API endpoint
- **Required:** Yes for AI features (app falls back to mock questions if missing)
- **Fallback Behavior:** If not set, discovery panel will use hardcoded questions without AI follow-ups
- **Security:** Never commit this key or expose it to client-side code

---

### NEXT_PUBLIC_POSTHOG_KEY

- **Type:** Public (safe for browser)
- **Format:** `phc_...` (PostHog project key)
- **Where to Get:**
  1. Go to [PostHog Dashboard](https://app.posthog.com)
  2. Navigate to Project Settings
  3. Copy "Project API Key"
- **Used In:** Analytics tracking (optional)
- **Required:** No (analytics are optional)
- **Default:** Empty string (analytics disabled)

---

### NEXT_PUBLIC_POSTHOG_HOST

- **Type:** Public (safe for browser)
- **Format:** `https://app.posthog.com` or self-hosted URL
- **Where to Get:** Use `https://app.posthog.com` for PostHog Cloud, or your self-hosted URL
- **Used In:** Analytics endpoint configuration
- **Required:** No (only if using PostHog)
- **Default:** Empty string

---

## Phase 2 (Billing) - Planned

These variables will be required when billing and subscription features are implemented.

### SUPABASE_SERVICE_ROLE_KEY

- **Type:** Secret (⚠️ EXTREMELY SENSITIVE - SERVER ONLY)
- **Format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **Where to Get:**
  1. Go to Supabase Dashboard > Settings > API
  2. Copy "service_role" key under "Project API keys"
- **Used In:** Background jobs, admin operations that need to bypass RLS
- **Required:** Yes for Phase 2+
- **Security:**
  - ⚠️ **CRITICAL:** This key bypasses all Row Level Security policies
  - Never expose to browser or client-side code
  - Only use in server-side contexts (API routes, background jobs)
  - Treat with same care as database root password

---

### NEXT_PUBLIC_APP_URL

- **Type:** Public
- **Format:** Full URL including protocol
- **Examples:**
  - Development: `http://localhost:3000`
  - Production: `https://yourapp.com`
- **Used In:** Redirect URLs, webhook callbacks, email links
- **Required:** Yes for Phase 2+ (needed for Stripe redirects)
- **Note:** Must match the URL configured in Stripe Dashboard

---

### STRIPE_SECRET_KEY

- **Type:** Secret (⚠️ SERVER ONLY)
- **Format:**
  - Test: `sk_test_...`
  - Live: `sk_live_...`
- **Where to Get:**
  1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
  2. Navigate to Developers > API keys
  3. Copy "Secret key" (use test key for development)
- **Used In:** Backend billing operations, subscription management
- **Required:** Yes for Phase 2+
- **Security:** Never expose to client-side code

---

### STRIPE_WEBHOOK_SECRET

- **Type:** Secret (⚠️ SERVER ONLY)
- **Format:** `whsec_...`
- **Where to Get:**
  1. Go to Stripe Dashboard > Developers > Webhooks
  2. Add endpoint: `https://yourapp.com/api/webhooks/stripe`
  3. Copy "Signing secret"
- **Used In:** Webhook signature verification
- **Required:** Yes for Phase 2+
- **Purpose:** Ensures webhook requests are actually from Stripe

---

### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

- **Type:** Public (safe for browser)
- **Format:**
  - Test: `pk_test_...`
  - Live: `pk_live_...`
- **Where to Get:**
  1. Go to Stripe Dashboard > Developers > API keys
  2. Copy "Publishable key"
- **Used In:** Frontend payment UI, Stripe Elements
- **Required:** Yes for Phase 2+
- **Security:** Safe to expose - this is the public key

---

### STRIPE_PRICE_PRO_MONTHLY

- **Type:** Secret (server-side preferred for security)
- **Format:** `price_...` (Stripe Price ID)
- **Where to Get:**
  1. Go to Stripe Dashboard > Products
  2. Create "Pro Monthly" product ($49/month)
  3. Copy the Price ID
- **Used In:** Subscription creation, tier validation
- **Required:** Yes for Phase 2+
- **Note:** Create separate test and live price IDs

---

### STRIPE_PRICE_PRO_YEARLY

- **Type:** Secret (server-side preferred)
- **Format:** `price_...`
- **Where to Get:** Create "Pro Yearly" product in Stripe Dashboard ($470/year - ~20% discount)
- **Required:** Yes for Phase 2+

---

### STRIPE_PRICE_TEAM_MONTHLY

- **Type:** Secret (server-side preferred)
- **Format:** `price_...`
- **Where to Get:** Create "Team Monthly" product in Stripe Dashboard ($149/month)
- **Required:** Yes for Phase 2+

---

### STRIPE_PRICE_TEAM_YEARLY

- **Type:** Secret (server-side preferred)
- **Format:** `price_...`
- **Where to Get:** Create "Team Yearly" product in Stripe Dashboard ($1,430/year - ~20% discount)
- **Required:** Yes for Phase 2+

---

## Phase 3 (Delivery) - Planned

These variables will be required for background job processing (SOW generation).

### INNGEST_EVENT_KEY

- **Type:** Secret (⚠️ SERVER ONLY)
- **Format:** Custom key from Inngest dashboard
- **Where to Get:**
  1. Go to [Inngest Dashboard](https://app.inngest.com)
  2. Navigate to your app settings
  3. Copy "Event Key"
- **Used In:** Background job queuing, SOW generation triggers
- **Required:** Yes for Phase 3+
- **Purpose:** Authenticate event submissions to Inngest

---

### INNGEST_SIGNING_KEY

- **Type:** Secret (⚠️ SERVER ONLY)
- **Format:** Custom signing key from Inngest
- **Where to Get:**
  1. Go to Inngest Dashboard > Settings
  2. Copy "Signing Key"
- **Used In:** Webhook signature verification for job callbacks
- **Required:** Yes for Phase 3+
- **Purpose:** Verify incoming webhook requests from Inngest

---

## Development vs. Production

### Development Setup (`.env.local`)

```bash
# Supabase - Use dev project or local instance
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key

# Anthropic - Same key works for dev/prod (monitor usage)
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# App URL - Localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe - Use TEST keys (safe to experiment)
STRIPE_SECRET_KEY=sk_test_your-test-key
STRIPE_WEBHOOK_SECRET=whsec_test_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key

# Stripe Price IDs - Test mode products
STRIPE_PRICE_PRO_MONTHLY=price_test_pro_monthly_id
STRIPE_PRICE_PRO_YEARLY=price_test_pro_yearly_id
STRIPE_PRICE_TEAM_MONTHLY=price_test_team_monthly_id
STRIPE_PRICE_TEAM_YEARLY=price_test_team_yearly_id

# Inngest - Use development workspace
INNGEST_EVENT_KEY=test_event_key
INNGEST_SIGNING_KEY=test_signing_key
```

### Production Setup (Vercel/Deployment Platform)

```bash
# Supabase - Use production project
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Anthropic - Monitor usage carefully
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# App URL - Actual domain
NEXT_PUBLIC_APP_URL=https://consultingframer.com

# Stripe - Use LIVE keys (⚠️ real money!)
STRIPE_SECRET_KEY=sk_live_your-live-key
STRIPE_WEBHOOK_SECRET=whsec_live_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key

# Stripe Price IDs - Live mode products
STRIPE_PRICE_PRO_MONTHLY=price_live_pro_monthly_id
STRIPE_PRICE_PRO_YEARLY=price_live_pro_yearly_id
STRIPE_PRICE_TEAM_MONTHLY=price_live_team_monthly_id
STRIPE_PRICE_TEAM_YEARLY=price_live_team_yearly_id

# Inngest - Production workspace
INNGEST_EVENT_KEY=prod_event_key
INNGEST_SIGNING_KEY=prod_signing_key
```

**Important Production Notes:**
- Set all environment variables in your deployment platform (Vercel > Settings > Environment Variables)
- Ensure `NEXT_PUBLIC_*` variables are available at build time
- Keep production and development projects completely separate in Supabase and Stripe
- Use different Anthropic API keys for dev/prod to track usage separately

---

## Security Best Practices

### 1. Never Commit Secrets to Git

```bash
# ✅ Good - use .env.local (already in .gitignore)
.env.local

# ❌ Bad - these will be committed
.env
config.js with hardcoded keys
```

### 2. Rotate Keys If Exposed

If any secret key is accidentally committed or exposed:

1. **Supabase Service Role Key:**
   - Go to Dashboard > Settings > API
   - Click "Reset" on service_role key
   - Update all deployments immediately

2. **Anthropic API Key:**
   - Go to Console > Account > Keys
   - Delete exposed key
   - Create new key and update deployments

3. **Stripe Secret Key:**
   - Go to Dashboard > Developers > API keys
   - Roll to new key
   - Update webhook endpoints if needed

### 3. Validate Environment Variables at Startup

Consider adding runtime validation (future enhancement):

```typescript
// src/lib/env-validation.ts (example)
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
  // ... more validations
});

envSchema.parse(process.env); // Throws if invalid
```

### 4. Use Separate Keys Per Environment

- ✅ Supabase: Separate dev/staging/prod projects
- ✅ Stripe: Test mode vs. Live mode
- ✅ Inngest: Separate development/production workspaces
- ✅ Anthropic: Separate keys for cost tracking

### 5. Principle of Least Privilege

- Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side (protected by RLS)
- Only use `SUPABASE_SERVICE_ROLE_KEY` when absolutely necessary
- Never expose service role key to browser

---

## Troubleshooting

### "Cannot connect to Supabase"

**Check:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://project-id.supabase.co` (no trailing slash)
2. Look for trailing/leading whitespace in `.env.local`
3. Ensure you copied the correct anon key (not service_role key)
4. Restart dev server: `pnpm dev`

**Fix:**
```bash
# Verify format
echo $NEXT_PUBLIC_SUPABASE_URL
# Should be: https://abcdef.supabase.co

# Check for whitespace
cat .env.local | grep SUPABASE
```

---

### "401 Unauthorized" from Supabase

**Likely Cause:** Wrong anon key or RLS policies blocking access

**Check:**
1. Verify you're using `anon` key (starts with `eyJhbGc...`)
2. Check RLS policies in Supabase Dashboard > Authentication > Policies
3. Verify database schema is initialized: `pnpm db:migrate`

---

### "Anthropic API error" or AI Features Not Working

**Check:**
1. Verify key format: Should start with `sk-ant-api03-` (new format)
2. Check API key is valid in [Anthropic Console](https://console.anthropic.com/account/keys)
3. Verify API key has available credits

**Fallback:** App will use mock discovery questions if `ANTHROPIC_API_KEY` is missing

---

### "Missing Environment Variable" Errors

**Common Issues:**
1. File is named `.env` instead of `.env.local`
2. Variables need quotes (only if value contains spaces):
   ```bash
   # ✅ No quotes needed
   NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co

   # ❌ Don't add unnecessary quotes
   NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
   ```
3. Dev server not restarted after adding variables

**Fix:** Always restart dev server after changing `.env.local`

---

### Stripe Webhook Signature Verification Fails

**Check:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint secret in Stripe Dashboard
2. Ensure webhook URL in Stripe matches your deployed app URL
3. Check that you're using the correct environment (test vs. live)

**Testing Webhooks Locally:**
```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret shown in output to STRIPE_WEBHOOK_SECRET
```

---

### Environment Variables Not Available in Browser

**Remember:** Only variables prefixed with `NEXT_PUBLIC_` are available in browser JavaScript.

```typescript
// ✅ Available in browser
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

// ❌ undefined in browser (server-only)
console.log(process.env.ANTHROPIC_API_KEY);
```

---

## Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started/local-development)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Inngest Documentation](https://www.inngest.com/docs)

---

**Need Help?** Check the main [README troubleshooting section](../README.md#-troubleshooting) or [open an issue](https://github.com/yourname/consulting-framer/issues).
