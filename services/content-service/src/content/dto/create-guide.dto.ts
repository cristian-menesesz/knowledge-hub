import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  ValidateNested,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContentDto } from './create-content.dto';
import { GuideType, GuideFormat } from '../entities/guide.entity';

class GuideStepDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({ example: 'Install Dependencies' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Run npm install to install required packages' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'npm install express' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ example: 'bash' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'Successfully installed 5 packages' })
  @IsString()
  @IsOptional()
  expectedOutput?: string;

  @ApiPropertyOptional({ example: 'If you see EACCES error, use sudo' })
  @IsString()
  @IsOptional()
  troubleshooting?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  timeEstimate?: number;
}

class GuideSectionDto {
  @ApiProperty({ example: 'Configuration' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Block-based content', example: { blocks: [] } })
  @IsObject()
  content: Record<string, unknown>;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  order: number;
}

class PrerequisiteDto {
  @ApiProperty({ enum: ['knowledge', 'software', 'hardware', 'account'] })
  @IsEnum(['knowledge', 'software', 'hardware', 'account'])
  type: 'knowledge' | 'software' | 'hardware' | 'account';

  @ApiProperty({ example: 'Node.js' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Node.js version 18 or higher' })
  @IsString()
  description: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ example: 'https://nodejs.org' })
  @IsString()
  @IsOptional()
  link?: string;
}

class CommonIssueDto {
  @ApiProperty({ example: 'Module not found error' })
  @IsString()
  issue: string;

  @ApiProperty({ example: 'Missing dependency' })
  @IsString()
  cause: string;

  @ApiProperty({ example: 'Run npm install' })
  @IsString()
  solution: string;

  @ApiPropertyOptional({ example: 'npm install missing-module' })
  @IsString()
  @IsOptional()
  code?: string;
}

class FAQDto {
  @ApiProperty({ example: 'Why does this fail on Windows?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'Windows uses different path separators' })
  @IsString()
  answer: string;
}

class BreakingChangeDto {
  @ApiProperty({ example: 'Removed legacy API support' })
  @IsString()
  change: string;

  @ApiProperty({ example: 'Applications using old API will fail' })
  @IsString()
  impact: string;

  @ApiProperty({ example: 'Update to new API v2' })
  @IsString()
  mitigation: string;
}

export class CreateGuideDto extends CreateContentDto {
  @ApiProperty({ enum: GuideType, example: GuideType.TUTORIAL })
  @IsEnum(GuideType)
  guideType: GuideType;

  @ApiProperty({ enum: GuideFormat, example: GuideFormat.STEP_BY_STEP })
  @IsEnum(GuideFormat)
  guideFormat: GuideFormat;

  @ApiPropertyOptional({ example: 'Docker' })
  @IsString()
  @IsOptional()
  technology?: string;

  @ApiPropertyOptional({ example: '24.0' })
  @IsString()
  @IsOptional()
  technologyVersion?: string;

  @ApiPropertyOptional({ example: 'This guide covers Docker fundamentals...' })
  @IsString()
  @IsOptional()
  overview?: string;

  @ApiPropertyOptional({ type: [GuideStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideStepDto)
  @IsOptional()
  steps?: GuideStepDto[];

  @ApiPropertyOptional({ type: [GuideSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuideSectionDto)
  @IsOptional()
  sections?: GuideSectionDto[];

  @ApiPropertyOptional({ type: [PrerequisiteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrerequisiteDto)
  @IsOptional()
  prerequisites?: PrerequisiteDto[];

  @ApiPropertyOptional({ example: ['Docker Desktop', 'Node.js'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredTools?: string[];

  @ApiPropertyOptional({ example: ['Windows 10 or higher', '4GB RAM minimum'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  systemRequirements?: string[];

  @ApiPropertyOptional({ example: 60 })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedTime?: number;

  @ApiPropertyOptional({ example: 'intermediate' })
  @IsString()
  @IsOptional()
  skillLevel?: string;

  @ApiPropertyOptional({ example: ['Understand Docker basics', 'Deploy containers'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningOutcomes?: string[];

  @ApiPropertyOptional({ example: ['Containerized app', 'Docker Compose file'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliverables?: string[];

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  apiReference?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  commandReference?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  configurationOptions?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [CommonIssueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommonIssueDto)
  @IsOptional()
  commonIssues?: CommonIssueDto[];

  @ApiPropertyOptional({ type: [FAQDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FAQDto)
  @IsOptional()
  faqs?: FAQDto[];

  @ApiPropertyOptional({ example: '1.0' })
  @IsString()
  @IsOptional()
  guideVersion?: string;

  @ApiPropertyOptional({ example: '2026-01-27T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  lastVerifiedAt?: Date;

  @ApiPropertyOptional({ example: ['24.0', '23.0'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  versionCompatibility?: string[];

  @ApiPropertyOptional({ example: 'Docker 20.x' })
  @IsString()
  @IsOptional()
  migrationFrom?: string;

  @ApiPropertyOptional({ example: 'Docker 24.x' })
  @IsString()
  @IsOptional()
  migrationTo?: string;

  @ApiPropertyOptional({ type: [BreakingChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakingChangeDto)
  @IsOptional()
  breakingChanges?: BreakingChangeDto[];

  @ApiPropertyOptional({ type: [Object] })
  @IsArray()
  @IsOptional()
  officialDocs?: { title: string; url: string }[];

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedGuides?: string[];

  @ApiPropertyOptional({ example: 'https://github.com/example/docker-guide' })
  @IsString()
  @IsOptional()
  sourceRepository?: string;
}
