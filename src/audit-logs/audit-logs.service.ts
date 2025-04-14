import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create(createAuditLogDto);
    return this.auditLogsRepository.save(auditLog);
  }

  async findAll(params: PaginationParams = {}): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
    
    const query = this.auditLogsRepository.createQueryBuilder('auditLog');
    
    // Apply filters if needed
    // if (userId) {
    //   query.andWhere('auditLog.userId = :userId', { userId });
    // }
    
    query.orderBy(`auditLog.${sortBy}`, sortOrder);
    
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

  async findByEntity(entity: string, entityId?: string, params: PaginationParams = {}): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
    
    const query = this.auditLogsRepository.createQueryBuilder('auditLog')
      .where('auditLog.entity = :entity', { entity });
    
    if (entityId) {
      query.andWhere('auditLog.entityId = :entityId', { entityId });
    }
    
    query.orderBy(`auditLog.${sortBy}`, sortOrder);
    
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

  async findByUser(userId: string, params: PaginationParams = {}): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
    
    const query = this.auditLogsRepository.createQueryBuilder('auditLog')
      .where('auditLog.userId = :userId', { userId });
    
    query.orderBy(`auditLog.${sortBy}`, sortOrder);
    
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
}