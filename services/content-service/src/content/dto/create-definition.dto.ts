import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateContentDto } from './create-content.dto';
import { DefinitionType } from '../entities/definition.entity';

class DefinitionExampleDto {
  @ApiProperty({ example: 'In web development' })
  @IsString()
  context: string;

  @ApiProperty({ example: 'An API allows different applications to communicate' })
  @IsString()
  example: string;

  @ApiPropertyOptional({ example: 'Used when building RESTful services' })
  @IsString()
  @IsOptional()
  explanation?: string;
}

class CodeExampleDto {
  @ApiProperty({ example: 'javascript' })
  @IsString()
  language: string;

  @ApiProperty({ example: 'fetch(API_URL).then(...)' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Making an API call with fetch' })
  @IsString()
  description: string;
}

export class CreateDefinitionDto extends CreateContentDto {
  @ApiProperty({ example: 'API' })
  @IsString()
  @MaxLength(255)
  term: string;

  @ApiProperty({ example: 'An interface for applications to communicate with each other' })
  @IsString()
  definition: string;

  @ApiProperty({ enum: DefinitionType, example: DefinitionType.ACRONYM })
  @IsEnum(DefinitionType)
  definitionType: DefinitionType;

  @ApiPropertyOptional({
    example: 'APIs provide a standardized way for applications to exchange data...',
  })
  @IsString()
  @IsOptional()
  expandedExplanation?: string;

  @ApiPropertyOptional({ example: 'Web Development' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: ['Backend Development', 'Frontend Development'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contexts?: string[];

  @ApiPropertyOptional({ example: 'Application Programming Interface' })
  @IsString()
  @IsOptional()
  fullForm?: string;

  @ApiPropertyOptional({ example: ['WebAPI', 'API Endpoint'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  abbreviations?: string[];

  @ApiPropertyOptional({ type: [DefinitionExampleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefinitionExampleDto)
  @IsOptional()
  examples?: DefinitionExampleDto[];

  @ApiPropertyOptional({ type: [CodeExampleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeExampleDto)
  @IsOptional()
  codeExamples?: CodeExampleDto[];

  @ApiPropertyOptional({ example: ['Interface', 'Web Service'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @ApiPropertyOptional({ example: ['Monolithic Application'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  antonyms?: string[];

  @ApiPropertyOptional({ example: ['REST API', 'GraphQL', 'RPC'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedTerms?: string[];

  @ApiPropertyOptional({ example: ['Software Architecture', 'Web Services'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  parentConcepts?: string[];

  @ApiPropertyOptional({ example: ['REST API', 'SOAP API', 'GraphQL API'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  childConcepts?: string[];

  @ApiPropertyOptional({ example: 'Derived from Application Programming Interface' })
  @IsString()
  @IsOptional()
  etymology?: string;

  @ApiPropertyOptional({ example: '1960s in computing' })
  @IsString()
  @IsOptional()
  firstUsed?: string;

  @ApiPropertyOptional({ example: 'Often confused with REST API specifically' })
  @IsString()
  @IsOptional()
  commonMisconceptions?: string;

  @ApiPropertyOptional({ example: 'Typically capitalized as API, not Api' })
  @IsString()
  @IsOptional()
  usageNotes?: string;

  @ApiPropertyOptional({ example: ['Web API (Microsoft)', 'API Gateway (AWS)'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industryVariants?: string[];

  @ApiPropertyOptional({ example: 'https://cdn.example.com/api-diagram.png' })
  @IsString()
  @IsOptional()
  diagramUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/api-illustration.png' })
  @IsString()
  @IsOptional()
  illustrationUrl?: string;

  @ApiPropertyOptional({ example: '/eɪ.piː.aɪ/' })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/api-pronunciation.mp3' })
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
