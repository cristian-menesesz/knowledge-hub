import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
  IsObject,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContentDto } from './create-content.dto';

class TableOfContentsItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ example: 'Introduction to TypeScript' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'introduction-to-typescript' })
  @IsString()
  anchor: string;
}

class ExternalResourceDto {
  @ApiProperty({ example: 'TypeScript Official Docs' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://www.typescriptlang.org/docs/' })
  @IsString()
  url: string;

  @ApiProperty({ enum: ['documentation', 'tutorial', 'video', 'tool', 'other'] })
  @IsEnum(['documentation', 'tutorial', 'video', 'tool', 'other'])
  type: 'documentation' | 'tutorial' | 'video' | 'tool' | 'other';
}

export class CreateArticleDto extends CreateContentDto {
  @ApiPropertyOptional({ example: 'This article covers the fundamentals...' })
  @IsString()
  @IsOptional()
  introduction?: string;

  @ApiPropertyOptional({
    description: 'Block-based content from editor',
    example: { blocks: [] },
  })
  @IsObject()
  @IsOptional()
  body?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'In conclusion, TypeScript provides...' })
  @IsString()
  @IsOptional()
  conclusion?: string;

  @ApiPropertyOptional({ type: [TableOfContentsItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableOfContentsItemDto)
  @IsOptional()
  tableOfContents?: TableOfContentsItemDto[];

  @ApiPropertyOptional({ example: 15 })
  @IsInt()
  @Min(1)
  @IsOptional()
  readingTime?: number;

  @ApiPropertyOptional({ example: 3500 })
  @IsInt()
  @Min(0)
  @IsOptional()
  wordCount?: number;

  @ApiPropertyOptional({
    example: ['TypeScript provides type safety', 'Interfaces define contracts'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyTakeaways?: string[];

  @ApiPropertyOptional({ example: ['javascript-basics', 'programming-fundamentals'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedContentIds?: string[];

  @ApiPropertyOptional({ example: 'Web Development Fundamentals' })
  @IsString()
  @IsOptional()
  learningPath?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequenceNumber?: number;

  @ApiPropertyOptional({ example: 'TypeScript Deep Dive' })
  @IsString()
  @IsOptional()
  seriesName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  seriesPart?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  seriesTotal?: number;

  @ApiPropertyOptional({ type: [ExternalResourceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalResourceDto)
  @IsOptional()
  externalResources?: ExternalResourceDto[];
}
