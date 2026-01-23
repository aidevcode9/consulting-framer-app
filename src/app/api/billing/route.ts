/**
 * Billing API Route
 * GET /api/billing - Get subscription info
 *
 * FR-908: Usage display
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BillingService } from "@/services/billing.service";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const billingService = new BillingService(supabase);
    const subscription = await billingService.getSubscriptionInfo(user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
