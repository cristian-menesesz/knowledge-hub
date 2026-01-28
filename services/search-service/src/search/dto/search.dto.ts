import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SearchDto {
  @ApiProperty({
    description: 'Search query',
    example: 'typescript async await',
  })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Content type filter',
    enum: ['article', 'guide', 'tutorial', 'reference'],
    example: 'article',
  })
  @IsOptional()
  @IsEnum(['article', 'guide', 'tutorial', 'reference'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Tags filter (comma-separated)',
    example: 'javascript,typescript',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((t) => t.trim()) : value
  )
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Category filter',
    example: 'programming',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Status filter',
    enum: ['draft', 'published', 'archived'],
    example: 'published',
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: 'Language filter', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Results limit',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Results offset',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Sort field and order',
    example: 'publishedAt:desc',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}

export class AutocompleteDto {
  @ApiProperty({ description: 'Autocomplete query', example: 'type' })
  @IsString()
  q: string;

  @ApiPropertyOptional({
    description: 'Results limit',
    example: 5,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 5;
}

export class IndexDocumentDto {
  @ApiProperty({ description: 'Document ID', example: 'content-123' })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Content title',
    example: 'Introduction to TypeScript',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL slug',
    example: 'introduction-to-typescript',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Short excerpt',
    example: 'Learn TypeScript basics...',
  })
  @IsString()
  excerpt: string;

  @ApiProperty({
    description: 'Full content text',
    example: 'TypeScript is a...',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Content type',
    enum: ['article', 'guide', 'tutorial', 'reference'],
  })
  @IsEnum(['article', 'guide', 'tutorial', 'reference'])
  type: string;

  @ApiProperty({
    description: 'Content tags',
    example: ['typescript', 'programming'],
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({
    description: 'Content category',
    example: 'programming',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Author ID', example: 'user-123' })
  @IsString()
  author: string;

  @ApiPropertyOptional({
    description: 'Author display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  authorName?: string;

  @ApiProperty({
    description: 'Publication status',
    enum: ['draft', 'published', 'archived'],
  })
  @IsEnum(['draft', 'published', 'archived'])
  status: string;

  @ApiProperty({ description: 'Content language', example: 'en' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'View count', example: 100 })
  @IsInt()
  @Min(0)
  viewCount: number;

  @ApiProperty({ description: 'Like count', example: 25 })
  @IsInt()
  @Min(0)
  likeCount: number;

  @ApiProperty({
    description: 'Published date (ISO 8601)',
    example: '2024-01-28T12:00:00Z',
  })
  @IsString()
  publishedAt: string;

  @ApiProperty({
    description: 'Created date (ISO 8601)',
    example: '2024-01-20T10:00:00Z',
  })
  @IsString()
  createdAt: string;

  @ApiProperty({
    description: 'Updated date (ISO 8601)',
    example: '2024-01-28T12:00:00Z',
  })
  @IsString()
  updatedAt: string;
}
