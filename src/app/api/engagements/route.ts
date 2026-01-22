import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EngagementService } from "@/services/engagement.service";
import { handleApiError } from "@/lib/api-utils";

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
    const { title, client_name, client_industry, description } = body;

    if (!title || !client_name) {
      return NextResponse.json(
        { error: "Title and client name are required" },
        { status: 400 }
      );
    }

    const service = new EngagementService(supabase);
    const engagement = await service.create(user.id, {
      title,
      client_name,
      client_industry,
      description,
    });

    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
