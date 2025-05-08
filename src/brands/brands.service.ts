import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
import { ReorderBrandsDto } from './dto/reorder-brands.dto';
import { StatusEnum } from '../common/enums/status.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
    private auditLogsService: AuditLogsService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: StatusEnum,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.brandsRepository.createQueryBuilder('brand');
    
    if (status) {
      query.where('brand.status = :status', { status });
    }
    
    query.orderBy(`brand.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const brands = await query.getMany();
    
    // Format the response based on language
    const items = brands.map(brand => this.formatBrand(brand, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
  //   const brand = await this.brandsRepository.findOne({ where: { id } });
    
  //   if (!brand) {
  //     throw new NotFoundException(`Brand with ID ${id} not found`);
  //   }
    
  //   return this.formatBrand(brand, language);
  // }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(createBrandDto: CreateBrandDto, userId: string, username: string) {
    const brand = this.brandsRepository.create(createBrandDto);
    const savedBrand = await this.brandsRepository.save(brand);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'brand',
      entityId: savedBrand.id,
      newValues: createBrandDto,
    });
    
    return savedBrand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, userId: string, username: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

     // ① capture old logo URL
     const oldLogoUrl = brand.logoUrl;

     // ② if the DTO contains a new logoUrl and it's different,
     //     delete the old one from media storage
     if (
       updateBrandDto.logoUrl &&
       oldLogoUrl &&
       updateBrandDto.logoUrl !== oldLogoUrl
     ) {
       try {
         await this.mediaService.removeByUrl(oldLogoUrl);
       } catch (err) {
         // you can log this but still proceed with update
         console.warn('Failed to delete old logo:', err);
       }
     }
    
    const oldValues = { ...brand };
    
    Object.assign(brand, updateBrandDto);
    const updatedBrand = await this.brandsRepository.save(brand);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'brand',
      entityId: id,
      oldValues,
      newValues: updateBrandDto,
    });
    
    return updatedBrand;
  }

  async updateStatus(id: string, updateStatusDto: UpdateBrandStatusDto, userId: string, username: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    
    const oldValues = { status: brand.status };
    
    brand.status = updateStatusDto.status;
    const updatedBrand = await this.brandsRepository.save(brand);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'brand',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedBrand;
  }

  async remove(id: string, userId: string, username: string) {
    const brand = await this.brandsRepository.findOne({ where: { id } });
    
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    
    await this.brandsRepository.remove(brand);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'brand',
      entityId: id,
      oldValues: brand,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderBrandsDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.brandsRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'brand',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', userId: string, username: string) {
    if (action === 'activate') {
      await this.brandsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.ACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'brand',
        newValues: { status: StatusEnum.ACTIVE, ids },
      });
    } else if (action === 'deactivate') {
      await this.brandsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.INACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'brand',
        newValues: { status: StatusEnum.INACTIVE, ids },
      });
    } else if (action === 'delete') {
      const brands = await this.brandsRepository.find({ where: { id: In(ids) } });
      await this.brandsRepository.remove(brands);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'brand',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatBrand(brand: Brand, language: LanguageEnum) {
    const result = {
      id: brand.id,
      status: brand.status,
      displayOrder: brand.displayOrder,
      logoUrl: brand.logoUrl,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        name: brand.name_en,
        description: brand.description_en,
      };
    } else {
      return {
        ...result,
        name: brand.name_ar,
        description: brand.description_ar,
      };
    }
  }
}