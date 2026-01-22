import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { handleApiError } from "@/lib/api-utils";

// PATCH /api/engagements/[id]/canvas - Save canvas data (for auto-save)
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
    const { canvas_data } = body;

    if (!canvas_data) {
      return NextResponse.json(
        { error: "Canvas data is required" },
        { status: 400 }
      );
    }

    const service = new EngagementService(supabase);
    const engagement = await service.saveCanvas(user.id, id, canvas_data);

    return NextResponse.json({
      engagement,
      saved_at: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
