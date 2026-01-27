import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { ContentStatus } from './entities/content.entity';

@ApiTags('content')
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiResponse({
    status: 201,
    description: 'Content created successfully',
    type: ContentResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBearerAuth()
  async create(@Body() createContentDto: CreateContentDto): Promise<ContentResponseDto> {
    return await this.contentService.create(createContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contents with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of contents' })
  @ApiQuery({ name: 'status', enum: ContentStatus, required: false })
  @ApiQuery({ name: 'contentType', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('status') status?: ContentStatus,
    @Query('contentType') contentType?: string,
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.contentService.findAll({
      status,
      contentType,
      authorId,
      limit,
      offset,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, description: 'Content found', type: ContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ContentResponseDto> {
    const content = await this.contentService.findOne(id);

    // Increment view count asynchronously (fire and forget)
    this.contentService.incrementViewCount(id).catch(() => {
      // Log error but don't fail the request
    });

    return content;
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get content by slug' })
  @ApiResponse({ status: 200, description: 'Content found', type: ContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async findBySlug(@Param('slug') slug: string): Promise<ContentResponseDto> {
    return await this.contentService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content' })
  @ApiResponse({ status: 200, description: 'Content updated', type: ContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<ContentResponseDto> {
    return await this.contentService.update(id, updateContentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete content (soft delete)' })
  @ApiResponse({ status: 204, description: 'Content deleted' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.contentService.remove(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish content' })
  @ApiResponse({ status: 200, description: 'Content published', type: ContentResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 409, description: 'Content already published' })
  @ApiBearerAuth()
  async publish(@Param('id', ParseUUIDPipe) id: string): Promise<ContentResponseDto> {
    return await this.contentService.publish(id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Increment like count' })
  @ApiResponse({ status: 200, description: 'Like count incremented' })
  async like(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: boolean }> {
    await this.contentService.incrementLikeCount(id);
    return { success: true };
  }
}
