import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DraftContentType, DraftStatus } from '../entities/draft.entity';

export class DraftResponseDto {
  @ApiProperty({
    description: 'Draft unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Draft title',
    example: 'Getting Started with TypeScript',
  })
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'getting-started-typescript',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Brief description',
  })
  description?: string;

  @ApiProperty({
    description: 'Main content body',
  })
  content: string;

  @ApiProperty({
    description: 'Content type',
    enum: DraftContentType,
  })
  contentType: DraftContentType;

  @ApiProperty({
    description: 'Draft status',
    enum: DraftStatus,
  })
  status: DraftStatus;

  @ApiProperty({
    description: 'Tags',
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Concepts',
    type: [String],
  })
  concepts: string[];

  @ApiPropertyOptional({
    description: 'Category',
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Difficulty level',
  })
  difficulty?: string;

  @ApiProperty({
    description: 'Version number',
    example: 1,
  })
  version: number;

  @ApiPropertyOptional({
    description: 'Author ID',
  })
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Last saved timestamp',
  })
  lastSavedAt?: Date;

  @ApiPropertyOptional({
    description: 'Last saved by user ID',
  })
  lastSavedBy?: string;

  @ApiPropertyOptional({
    description: 'Published content ID (PostgreSQL)',
  })
  publishedContentId?: string;

  @ApiPropertyOptional({
    description: 'Scheduled publish date',
  })
  scheduledPublishAt?: Date;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Preview token for generating preview URLs',
  })
  previewToken?: string;

  @ApiPropertyOptional({
    description: 'SEO title',
  })
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO description',
  })
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'Canonical URL',
  })
  canonicalUrl?: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
  })
  featuredImageUrl?: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
