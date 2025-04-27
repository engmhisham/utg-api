import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';
import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';
import { TestimonialStatus } from '../common/enums/testimonial-status.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private testimonialsRepository: Repository<Testimonial>,
    private auditLogsService: AuditLogsService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: TestimonialStatus,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.testimonialsRepository.createQueryBuilder('testimonial');
    
    if (status) {
      query.where('testimonial.status = :status', { status });
    }
    
    query.orderBy(`testimonial.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const testimonials = await query.getMany();
    
    // Format the response based on language
    const items = testimonials.map(testimonial => this.formatTestimonial(testimonial, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    
    return this.formatTestimonial(testimonial, language);
  }

  async create(createTestimonialDto: CreateTestimonialDto, userId: string, username: string) {
    const testimonial = this.testimonialsRepository.create(createTestimonialDto);
    const savedTestimonial = await this.testimonialsRepository.save(testimonial);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'testimonial',
      entityId: savedTestimonial.id,
      newValues: createTestimonialDto,
    });
    
    return savedTestimonial;
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto, userId: string, username: string) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }

    // ① capture old logo URL
    const oldLogoUrl = testimonial.logoUrl;
    const oldCoverImageUrl = testimonial.coverImageUrl;

    // ② if the DTO contains a new logoUrl and it's different,
    //     delete the old one from media storage
    if (
      updateTestimonialDto.logoUrl &&
      oldLogoUrl &&
      updateTestimonialDto.logoUrl !== oldLogoUrl
    ) {
      try {
        await this.mediaService.removeByUrl(oldLogoUrl);
      } catch (err) {
        // you can log this but still proceed with update
        console.warn('Failed to delete old logo:', err);
      }
    }

    if (
      updateTestimonialDto.coverImageUrl &&
      oldCoverImageUrl &&
      updateTestimonialDto.coverImageUrl !== oldCoverImageUrl
    ) {
      try {
        await this.mediaService.removeByUrl(oldCoverImageUrl);
      } catch (err) {
        // you can log this but still proceed with update
        console.warn('Failed to delete old cover image:', err);
      }
    }
    
    const oldValues = { ...testimonial };
    
    Object.assign(testimonial, updateTestimonialDto);
    const updatedTestimonial = await this.testimonialsRepository.save(testimonial);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'testimonial',
      entityId: id,
      oldValues,
      newValues: updateTestimonialDto,
    });
    
    return updatedTestimonial;
  }

  async updateStatus(id: string, updateStatusDto: UpdateTestimonialStatusDto, userId: string, username: string) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    
    const oldValues = { status: testimonial.status };
    
    testimonial.status = updateStatusDto.status;
    const updatedTestimonial = await this.testimonialsRepository.save(testimonial);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'testimonial',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedTestimonial;
  }

  async remove(id: string, userId: string, username: string) {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    
    await this.testimonialsRepository.remove(testimonial);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'testimonial',
      entityId: id,
      oldValues: testimonial,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderTestimonialsDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.testimonialsRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'testimonial',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'publish' | 'draft' | 'delete', userId: string, username: string) {
    if (action === 'publish') {
      await this.testimonialsRepository.update(
        { id: In(ids) },
        { status: TestimonialStatus.PUBLISHED }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'testimonial',
        newValues: { status: TestimonialStatus.PUBLISHED, ids },
      });
    } else if (action === 'draft') {
      await this.testimonialsRepository.update(
        { id: In(ids) },
        { status: TestimonialStatus.DRAFT }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'testimonial',
        newValues: { status: TestimonialStatus.DRAFT, ids },
      });
    } else if (action === 'delete') {
      const testimonials = await this.testimonialsRepository.find({ where: { id: In(ids) } });
      await this.testimonialsRepository.remove(testimonials);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'testimonial',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatTestimonial(testimonial: Testimonial, language: LanguageEnum) {
    const result = {
      id: testimonial.id,
      status: testimonial.status,
      displayOrder: testimonial.displayOrder,
      logoUrl: testimonial.logoUrl,
      coverImageUrl: testimonial.coverImageUrl,
      createdAt: testimonial.createdAt,
      updatedAt: testimonial.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        name: testimonial.name_en,
        position: testimonial.position_en,
        company: testimonial.company_en,
        content: testimonial.content_en,
      };
    } else {
      return {
        ...result,
        name: testimonial.name_ar,
        position: testimonial.position_ar,
        company: testimonial.company_ar,
        content: testimonial.content_ar,
      };
    }
  }
}