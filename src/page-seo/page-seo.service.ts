import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageSeo } from './entities/page-seo.entity';
import { CreatePageSeoDto } from './dto/create-page-seo.dto';
import { UpdatePageSeoDto } from './dto/update-page-seo.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class PageSeoService {
  constructor(
    @InjectRepository(PageSeo)
    private pageSeoRepository: Repository<PageSeo>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<PageSeo>> {
    const { page = 1, limit = 10, sortBy = 'pageUrl', sortOrder = 'ASC' } = params;
    
    const query = this.pageSeoRepository.createQueryBuilder('pageSeo')
      .where('pageSeo.language = :language', { language });
    
    query.orderBy(`pageSeo.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const items = await query.getMany();
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PageSeo> {
    const pageSeo = await this.pageSeoRepository.findOne({ where: { id } });
    
    if (!pageSeo) {
      throw new NotFoundException(`Page SEO with ID ${id} not found`);
    }
    
    return pageSeo;
  }

  async findByUrl(
    pageUrl: string, 
    language: LanguageEnum = LanguageEnum.EN
  ): Promise<PageSeo> {
    const pageSeo = await this.pageSeoRepository.findOne({
      where: { pageUrl, language },
    });
    
    if (!pageSeo) {
      throw new NotFoundException(`Page SEO for URL ${pageUrl} and language ${language} not found`);
    }
    
    return pageSeo;
  }

  async create(
    createPageSeoDto: CreatePageSeoDto,
    userId: string,
    username: string,
  ): Promise<PageSeo> {
    // Check if a record for this URL and language already exists
    const existing = await this.pageSeoRepository.findOne({
      where: {
        pageUrl: createPageSeoDto.pageUrl,
        language: createPageSeoDto.language,
      },
    });
    
    if (existing) {
      throw new ConflictException(`Page SEO for URL ${createPageSeoDto.pageUrl} and language ${createPageSeoDto.language} already exists`);
    }
    
    const pageSeo = this.pageSeoRepository.create(createPageSeoDto);
    const savedPageSeo = await this.pageSeoRepository.save(pageSeo);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'page-seo',
      entityId: savedPageSeo.id,
      newValues: createPageSeoDto,
    });
    
    return savedPageSeo;
  }

  async update(
    id: string, 
    updatePageSeoDto: UpdatePageSeoDto,
    userId: string,
    username: string,
  ): Promise<PageSeo> {
    const pageSeo = await this.pageSeoRepository.findOne({ where: { id } });
    
    if (!pageSeo) {
      throw new NotFoundException(`Page SEO with ID ${id} not found`);
    }
    
    // If changing URL and language, check for conflicts
    if (
      (updatePageSeoDto.pageUrl && updatePageSeoDto.pageUrl !== pageSeo.pageUrl) ||
      (updatePageSeoDto.language && updatePageSeoDto.language !== pageSeo.language)
    ) {
      const newUrl = updatePageSeoDto.pageUrl || pageSeo.pageUrl;
      const newLanguage = updatePageSeoDto.language || pageSeo.language;
      
      const existing = await this.pageSeoRepository.findOne({
        where: {
          pageUrl: newUrl,
          language: newLanguage,
        },
      });
      
      if (existing && existing.id !== id) {
        throw new ConflictException(`Page SEO for URL ${newUrl} and language ${newLanguage} already exists`);
      }
    }
    
    const oldValues = { ...pageSeo };
    
    Object.assign(pageSeo, updatePageSeoDto);
    const updatedPageSeo = await this.pageSeoRepository.save(pageSeo);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'page-seo',
      entityId: id,
      oldValues,
      newValues: updatePageSeoDto,
    });
    
    return updatedPageSeo;
  }

  async remove(
    id: string,
    userId: string,
    username: string,
  ): Promise<{ id: string }> {
    const pageSeo = await this.pageSeoRepository.findOne({ where: { id } });
    
    if (!pageSeo) {
      throw new NotFoundException(`Page SEO with ID ${id} not found`);
    }
    
    await this.pageSeoRepository.remove(pageSeo);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'page-seo',
      entityId: id,
      oldValues: pageSeo,
    });
    
    return { id };
  }
}