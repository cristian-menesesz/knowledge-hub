import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateContentDto } from './create-content.dto';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @ApiPropertyOptional({
    description: 'Summary of changes made in this update',
    example: 'Updated introduction and fixed code examples',
  })
  @IsString()
  @IsOptional()
  changeSummary?: string;
}
