import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileService } from "@/services/profile.service";
import { handleApiError } from "@/lib/api-utils";
import {
  updateProfileSchema,
  validateInput,
} from "@/lib/validations/profile";

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = new ProfileService(supabase);
    const profile = await service.getProfile(user.id);

    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input = validateInput(updateProfileSchema, body);

    const service = new ProfileService(supabase);
    const profile = await service.updateProfile(user.id, input);

    return NextResponse.json({ profile });
  } catch (error) {
    return handleApiError(error);
  }
}
