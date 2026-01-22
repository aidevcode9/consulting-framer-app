import { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, SubscriptionStatus } from "@/types";
import type { SubscriptionTier } from "@/lib/stripe/config";

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  company?: string;
  role?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateSubscriptionInput {
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at?: string | null;
}

export class ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async update(id: string, input: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubscription(
    id: string,
    input: UpdateSubscriptionInput
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
