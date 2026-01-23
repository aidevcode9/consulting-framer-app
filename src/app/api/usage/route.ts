import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UsageService } from "@/services/usage.service";
import { handleApiError } from "@/lib/api-utils";

/**
 * GET /api/usage
 * Returns current usage information for the authenticated user
 * FR-903: Usage limits
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usageService = new UsageService(supabase);
    const usage = await usageService.getUsageInfo(user.id);

    return NextResponse.json({ usage });
  } catch (error) {
    return handleApiError(error);
  }
}
