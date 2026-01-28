import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SearchService } from '../services/search.service';
import { IndexDocumentDto } from '../dto/search.dto';
import { SearchDocument } from '../interfaces/search.interface';

@ApiTags('indexing')
@Controller('index')
export class IndexingController {
  private readonly logger = new Logger(IndexingController.name);

  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Index a document',
    description: 'Add or update a document in the search index',
  })
  @ApiBody({ type: IndexDocumentDto })
  @ApiResponse({ status: 202, description: 'Document queued for indexing' })
  @ApiResponse({ status: 400, description: 'Invalid document data' })
  async indexDocument(@Body() documentDto: IndexDocumentDto) {
    this.logger.log(`Indexing document: ${documentDto.id}`);

    const document: SearchDocument = {
      id: documentDto.id,
      title: documentDto.title,
      slug: documentDto.slug,
      excerpt: documentDto.excerpt,
      content: documentDto.content,
      type: documentDto.type as any,
      tags: documentDto.tags,
      category: documentDto.category,
      author: documentDto.author,
      authorName: documentDto.authorName,
      status: documentDto.status as any,
      language: documentDto.language,
      viewCount: documentDto.viewCount,
      likeCount: documentDto.likeCount,
      publishedAt: new Date(documentDto.publishedAt).getTime(),
      createdAt: new Date(documentDto.createdAt).getTime(),
      updatedAt: new Date(documentDto.updatedAt).getTime(),
    };

    await this.searchService.addDocument(document);

    return {
      message: 'Document queued for indexing',
      documentId: documentDto.id,
    };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Bulk index documents',
    description: 'Add or update multiple documents in the search index',
  })
  @ApiBody({ type: [IndexDocumentDto] })
  @ApiResponse({ status: 202, description: 'Documents queued for indexing' })
  @ApiResponse({ status: 400, description: 'Invalid document data' })
  async bulkIndexDocuments(@Body() documentsDto: IndexDocumentDto[]) {
    this.logger.log(`Bulk indexing ${documentsDto.length} documents`);

    const documents: SearchDocument[] = documentsDto.map((dto) => ({
      id: dto.id,
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      content: dto.content,
      type: dto.type as any,
      tags: dto.tags,
      category: dto.category,
      author: dto.author,
      authorName: dto.authorName,
      status: dto.status as any,
      language: dto.language,
      viewCount: dto.viewCount,
      likeCount: dto.likeCount,
      publishedAt: new Date(dto.publishedAt).getTime(),
      createdAt: new Date(dto.createdAt).getTime(),
      updatedAt: new Date(dto.updatedAt).getTime(),
    }));

    await this.searchService.addDocuments(documents);

    return {
      message: 'Documents queued for indexing',
      count: documentsDto.length,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete document from index',
    description: 'Remove a document from the search index',
  })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({ status: 204, description: 'Document deleted from index' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string) {
    this.logger.log(`Deleting document from index: ${id}`);
    await this.searchService.deleteDocument(id);
  }

  @Post('reindex')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Reindex all content',
    description: 'Clear index and reindex all content from Content Service',
  })
  @ApiResponse({ status: 202, description: 'Reindex process started' })
  async reindex() {
    this.logger.log('Starting reindex process');
    await this.searchService.deleteAllDocuments();

    // TODO: Fetch all content from Content Service and reindex
    // This will be implemented when integrating with Content Service

    return {
      message: 'Reindex process started',
      status: 'pending',
    };
  }
}
