import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DraftService } from './draft.service';
import { DraftController } from './draft.controller';
import { Draft, DraftSchema } from './entities/draft.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Draft.name, schema: DraftSchema }])],
  controllers: [DraftController],
  providers: [DraftService],
  exports: [DraftService],
})
export class DraftModule {}
