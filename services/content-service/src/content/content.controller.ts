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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { VersionService } from './version.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import {
  VersionResponseDto,
  CompareVersionsResponseDto,
  CreateVersionDto,
} from './dto/version.dto';
import { ContentStatus } from './entities/content.entity';

@ApiTags('content')
@Controller('contents')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly versionService: VersionService,
  ) {}

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

  // Version Control Endpoints

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of content' })
  @ApiResponse({
    status: 200,
    description: 'List of content versions',
    type: [VersionResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getVersions(@Param('id', ParseUUIDPipe) id: string): Promise<VersionResponseDto[]> {
    return await this.versionService.getVersionsByContentId(id);
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Get specific version of content' })
  @ApiResponse({ status: 200, description: 'Version found', type: VersionResponseDto })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async getVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ): Promise<VersionResponseDto> {
    return await this.versionService.getVersionByNumber(id, versionNumber);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a manual version snapshot' })
  @ApiResponse({ status: 201, description: 'Version created', type: VersionResponseDto })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiBearerAuth()
  async createVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createVersionDto: CreateVersionDto,
  ): Promise<VersionResponseDto> {
    const content = await this.contentService.findOne(id);
    return await this.versionService.createVersion(content, createVersionDto.changeSummary);
  }

  @Get(':id/versions/compare/:version1/:version2')
  @ApiOperation({ summary: 'Compare two versions of content' })
  @ApiResponse({
    status: 200,
    description: 'Version comparison',
    type: CompareVersionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async compareVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version1', ParseIntPipe) version1: number,
    @Param('version2', ParseIntPipe) version2: number,
  ): Promise<CompareVersionsResponseDto> {
    return await this.versionService.compareVersions(id, version1, version2);
  }

  @Post(':id/versions/:versionNumber/restore')
  @ApiOperation({ summary: 'Restore content to a specific version' })
  @ApiResponse({ status: 200, description: 'Content restored', type: ContentResponseDto })
  @ApiResponse({ status: 404, description: 'Version not found' })
  @ApiBearerAuth()
  async restoreVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ): Promise<ContentResponseDto> {
    return await this.versionService.restoreVersion(id, versionNumber);
  }
}
