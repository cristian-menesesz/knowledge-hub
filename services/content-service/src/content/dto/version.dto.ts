import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class VersionResponseDto {
  @ApiProperty({
    description: 'Version ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Content ID this version belongs to',
    example: 'c1d2e3f4-a5b6-7890-cdef-ab1234567890',
  })
  contentId: string;

  @ApiProperty({
    description: 'Version number',
    example: 3,
    minimum: 1,
  })
  versionNumber: number;

  @ApiProperty({
    description: 'Snapshot of content at this version',
    type: 'object',
    additionalProperties: true,
  })
  snapshot: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Summary of changes in this version',
    example: 'Updated content sections and added new examples',
  })
  changeSummary?: string;

  @ApiProperty({
    description: 'Timestamp when version was created',
    example: '2026-01-27T10:30:00Z',
  })
  createdAt: Date;
}

export class CompareVersionsDto {
  @ApiProperty({
    description: 'First version number to compare',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  version1: number;

  @ApiProperty({
    description: 'Second version number to compare',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  version2: number;
}

export class VersionDifferenceDto {
  @ApiProperty({
    description: 'Field name that changed',
    example: 'title',
  })
  field: string;

  @ApiProperty({
    description: 'Old value of the field',
    example: 'Introduction to TypeScript',
  })
  oldValue: unknown;

  @ApiProperty({
    description: 'New value of the field',
    example: 'Complete Guide to TypeScript',
  })
  newValue: unknown;

  @ApiProperty({
    description: 'Whether the field changed',
    example: true,
  })
  changed: boolean;
}

export class CompareVersionsResponseDto {
  @ApiProperty({
    description: 'First version',
    type: VersionResponseDto,
  })
  version1: VersionResponseDto;

  @ApiProperty({
    description: 'Second version',
    type: VersionResponseDto,
  })
  version2: VersionResponseDto;

  @ApiProperty({
    description: 'List of differences between versions',
    type: [VersionDifferenceDto],
  })
  differences: VersionDifferenceDto[];
}

export class RestoreVersionDto {
  @ApiProperty({
    description: 'Version number to restore',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  versionNumber: number;

  @ApiPropertyOptional({
    description: 'Optional reason for restoring this version',
    example: 'Reverting unwanted changes',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class CreateVersionDto {
  @ApiPropertyOptional({
    description: 'Summary of changes in this version',
    example: 'Updated content structure and fixed typos',
  })
  @IsString()
  @IsOptional()
  changeSummary?: string;
}
