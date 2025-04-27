import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { Blog } from './entities/blog.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { Media } from 'src/media/entities/media.entity';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Media]),
    AuditLogsModule,
    MediaModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService,
  ],
  exports: [BlogsService],
})
export class BlogsModule {}