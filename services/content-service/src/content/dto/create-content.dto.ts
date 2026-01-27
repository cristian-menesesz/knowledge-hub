import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ContentType, ContentDifficulty } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({ example: 'Getting Started with TypeScript' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'getting-started-with-typescript' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'A comprehensive guide to TypeScript fundamentals' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ContentType, example: ContentType.ARTICLE })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ example: 'user-uuid-here' })
  @IsUUID()
  authorId: string;

  @ApiPropertyOptional({ example: ['typescript', 'javascript', 'programming'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: ['programming-basics', 'type-systems'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  concepts?: string[];

  @ApiPropertyOptional({ example: 'Programming Languages' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ enum: ContentDifficulty, example: ContentDifficulty.BEGINNER })
  @IsEnum(ContentDifficulty)
  @IsOptional()
  difficulty?: ContentDifficulty;

  @ApiPropertyOptional({ example: 'TypeScript Guide | Knowledge Hub' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Learn TypeScript from scratch' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/typescript-guide' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/typescript-cover.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  featuredImageUrl?: string;
}
