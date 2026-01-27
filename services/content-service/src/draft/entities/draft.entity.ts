import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DraftDocument = Draft & Document;

export enum DraftStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in-review',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum DraftContentType {
  ARTICLE = 'article',
  TUTORIAL = 'tutorial',
  GUIDE = 'guide',
  DOCUMENTATION = 'documentation',
  BLOG_POST = 'blog-post',
}

@Schema({ timestamps: true })
export class Draft {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(DraftContentType),
    default: DraftContentType.ARTICLE,
  })
  contentType: DraftContentType;

  @Prop({
    type: String,
    enum: Object.values(DraftStatus),
    default: DraftStatus.DRAFT,
  })
  status: DraftStatus;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  concepts: string[];

  @Prop()
  category?: string;

  @Prop()
  difficulty?: string;

  @Prop({ default: 1 })
  version: number;

  @Prop()
  authorId?: string;

  @Prop()
  lastSavedAt?: Date;

  @Prop()
  lastSavedBy?: string;

  @Prop()
  publishedContentId?: string; // Reference to published content in PostgreSQL

  @Prop()
  scheduledPublishAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop()
  previewToken?: string; // For generating preview URLs

  // SEO fields
  @Prop()
  seoTitle?: string;

  @Prop()
  seoDescription?: string;

  @Prop()
  canonicalUrl?: string;

  @Prop()
  featuredImageUrl?: string;

  // Timestamps added automatically by mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const DraftSchema = SchemaFactory.createForClass(Draft);

// Index for faster queries
DraftSchema.index({ slug: 1 });
DraftSchema.index({ status: 1 });
DraftSchema.index({ authorId: 1 });
DraftSchema.index({ lastSavedAt: -1 });
DraftSchema.index({ createdAt: -1 });
