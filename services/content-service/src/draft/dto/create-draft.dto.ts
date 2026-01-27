import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DraftContentType } from '../entities/draft.entity';

export class CreateDraftDto {
  @ApiProperty({
    description: 'Draft title',
    example: 'Getting Started with TypeScript',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'getting-started-typescript',
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(250)
  slug: string;

  @ApiPropertyOptional({
    description: 'Brief description of the content',
    example: 'A comprehensive guide to getting started with TypeScript',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Main content body (Markdown)',
    example: '# Introduction\n\nTypeScript is...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of content',
    enum: DraftContentType,
    example: DraftContentType.TUTORIAL,
  })
  @IsEnum(DraftContentType)
  @IsOptional()
  contentType?: DraftContentType;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    example: ['typescript', 'programming', 'tutorial'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Technical concepts covered',
    example: ['types', 'interfaces', 'generics'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  concepts?: string[];

  @ApiPropertyOptional({
    description: 'Content category',
    example: 'Programming Languages',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Difficulty level',
    example: 'beginner',
  })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'Author ID',
    example: 'user-123',
  })
  @IsString()
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Scheduled publication date',
    example: '2026-02-01T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  scheduledPublishAt?: Date;

  @ApiPropertyOptional({
    description: 'SEO title',
    example: 'TypeScript Tutorial: Complete Beginner Guide',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'SEO meta description',
    example: 'Learn TypeScript from scratch with this comprehensive tutorial',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({
    description: 'Canonical URL',
    example: 'https://knowledge-hub.com/tutorials/typescript',
  })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({
    description: 'Featured image URL',
    example: 'https://cdn.example.com/images/typescript-tutorial.jpg',
  })
  @IsString()
  @IsOptional()
  featuredImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { estimatedReadTime: 10, difficulty: 'beginner' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
