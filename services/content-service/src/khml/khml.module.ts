import { Module } from '@nestjs/common';
import { KHMLService } from './services/khml.service';
import { KHMLController } from './controllers/khml.controller';

@Module({
  controllers: [KHMLController],
  providers: [KHMLService],
  exports: [KHMLService],
})
export class KHMLModule {}
