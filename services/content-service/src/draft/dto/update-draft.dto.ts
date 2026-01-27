import { PartialType } from '@nestjs/swagger';
import { CreateDraftDto } from './create-draft.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DraftStatus } from '../entities/draft.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDraftDto extends PartialType(CreateDraftDto) {
  @ApiPropertyOptional({
    description: 'Draft status',
    enum: DraftStatus,
    example: DraftStatus.IN_REVIEW,
  })
  @IsEnum(DraftStatus)
  @IsOptional()
  status?: DraftStatus;
}
