import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Engagement,
  CreateEngagementInput,
  UpdateEngagementInput,
  CanvasData,
} from "@/types";

export class EngagementRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Engagement | null> {
    const { data, error } = await this.supabase
      .from("engagements")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async findByUserId(userId: string): Promise<Engagement[]> {
    const { data, error } = await this.supabase
      .from("engagements")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(
    userId: string,
    input: CreateEngagementInput
  ): Promise<Engagement> {
    const { data, error } = await this.supabase
      .from("engagements")
      .insert({
        user_id: userId,
        title: input.title,
        client_name: input.client_name,
        client_industry: input.client_industry || null,
        description: input.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    input: UpdateEngagementInput
  ): Promise<Engagement> {
    const { data, error } = await this.supabase
      .from("engagements")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCanvasData(
    id: string,
    canvasData: CanvasData
  ): Promise<Engagement> {
    const { data, error } = await this.supabase
      .from("engagements")
      .update({ canvas_data: canvasData })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDiscoveryAnswers(
    id: string,
    answers: Record<string, unknown>,
    completed: boolean
  ): Promise<Engagement> {
    const { data, error } = await this.supabase
      .from("engagements")
      .update({
        discovery_answers: answers,
        discovery_completed: completed,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("engagements")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
