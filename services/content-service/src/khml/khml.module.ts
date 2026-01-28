import { Module } from '@nestjs/common';
import { KHMLService } from './services/khml.service';
import { KHMLCacheService } from './services/khml-cache.service';
import { KHMLController } from './controllers/khml.controller';

@Module({
  controllers: [KHMLController],
  providers: [KHMLService, KHMLCacheService],
  exports: [KHMLService, KHMLCacheService],
})
export class KHMLModule {}
