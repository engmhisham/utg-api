import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeoGeneralController } from './seo-general.controller';
import { SeoGeneralService } from './seo-general.service';
import { SeoGeneralSetting } from './entities/seo-general.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeoGeneralSetting]),
    AuditLogsModule,
  ],
  controllers: [SeoGeneralController],
  providers: [SeoGeneralService],
  exports: [SeoGeneralService],
})
export class SeoGeneralModule {}