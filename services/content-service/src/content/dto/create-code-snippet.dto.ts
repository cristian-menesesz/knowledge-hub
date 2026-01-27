import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContentDto } from './create-content.dto';
import { ProgrammingLanguage } from '../entities/code-snippet.entity';

class CodeVariationDto {
  @ApiProperty({ example: 'Using async/await' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'async function fetchData() {...}' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Modern approach with async/await syntax' })
  @IsString()
  description: string;
}

export class CreateCodeSnippetDto extends CreateContentDto {
  @ApiProperty({ example: 'function fibonacci(n) { ... }' })
  @IsString()
  code: string;

  @ApiProperty({ enum: ProgrammingLanguage, example: ProgrammingLanguage.JAVASCRIPT })
  @IsEnum(ProgrammingLanguage)
  language: ProgrammingLanguage;

  @ApiPropertyOptional({ example: 'React' })
  @IsString()
  @IsOptional()
  framework?: string;

  @ApiPropertyOptional({ example: '18.2.0' })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiPropertyOptional({ example: 'This function calculates fibonacci numbers...' })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiPropertyOptional({ example: 'Use when you need to generate fibonacci sequence' })
  @IsString()
  @IsOptional()
  useCase?: string;

  @ApiPropertyOptional({ example: ['Dynamic programming', 'Recursion optimization'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  useCases?: string[];

  @ApiPropertyOptional({ example: '[0, 1, 1, 2, 3, 5, 8, 13]' })
  @IsString()
  @IsOptional()
  outputExample?: string;

  @ApiPropertyOptional({ example: ['lodash@4.17.21', 'axios@1.6.0'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @ApiPropertyOptional({ example: 'npm install lodash' })
  @IsString()
  @IsOptional()
  setupInstructions?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isExecutable?: boolean;

  @ApiPropertyOptional({ example: 25 })
  @IsInt()
  @Min(0)
  @IsOptional()
  linesOfCode?: number;

  @ApiPropertyOptional({ example: ['Use memoization', 'Avoid deep recursion'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bestPractices?: string[];

  @ApiPropertyOptional({ example: ['Stack overflow with large n', 'Performance issues'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commonPitfalls?: string[];

  @ApiPropertyOptional({ type: [CodeVariationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeVariationDto)
  @IsOptional()
  variations?: CodeVariationDto[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  alternativeApproaches?: string[];

  @ApiPropertyOptional({ example: 'O(n)' })
  @IsString()
  @IsOptional()
  timeComplexity?: string;

  @ApiPropertyOptional({ example: 'O(n)' })
  @IsString()
  @IsOptional()
  spaceComplexity?: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedSnippets?: string[];
}
