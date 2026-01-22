import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { handleApiError } from "@/lib/api-utils";
import {
  createEngagementSchema,
  validateInput,
} from "@/lib/validations/engagement";

// GET /api/engagements - List user's engagements
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = new EngagementService(supabase);
    const engagements = await service.list(user.id);

    return NextResponse.json({ engagements });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/engagements - Create new engagement
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
    const input = validateInput(createEngagementSchema, body);

    const service = new EngagementService(supabase);
    const engagement = await service.create(user.id, input);

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
