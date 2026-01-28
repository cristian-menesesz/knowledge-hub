import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';
import { SearchDocument } from '../interfaces/search.interface';

@Injectable()
export class MeilisearchService implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch;
  private index: Index<SearchDocument>;
  private readonly indexName = 'content';

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>(
      'MEILI_HOST',
      'http://localhost:7700'
    );
    const apiKey = this.configService.get<string>(
      'MEILI_MASTER_KEY',
      'masterKey'
    );

    this.client = new MeiliSearch({
      host,
      apiKey,
    });

    this.logger.log(`Meilisearch client initialized: ${host}`);
  }

  async onModuleInit() {
    try {
      // Get or create index
      this.index = this.client.index<SearchDocument>(this.indexName);

      // Wait for Meilisearch to be ready
      await this.client.health();
      this.logger.log('Meilisearch health check passed');

      // Configure index settings
      await this.configureIndex();
      this.logger.log('Meilisearch index configured successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch', error);
      throw error;
    }
  }

  private async configureIndex() {
    try {
      // Searchable attributes (with ranking)
      await this.index.updateSearchableAttributes([
        'title',
        'excerpt',
        'content',
        'tags',
        'author',
        'authorName',
      ]);

      // Filterable attributes
      await this.index.updateFilterableAttributes([
        'type',
        'tags',
        'category',
        'status',
        'language',
        'author',
        'publishedAt',
        'createdAt',
      ]);

      // Sortable attributes
      await this.index.updateSortableAttributes([
        'publishedAt',
        'createdAt',
        'updatedAt',
        'viewCount',
        'likeCount',
      ]);

      // Displayed attributes (returned in search results)
      await this.index.updateDisplayedAttributes([
        'id',
        'title',
        'slug',
        'excerpt',
        'type',
        'tags',
        'category',
        'author',
        'authorName',
        'status',
        'language',
        'viewCount',
        'likeCount',
        'publishedAt',
        'createdAt',
        'updatedAt',
      ]);

      // Ranking rules (order matters)
      await this.index.updateRankingRules([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
        'viewCount:desc',
        'likeCount:desc',
      ]);

      // Typo tolerance settings
      await this.index.updateTypoTolerance({
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 5,
          twoTypos: 9,
        },
      });

      this.logger.log('Index settings updated successfully');
    } catch (error) {
      this.logger.error('Failed to configure index', error);
      throw error;
    }
  }

  getIndex(): Index<SearchDocument> {
    return this.index;
  }

  getClient(): MeiliSearch {
    return this.client;
  }

  async getIndexStats() {
    const stats = await this.index.getStats();
    return stats;
  }

  async healthCheck() {
    return await this.client.health();
  }
}
