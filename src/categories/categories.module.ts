// src/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { AuditLogsModule } from 'src/audit-logs/audit-logs.module';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Faq } from 'src/faqs/entities/faq.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Blog, Faq]), 
    AuditLogsModule, 
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
