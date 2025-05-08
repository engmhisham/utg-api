import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateLocationStatusDto } from './dto/update-location-status.dto';
import { ReorderLocationsDto } from './dto/reorder-locations.dto';
import { BulkActionDto } from './dto/bulk-action.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { LocationStatus } from '../common/enums/locations.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly auditLogsService: AuditLogsService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: LocationStatus,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;

    const query = this.locationRepo.createQueryBuilder('location');

    if (status) {
      query.where('location.status = :status', { status });
    }

    query.orderBy(`location.${sortBy}`, sortOrder).skip((page - 1) * limit).take(limit);

    const [locations, total] = await query.getManyAndCount();

    const items = locations.map(loc => this.formatLocation(loc, language));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return this.formatLocation(location, language);
  }

  async create(dto: CreateLocationDto, userId: string, username: string) {
    const location = this.locationRepo.create(dto);
    const saved = await this.locationRepo.save(location);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'location',
      entityId: saved.id,
      newValues: dto,
    });

    return saved;
  }

  async update(id: string, dto: UpdateLocationDto, userId: string, username: string) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');

    if (dto.cover && location.cover && dto.cover !== location.cover) {
      try {
        await this.mediaService.removeByUrl(location.cover);
      } catch (err) {
        console.warn('Failed to remove old cover image:', err);
      }
    }

    const oldValues = { ...location };
    Object.assign(location, dto);
    const updated = await this.locationRepo.save(location);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'location',
      entityId: id,
      oldValues,
      newValues: dto,
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateLocationStatusDto, userId: string, username: string) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');

    const oldValues = { status: location.status };
    location.status = dto.status;
    const updated = await this.locationRepo.save(location);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'location',
      entityId: id,
      oldValues,
      newValues: dto,
    });

    return updated;
  }

  async remove(id: string, userId: string, username: string) {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');

    await this.locationRepo.remove(location);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'location',
      entityId: id,
      oldValues: location,
    });

    return { id };
  }

  async reorder(dto: ReorderLocationsDto, userId: string, username: string) {
    const updates = dto.items.map(item =>
      this.locationRepo.update(item.id, { displayOrder: item.displayOrder })
    );

    await Promise.all(updates);

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'location',
      newValues: { reordered: dto.items },
    });

    return { success: true };
  }

  async bulkAction(dto: BulkActionDto, userId: string, username: string) {
    const { ids, action } = dto;

    if (action === 'activate' || action === 'deactivate') {
      await this.locationRepo.update(
        { id: In(ids) },
        { status: action === 'activate' ? LocationStatus.PUBLISHED : LocationStatus.DRAFT },
      );
    } else if (action === 'delete') {
      const locations = await this.locationRepo.find({ where: { id: In(ids) } });
      await this.locationRepo.remove(locations);
    }

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'location',
      newValues: { action, ids },
    });

    return { success: true };
  }

  private formatLocation(loc: Location, lang: LanguageEnum) {
    return {
      id: loc.id,
      status: loc.status,
      slug: loc.slug,
      displayOrder: loc.displayOrder,
      cover: loc.cover,
      map_url: loc.map_url,
      city: lang === LanguageEnum.EN ? loc.city_en : loc.city_ar,
      phone: lang === LanguageEnum.EN ? loc.phone_en : loc.phone_ar,
      title: lang === LanguageEnum.EN ? loc.title_en : loc.title_ar,
      description: lang === LanguageEnum.EN ? loc.description_en : loc.description_ar,
      working_hours: lang === LanguageEnum.EN ? loc.working_hours_en : loc.working_hours_ar,
      content: lang === LanguageEnum.EN ? loc.content_en : loc.content_ar,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt,
    };
  }
}
