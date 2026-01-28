import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { SearchDto, AutocompleteDto } from '../dto/search.dto';
import { SearchResult } from '../interfaces/search.interface';

@ApiTags('search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search content',
    description: 'Full-text search with filters, facets, and sorting',
  })
  @ApiQuery({ name: 'q', description: 'Search query', example: 'typescript' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['article', 'guide', 'tutorial', 'reference'],
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tags',
    example: 'javascript,typescript',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Content category',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'archived'],
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Content language',
    example: 'en',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results limit (1-100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Results offset',
    example: 0,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field:order',
    example: 'publishedAt:desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results with facets',
    schema: {
      example: {
        hits: [
          {
            id: 'content-123',
            title: 'Introduction to TypeScript',
            slug: 'introduction-to-typescript',
            excerpt: 'Learn the basics of TypeScript...',
            type: 'article',
            tags: ['typescript', 'programming'],
            status: 'published',
            language: 'en',
            viewCount: 1250,
            likeCount: 85,
            publishedAt: 1706428800000,
          },
        ],
        query: 'typescript',
        processingTimeMs: 12,
        limit: 20,
        offset: 0,
        estimatedTotalHits: 1,
        facetDistribution: {
          type: { article: 1 },
          tags: { typescript: 1, programming: 1 },
          status: { published: 1 },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async search(@Query() searchDto: SearchDto): Promise<SearchResult> {
    this.logger.log(`Search request: query="${searchDto.q}"`);
    return await this.searchService.search(searchDto);
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocomplete suggestions',
    description: 'Get search suggestions based on partial query',
  })
  @ApiQuery({ name: 'q', description: 'Partial query', example: 'type' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results limit (1-20)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Autocomplete suggestions',
    schema: {
      example: {
        hits: [
          {
            id: 'content-123',
            title: 'Introduction to TypeScript',
            slug: 'introduction-to-typescript',
            type: 'article',
            tags: ['typescript', 'programming'],
          },
        ],
        query: 'type',
        processingTimeMs: 5,
        limit: 5,
        offset: 0,
        estimatedTotalHits: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async autocomplete(
    @Query() autocompleteDto: AutocompleteDto
  ): Promise<SearchResult> {
    this.logger.log(`Autocomplete request: query="${autocompleteDto.q}"`);
    return await this.searchService.autocomplete(autocompleteDto);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get index statistics',
    description: 'Get statistics about the search index',
  })
  @ApiResponse({
    status: 200,
    description: 'Index statistics',
    schema: {
      example: {
        numberOfDocuments: 150,
        isIndexing: false,
        fieldDistribution: {
          title: 150,
          content: 150,
          tags: 150,
        },
      },
    },
  })
  async getStats() {
    this.logger.log('Stats request');
    return await this.searchService.getIndexStats();
  }
}
