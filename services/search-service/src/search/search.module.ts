import { Module } from '@nestjs/common';
import { MeilisearchService } from './services/meilisearch.service';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { IndexingController } from './controllers/indexing.controller';

@Module({
  providers: [MeilisearchService, SearchService],
  controllers: [SearchController, IndexingController],
  exports: [SearchService],
})
export class SearchModule {}
