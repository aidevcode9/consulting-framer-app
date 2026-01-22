import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { handleApiError } from "@/lib/api-utils";

// GET /api/engagements/[id] - Get single engagement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = new EngagementService(supabase);
    const engagement = await service.getById(user.id, id);

    return NextResponse.json({ engagement });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/engagements/[id] - Update engagement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const service = new EngagementService(supabase);
    const engagement = await service.update(user.id, id, body);

    return NextResponse.json({ engagement });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/engagements/[id] - Delete engagement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = new EngagementService(supabase);
    await service.delete(user.id, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
