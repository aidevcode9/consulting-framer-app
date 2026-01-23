import { SupabaseClient } from "@supabase/supabase-js";
import { ProfileRepository, UpdateProfileInput } from "@/repositories/profile.repo";
import { NotFoundError } from "@/lib/errors";
import type { Profile } from "@/types";

export class ProfileService {
  private repo: ProfileRepository;

  constructor(private supabase: SupabaseClient) {
    this.repo = new ProfileRepository(supabase);
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.repo.findById(userId);

    if (!profile) {
      throw new NotFoundError("Profile");
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<Profile> {
    // Verify profile exists first
    await this.getProfile(userId);

    return this.repo.update(userId, input);
  }
}
