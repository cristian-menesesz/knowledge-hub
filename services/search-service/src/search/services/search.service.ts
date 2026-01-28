import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { SearchDto, AutocompleteDto } from '../dto/search.dto';
import { SearchResult, SearchDocument } from '../interfaces/search.interface';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly meilisearchService: MeilisearchService) {}

  async search(searchDto: SearchDto): Promise<SearchResult> {
    try {
      const index = this.meilisearchService.getIndex();

      // Build filter string
      const filters: string[] = [];
      if (searchDto.type) {
        filters.push(`type = "${searchDto.type}"`);
      }
      if (searchDto.tags && searchDto.tags.length > 0) {
        const tagFilters = searchDto.tags
          .map((tag) => `tags = "${tag}"`)
          .join(' OR ');
        filters.push(`(${tagFilters})`);
      }
      if (searchDto.category) {
        filters.push(`category = "${searchDto.category}"`);
      }
      if (searchDto.status) {
        filters.push(`status = "${searchDto.status}"`);
      }
      if (searchDto.language) {
        filters.push(`language = "${searchDto.language}"`);
      }

      // Build sort array
      const sort: string[] = [];
      if (searchDto.sort) {
        sort.push(searchDto.sort);
      }

      // Execute search
      const results = await index.search(searchDto.q, {
        limit: searchDto.limit,
        offset: searchDto.offset,
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        sort: sort.length > 0 ? sort : undefined,
        attributesToHighlight: ['title', 'excerpt', 'content'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
        facets: ['type', 'tags', 'category', 'status', 'language'],
      });

      this.logger.log(
        `Search completed: query="${searchDto.q}", hits=${results.hits.length}, time=${results.processingTimeMs}ms`
      );

      return {
        hits: results.hits as SearchDocument[],
        query: searchDto.q,
        processingTimeMs: results.processingTimeMs,
        limit: searchDto.limit || 20,
        offset: searchDto.offset || 0,
        estimatedTotalHits: results.estimatedTotalHits || 0,
        facetDistribution: results.facetDistribution,
      };
    } catch (error) {
      this.logger.error('Search failed', error);
      throw error;
    }
  }

  async autocomplete(autocompleteDto: AutocompleteDto): Promise<SearchResult> {
    try {
      const index = this.meilisearchService.getIndex();

      const results = await index.search(autocompleteDto.q, {
        limit: autocompleteDto.limit,
        attributesToSearchOn: ['title', 'tags'],
        attributesToRetrieve: ['id', 'title', 'slug', 'type', 'tags'],
      });

      this.logger.log(
        `Autocomplete: query="${autocompleteDto.q}", suggestions=${results.hits.length}`
      );

      return {
        hits: results.hits as SearchDocument[],
        query: autocompleteDto.q,
        processingTimeMs: results.processingTimeMs,
        limit: autocompleteDto.limit || 5,
        offset: 0,
        estimatedTotalHits: results.estimatedTotalHits || 0,
      };
    } catch (error) {
      this.logger.error('Autocomplete failed', error);
      throw error;
    }
  }

  async addDocument(document: SearchDocument): Promise<void> {
    try {
      const index = this.meilisearchService.getIndex();
      await index.addDocuments([document]);
      this.logger.log(`Document added to index: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to add document: ${document.id}`, error);
      throw error;
    }
  }

  async addDocuments(documents: SearchDocument[]): Promise<void> {
    try {
      const index = this.meilisearchService.getIndex();
      await index.addDocuments(documents);
      this.logger.log(`${documents.length} documents added to index`);
    } catch (error) {
      this.logger.error('Failed to add documents', error);
      throw error;
    }
  }

  async updateDocument(document: SearchDocument): Promise<void> {
    try {
      const index = this.meilisearchService.getIndex();
      await index.updateDocuments([document]);
      this.logger.log(`Document updated in index: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to update document: ${document.id}`, error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const index = this.meilisearchService.getIndex();
      await index.deleteDocument(id);
      this.logger.log(`Document deleted from index: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document: ${id}`, error);
      throw error;
    }
  }

  async deleteAllDocuments(): Promise<void> {
    try {
      const index = this.meilisearchService.getIndex();
      await index.deleteAllDocuments();
      this.logger.log('All documents deleted from index');
    } catch (error) {
      this.logger.error('Failed to delete all documents', error);
      throw error;
    }
  }

  async getIndexStats() {
    return await this.meilisearchService.getIndexStats();
  }
}
