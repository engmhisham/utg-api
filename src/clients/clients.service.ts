import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { ReorderClientsDto } from './dto/reorder-clients.dto';
import { StatusEnum } from '../common/enums/status.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private auditLogsService: AuditLogsService,
    private readonly mediaService: MediaService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: StatusEnum,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.clientsRepository.createQueryBuilder('client');
    
    if (status) {
      query.where('client.status = :status', { status });
    }
    
    query.orderBy(`client.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const clients = await query.getMany();
    
    // Format the response based on language
    const items = clients.map(client => this.formatClient(client, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    return this.formatClient(client, language);
  }

  async create(createClientDto: CreateClientDto, userId: string, username: string) {
    const client = this.clientsRepository.create(createClientDto);
    const savedClient = await this.clientsRepository.save(client);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'client',
      entityId: savedClient.id,
      newValues: createClientDto,
    });
    
    return savedClient;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string, username: string) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    

    // ① capture old logo URL
    const oldLogoUrl = client.logoUrl;

    // ② if the DTO contains a new logoUrl and it's different,
    //     delete the old one from media storage
    if (
      updateClientDto.logoUrl &&
      oldLogoUrl &&
      updateClientDto.logoUrl !== oldLogoUrl
    ) {
      try {
        await this.mediaService.removeByUrl(oldLogoUrl);
      } catch (err) {
        // you can log this but still proceed with update
        console.warn('Failed to delete old logo:', err);
      }
    }


    const oldValues = { ...client };
    
    Object.assign(client, updateClientDto);
    const updatedClient = await this.clientsRepository.save(client);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'client',
      entityId: id,
      oldValues,
      newValues: updateClientDto,
    });
    
    return updatedClient;
  }

  async updateStatus(id: string, updateStatusDto: UpdateClientStatusDto, userId: string, username: string) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    const oldValues = { status: client.status };
    
    client.status = updateStatusDto.status;
    const updatedClient = await this.clientsRepository.save(client);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'client',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedClient;
  }

  async remove(id: string, userId: string, username: string) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    
    await this.clientsRepository.remove(client);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'client',
      entityId: id,
      oldValues: client,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderClientsDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.clientsRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'client',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', userId: string, username: string) {
    if (action === 'activate') {
      await this.clientsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.ACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'client',
        newValues: { status: StatusEnum.ACTIVE, ids },
      });
    } else if (action === 'deactivate') {
      await this.clientsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.INACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'client',
        newValues: { status: StatusEnum.INACTIVE, ids },
      });
    } else if (action === 'delete') {
      const clients = await this.clientsRepository.find({ where: { id: In(ids) } });
      await this.clientsRepository.remove(clients);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'client',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatClient(client: Client, language: LanguageEnum) {
    const result = {
      id: client.id,
      status: client.status,
      displayOrder: client.displayOrder,
      logoUrl: client.logoUrl,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        title: client.title_en,
        description: client.description_en,
        url: client.url_en,
      };
    } else {
      return {
        ...result,
        title: client.title_ar,
        description: client.description_ar,
        url: client.url_ar,
      };
    }
  }
}