import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentStatus, ContentDifficulty } from '../entities/content.entity';

export class ContentResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  id: string;

  @ApiProperty({ example: 'Getting Started with TypeScript' })
  title: string;

  @ApiProperty({ example: 'getting-started-with-typescript' })
  slug: string;

  @ApiPropertyOptional({ example: 'A comprehensive guide to TypeScript fundamentals' })
  description?: string;

  @ApiProperty({ enum: ContentType, example: ContentType.ARTICLE })
  contentType: ContentType;

  @ApiProperty({ enum: ContentStatus, example: ContentStatus.DRAFT })
  status: ContentStatus;

  @ApiProperty({ example: 'user-uuid-here' })
  authorId: string;

  @ApiPropertyOptional({ example: ['typescript', 'javascript'] })
  tags?: string[];

  @ApiPropertyOptional({ example: ['programming-basics'] })
  concepts?: string[];

  @ApiPropertyOptional({ example: 'Programming Languages' })
  category?: string;

  @ApiPropertyOptional({ enum: ContentDifficulty, example: ContentDifficulty.BEGINNER })
  difficulty?: ContentDifficulty;

  @ApiPropertyOptional({ example: 'TypeScript Guide | Knowledge Hub' })
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Learn TypeScript from scratch' })
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/typescript-guide' })
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/typescript-cover.jpg' })
  featuredImageUrl?: string;

  @ApiProperty({ example: 0 })
  viewsCount: number;

  @ApiProperty({ example: 0 })
  likesCount: number;

  @ApiProperty({ example: '2026-01-27T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-27T10:00:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2026-01-27T12:00:00Z' })
  publishedAt?: Date;
}
