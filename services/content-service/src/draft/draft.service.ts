import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Draft, DraftDocument, DraftStatus } from './entities/draft.entity';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { DraftResponseDto } from './dto/draft-response.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class DraftService {
  constructor(
    @InjectModel(Draft.name)
    private draftModel: Model<DraftDocument>,
  ) {}

  /**
   * Create a new draft
   */
  async create(createDraftDto: CreateDraftDto): Promise<DraftResponseDto> {
    // Check if slug already exists
    const existing = await this.draftModel.findOne({ slug: createDraftDto.slug });
    if (existing) {
      throw new ConflictException(`Draft with slug '${createDraftDto.slug}' already exists`);
    }

    // Generate preview token
    const previewToken = this.generatePreviewToken();

    const draft = new this.draftModel({
      ...createDraftDto,
      previewToken,
      lastSavedAt: new Date(),
    });

    const saved = await draft.save();
    return this.mapToResponse(saved);
  }

  /**
   * Find all drafts with filtering and pagination
   */
  async findAll(
    status?: DraftStatus,
    authorId?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    drafts: DraftResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter: { status?: DraftStatus; authorId?: string } = {};
    if (status) filter.status = status;
    if (authorId) filter.authorId = authorId;

    const skip = (page - 1) * limit;

    const [drafts, total] = await Promise.all([
      this.draftModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
      this.draftModel.countDocuments(filter),
    ]);

    return {
      drafts: drafts.map((d) => this.mapToResponse(d)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find draft by ID
   */
  async findOne(id: string): Promise<DraftResponseDto> {
    const draft = await this.draftModel.findById(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }
    return this.mapToResponse(draft);
  }

  /**
   * Find draft by slug
   */
  async findBySlug(slug: string): Promise<DraftResponseDto> {
    const draft = await this.draftModel.findOne({ slug });
    if (!draft) {
      throw new NotFoundException(`Draft with slug '${slug}' not found`);
    }
    return this.mapToResponse(draft);
  }

  /**
   * Update draft (also used for auto-save)
   */
  async update(
    id: string,
    updateDraftDto: UpdateDraftDto,
    userId?: string,
  ): Promise<DraftResponseDto> {
    const draft = await this.draftModel.findById(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }

    // Check slug uniqueness if changed
    if (updateDraftDto.slug && updateDraftDto.slug !== draft.slug) {
      const existing = await this.draftModel.findOne({ slug: updateDraftDto.slug });
      if (existing) {
        throw new ConflictException(`Draft with slug '${updateDraftDto.slug}' already exists`);
      }
    }

    // Increment version if content changed
    if (updateDraftDto.content && updateDraftDto.content !== draft.content) {
      draft.version += 1;
    }

    // Update fields
    Object.assign(draft, updateDraftDto);
    draft.lastSavedAt = new Date();
    if (userId) {
      draft.lastSavedBy = userId;
    }

    const updated = await draft.save();
    return this.mapToResponse(updated);
  }

  /**
   * Auto-save draft (lightweight update)
   * This is called frequently, so we only update essential fields
   */
  async autoSave(id: string, content: string, userId?: string): Promise<DraftResponseDto> {
    const draft = await this.draftModel.findById(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }

    // Only update content and timestamps
    draft.content = content;
    draft.lastSavedAt = new Date();
    if (userId) {
      draft.lastSavedBy = userId;
    }

    const updated = await draft.save();
    return this.mapToResponse(updated);
  }

  /**
   * Delete draft
   */
  async remove(id: string): Promise<void> {
    const result = await this.draftModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }
  }

  /**
   * Update draft status
   */
  async updateStatus(id: string, status: DraftStatus): Promise<DraftResponseDto> {
    const draft = await this.draftModel.findById(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }

    draft.status = status;
    const updated = await draft.save();
    return this.mapToResponse(updated);
  }

  /**
   * Generate preview URL token
   */
  private generatePreviewToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Get preview URL for draft
   */
  async getPreviewUrl(id: string): Promise<string> {
    const draft = await this.draftModel.findById(id);
    if (!draft) {
      throw new NotFoundException(`Draft with ID ${id} not found`);
    }

    // Regenerate token if not exists
    if (!draft.previewToken) {
      draft.previewToken = this.generatePreviewToken();
      await draft.save();
    }

    // In production, this would be your actual domain
    const baseUrl = process.env.PREVIEW_URL || 'http://localhost:3000';
    return `${baseUrl}/preview/${draft.slug}?token=${draft.previewToken}`;
  }

  /**
   * Verify preview token
   */
  async verifyPreviewToken(slug: string, token: string): Promise<boolean> {
    const draft = await this.draftModel.findOne({ slug, previewToken: token });
    return !!draft;
  }

  /**
   * Get drafts by status
   */
  async findByStatus(status: DraftStatus, limit = 50): Promise<DraftResponseDto[]> {
    const drafts = await this.draftModel.find({ status }).sort({ updatedAt: -1 }).limit(limit);
    return drafts.map((d) => this.mapToResponse(d));
  }

  /**
   * Get recently modified drafts
   */
  async getRecentlyModified(limit = 10): Promise<DraftResponseDto[]> {
    const drafts = await this.draftModel.find().sort({ lastSavedAt: -1 }).limit(limit);
    return drafts.map((d) => this.mapToResponse(d));
  }

  /**
   * Get drafts count by status
   */
  async getCountByStatus(): Promise<Record<DraftStatus, number>> {
    const results = await this.draftModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<DraftStatus, number> = {
      [DraftStatus.DRAFT]: 0,
      [DraftStatus.IN_REVIEW]: 0,
      [DraftStatus.SCHEDULED]: 0,
      [DraftStatus.PUBLISHED]: 0,
      [DraftStatus.ARCHIVED]: 0,
    };

    results.forEach((r) => {
      counts[r._id as DraftStatus] = r.count;
    });

    return counts;
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(draft: DraftDocument): DraftResponseDto {
    return {
      id: draft._id.toString(),
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      content: draft.content,
      contentType: draft.contentType,
      status: draft.status,
      tags: draft.tags,
      concepts: draft.concepts,
      category: draft.category,
      difficulty: draft.difficulty,
      version: draft.version,
      authorId: draft.authorId,
      lastSavedAt: draft.lastSavedAt,
      lastSavedBy: draft.lastSavedBy,
      publishedContentId: draft.publishedContentId,
      scheduledPublishAt: draft.scheduledPublishAt,
      metadata: draft.metadata,
      previewToken: draft.previewToken,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      canonicalUrl: draft.canonicalUrl,
      featuredImageUrl: draft.featuredImageUrl,
      createdAt: draft.createdAt || new Date(),
      updatedAt: draft.updatedAt || new Date(),
    };
  }
}
