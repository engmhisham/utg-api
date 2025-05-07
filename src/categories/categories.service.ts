// src/categories/categories.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Faq } from 'src/faqs/entities/faq.entity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';
import { ActionType } from 'src/audit-logs/entities/audit-log.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,

    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,

    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
    private auditLogsService: AuditLogsService,
  ) { }

  create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAll(type?: CategoryType, language: 'en' | 'ar' = 'en') {
    const categories = await this.categoryRepo.find({
      where: type ? { type } : {},
      order: { [`name_${language}`]: 'ASC' },
    });

    return await Promise.all(
      categories.map(async (cat) => {
        let usedByCount = 0;

        if (cat.type === CategoryType.BLOG) {
          usedByCount = await this.blogRepository.count({ where: { category: { id: cat.id } } });
        } else if (cat.type === CategoryType.FAQ) {
          usedByCount = await this.faqRepository.count({ where: { category: { id: cat.id } } });
        }

        return {
          id: cat.id,
          type: cat.type,
          usedByCount,
          name: language === 'ar' ? cat.name_ar : cat.name_en,
        };
      })
    );
  }


  findOne(id: string) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    if (!cat) throw new NotFoundException('Category not found');
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async remove(id: string, userId: string, username: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    // Check if it's used in blogs
    const blogCount = await this.blogRepository.count({ where: { category: { id } } });
    if (blogCount > 0) {
      throw new ConflictException('Cannot delete category because it is used in blogs');
    }

    // Check if it's used in FAQs
    const faqCount = await this.faqRepository.count({ where: { category: { id } } });
    if (faqCount > 0) {
      throw new ConflictException('Cannot delete category because it is used in FAQs');
    }

    await this.categoryRepo.remove(category);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'category',
      entityId: id,
      oldValues: category,
    });

    return { id };
  }

}
