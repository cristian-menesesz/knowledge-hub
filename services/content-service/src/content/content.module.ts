import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { VersionService } from './version.service';
import { ContentController } from './content.controller';
import { Content } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentVersion])],
  controllers: [ContentController],
  providers: [ContentService, VersionService],
  exports: [ContentService, VersionService],
})
export class ContentModule {}
