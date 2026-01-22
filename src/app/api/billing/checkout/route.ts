/**
 * Checkout API Route
 * POST /api/billing/checkout - Create checkout session
 *
 * FR-902: Stripe integration
 * FR-904: Upgrade flow
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BillingService } from "@/services/billing.service";
import { handleApiError } from "@/lib/api-utils";

const checkoutSchema = z.object({
  tier: z.enum(["pro", "team"]),
  interval: z.enum(["monthly", "yearly"]),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tier, interval } = parsed.data;
    const billingService = new BillingService(supabase);
    const result = await billingService.createCheckout(user.id, tier, interval);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ redirect_url: result.redirect_url });
  } catch (error) {
    return handleApiError(error);
  }
}
