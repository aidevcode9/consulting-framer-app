/**
 * Portal API Route
 * GET /api/billing/portal - Get billing portal URL
 *
 * FR-907: Billing portal
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
    const url = await billingService.getPortalUrl(user.id);

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
