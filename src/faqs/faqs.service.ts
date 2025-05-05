import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { UpdateFaqStatusDto } from './dto/update-faq-status.dto';
import { ReorderFaqsDto } from './dto/reorder-faqs.dto';
import { StatusEnum } from '../common/enums/status.enum';
import { FaqCategory } from '../common/enums/faq-category.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqsRepository: Repository<Faq>,
    private auditLogsService: AuditLogsService,
    private categoriesService: CategoriesService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    category?: FaqCategory,
    status?: StatusEnum,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.faqsRepository.createQueryBuilder('faq');
    
    if (category) {
      query.andWhere('faq.categoryId = :category', { category });
    }
    
    if (status) {
      query.andWhere('faq.status = :status', { status });
    }

    const allowedSortColumns = ['displayOrder', 'createdAt', 'updatedAt'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'displayOrder';
    query.orderBy(`faq.${safeSortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const faqs = await query.getMany();
    
    // Format the response based on language
    const items = faqs.map(faq => this.formatFaq(faq, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    return this.formatFaq(faq, language);
  }

  async create(createFaqDto: CreateFaqDto, userId: string, username: string) {
    const faq = this.faqsRepository.create(createFaqDto);

    if (createFaqDto.categoryId) {
      const category = await this.categoriesService.findOne(createFaqDto.categoryId);
      if (category) faq.category = category;
    }

    const savedFaq = await this.faqsRepository.save(faq);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'faq',
      entityId: savedFaq.id,
      newValues: createFaqDto,
    });
    
    return savedFaq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto, userId: string, username: string) {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    const oldValues = { ...faq };
    
    Object.assign(faq, updateFaqDto);

    if (updateFaqDto.categoryId) {
      const category = await this.categoriesService.findOne(updateFaqDto.categoryId);
      if (category) faq.category = category;
    }

    const updatedFaq = await this.faqsRepository.save(faq);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'faq',
      entityId: id,
      oldValues,
      newValues: updateFaqDto,
    });
    
    return updatedFaq;
  }

  async updateStatus(id: string, updateStatusDto: UpdateFaqStatusDto, userId: string, username: string) {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    const oldValues = { status: faq.status };
    
    faq.status = updateStatusDto.status;
    const updatedFaq = await this.faqsRepository.save(faq);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'faq',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedFaq;
  }

  async remove(id: string, userId: string, username: string) {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    
    await this.faqsRepository.remove(faq);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'faq',
      entityId: id,
      oldValues: faq,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderFaqsDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.faqsRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'faq',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', userId: string, username: string) {
    if (action === 'activate') {
      await this.faqsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.ACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'faq',
        newValues: { status: StatusEnum.ACTIVE, ids },
      });
    } else if (action === 'deactivate') {
      await this.faqsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.INACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'faq',
        newValues: { status: StatusEnum.INACTIVE, ids },
      });
    } else if (action === 'delete') {
      const faqs = await this.faqsRepository.find({ where: { id: In(ids) } });
      await this.faqsRepository.remove(faqs);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'faq',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatFaq(faq: Faq, language: LanguageEnum) {
    const result = {
      id: faq.id,
      category: faq.category,
      status: faq.status,
      displayOrder: faq.displayOrder,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        question: faq.question_en,
        answer: faq.answer_en,
      };
    } else {
      return {
        ...result,
        question: faq.question_ar,
        answer: faq.answer_ar,
      };
    }
  }
}