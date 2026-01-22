import { SupabaseClient } from "@supabase/supabase-js";
import { EngagementRepository } from "@/repositories/engagement.repo";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import type {
  Engagement,
  CreateEngagementInput,
  UpdateEngagementInput,
  CanvasData,
} from "@/types";

export class EngagementService {
  private repo: EngagementRepository;

  constructor(private supabase: SupabaseClient) {
    this.repo = new EngagementRepository(supabase);
  }

  async list(userId: string): Promise<Engagement[]> {
    return this.repo.findByUserId(userId);
  }

  async getById(userId: string, engagementId: string): Promise<Engagement> {
    const engagement = await this.repo.findById(engagementId);

    if (!engagement) {
      throw new NotFoundError("Engagement not found");
    }

    // RLS should handle this, but double-check ownership
    if (engagement.user_id !== userId) {
      throw new ForbiddenError("Access denied to this engagement");
    }

    return engagement;
  }

  async create(
    userId: string,
    input: CreateEngagementInput
  ): Promise<Engagement> {
    // Could add usage limit checks here in the future
    return this.repo.create(userId, input);
  }

  async update(
    userId: string,
    engagementId: string,
    input: UpdateEngagementInput
  ): Promise<Engagement> {
    // Verify ownership first
    await this.getById(userId, engagementId);

    return this.repo.update(engagementId, input);
  }

  async saveCanvas(
    userId: string,
    engagementId: string,
    canvasData: CanvasData
  ): Promise<Engagement> {
    // Verify ownership first
    await this.getById(userId, engagementId);

    return this.repo.updateCanvasData(engagementId, canvasData);
  }

  async saveDiscoveryAnswers(
    userId: string,
    engagementId: string,
    answers: Record<string, unknown>,
    completed: boolean
  ): Promise<Engagement> {
    // Verify ownership first
    await this.getById(userId, engagementId);

    return this.repo.updateDiscoveryAnswers(engagementId, answers, completed);
  }

  async delete(userId: string, engagementId: string): Promise<void> {
    // Verify ownership first
    await this.getById(userId, engagementId);

    return this.repo.delete(engagementId);
  }
}
