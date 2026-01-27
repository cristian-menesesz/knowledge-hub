import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { VersionService } from './version.service';
import { ContentController } from './content.controller';
import { Content } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { Article } from './entities/article.entity';
import { CodeSnippet } from './entities/code-snippet.entity';
import { Definition } from './entities/definition.entity';
import { Guide } from './entities/guide.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, ContentVersion, Article, CodeSnippet, Definition, Guide]),
  ],
  controllers: [ContentController],
  providers: [ContentService, VersionService],
  exports: [ContentService, VersionService],
})
export class ContentModule {}
