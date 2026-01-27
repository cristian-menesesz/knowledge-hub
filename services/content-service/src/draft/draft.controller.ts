import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DraftService } from './draft.service';
import { CreateDraftDto } from './dto/create-draft.dto';
import { UpdateDraftDto } from './dto/update-draft.dto';
import { DraftResponseDto } from './dto/draft-response.dto';
import { DraftStatus } from './entities/draft.entity';

@ApiTags('Drafts')
@Controller('drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new draft' })
  @ApiResponse({ status: 201, description: 'Draft created successfully', type: DraftResponseDto })
  @ApiResponse({ status: 409, description: 'Draft with slug already exists' })
  @ApiBearerAuth()
  async create(@Body() createDraftDto: CreateDraftDto): Promise<DraftResponseDto> {
    return await this.draftService.create(createDraftDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drafts with optional filtering' })
  @ApiQuery({ name: 'status', enum: DraftStatus, required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Drafts retrieved successfully' })
  @ApiBearerAuth()
  async findAll(
    @Query('status') status?: DraftStatus,
    @Query('authorId') authorId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.draftService.findAll(status, authorId, page, limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently modified drafts' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent drafts retrieved' })
  @ApiBearerAuth()
  async getRecent(@Query('limit') limit?: number): Promise<DraftResponseDto[]> {
    return await this.draftService.getRecentlyModified(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get draft statistics by status' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiBearerAuth()
  async getStats(): Promise<Record<DraftStatus, number>> {
    return await this.draftService.getCountByStatus();
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get drafts by status' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Drafts retrieved' })
  @ApiBearerAuth()
  async findByStatus(
    @Param('status') status: DraftStatus,
    @Query('limit') limit?: number,
  ): Promise<DraftResponseDto[]> {
    return await this.draftService.findByStatus(status, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get draft by ID' })
  @ApiResponse({ status: 200, description: 'Draft found', type: DraftResponseDto })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<DraftResponseDto> {
    return await this.draftService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get draft by slug' })
  @ApiResponse({ status: 200, description: 'Draft found', type: DraftResponseDto })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async findBySlug(@Param('slug') slug: string): Promise<DraftResponseDto> {
    return await this.draftService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft' })
  @ApiResponse({ status: 200, description: 'Draft updated', type: DraftResponseDto })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiResponse({ status: 409, description: 'Slug conflict' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateDraftDto: UpdateDraftDto,
  ): Promise<DraftResponseDto> {
    return await this.draftService.update(id, updateDraftDto);
  }

  @Post(':id/auto-save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Auto-save draft content (lightweight update)' })
  @ApiResponse({ status: 200, description: 'Draft auto-saved', type: DraftResponseDto })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async autoSave(
    @Param('id') id: string,
    @Body('content') content: string,
  ): Promise<DraftResponseDto> {
    return await this.draftService.autoSave(id, content);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update draft status' })
  @ApiResponse({ status: 200, description: 'Status updated', type: DraftResponseDto })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: DraftStatus,
  ): Promise<DraftResponseDto> {
    return await this.draftService.updateStatus(id, status);
  }

  @Get(':id/preview-url')
  @ApiOperation({ summary: 'Get preview URL for draft' })
  @ApiResponse({ status: 200, description: 'Preview URL generated' })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async getPreviewUrl(@Param('id') id: string): Promise<{ url: string }> {
    const url = await this.draftService.getPreviewUrl(id);
    return { url };
  }

  @Get('verify-preview/:slug')
  @ApiOperation({ summary: 'Verify preview token' })
  @ApiQuery({ name: 'token', required: true })
  @ApiResponse({ status: 200, description: 'Token verification result' })
  async verifyPreview(
    @Param('slug') slug: string,
    @Query('token') token: string,
  ): Promise<{ valid: boolean }> {
    const valid = await this.draftService.verifyPreviewToken(slug, token);
    return { valid };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft' })
  @ApiResponse({ status: 204, description: 'Draft deleted' })
  @ApiResponse({ status: 404, description: 'Draft not found' })
  @ApiBearerAuth()
  async remove(@Param('id') id: string): Promise<void> {
    await this.draftService.remove(id);
  }
}
