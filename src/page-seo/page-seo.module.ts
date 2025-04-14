import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageSeoController } from './page-seo.controller';
import { PageSeoService } from './page-seo.service';
import { PageSeo } from './entities/page-seo.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PageSeo]),
    AuditLogsModule,
  ],
  controllers: [PageSeoController],
  providers: [PageSeoService],
  exports: [PageSeoService],
})
export class PageSeoModule {}