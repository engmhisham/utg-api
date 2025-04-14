import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateReadStatusDto } from './dto/update-read-status.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactMessagesRepository: Repository<ContactMessage>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    language?: LanguageEnum,
    read?: boolean,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<ContactMessage>> {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'DESC' } = params;
    
    const query = this.contactMessagesRepository.createQueryBuilder('contactMessage');
    
    if (language) {
      query.andWhere('contactMessage.language = :language', { language });
    }
    
    if (read !== undefined) {
      query.andWhere('contactMessage.read = :read', { read });
    }
    
    query.orderBy(`contactMessage.${sortBy}`, sortOrder);
    
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

  async findOne(id: string): Promise<ContactMessage> {
    const contactMessage = await this.contactMessagesRepository.findOne({ where: { id } });
    
    if (!contactMessage) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    
    return contactMessage;
  }

  async create(createContactMessageDto: CreateContactMessageDto): Promise<ContactMessage> {
    const contactMessage = this.contactMessagesRepository.create({
      ...createContactMessageDto,
      date: new Date(),
      read: false,
    });
    
    return this.contactMessagesRepository.save(contactMessage);
  }

  async updateReadStatus(id: string, updateReadStatusDto: UpdateReadStatusDto, userId: string, username: string): Promise<ContactMessage> {
    const contactMessage = await this.contactMessagesRepository.findOne({ where: { id } });
    
    if (!contactMessage) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    
    const oldValues = { read: contactMessage.read };
    
    contactMessage.read = updateReadStatusDto.read;
    const updatedContactMessage = await this.contactMessagesRepository.save(contactMessage);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'contact-message',
      entityId: id,
      oldValues,
      newValues: updateReadStatusDto,
    });
    
    return updatedContactMessage;
  }

  async remove(id: string, userId: string, username: string): Promise<{ id: string }> {
    const contactMessage = await this.contactMessagesRepository.findOne({ where: { id } });
    
    if (!contactMessage) {
      throw new NotFoundException(`Contact message with ID ${id} not found`);
    }
    
    await this.contactMessagesRepository.remove(contactMessage);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'contact-message',
      entityId: id,
      oldValues: contactMessage,
    });
    
    return { id };
  }

  async bulkAction(ids: string[], action: 'mark-read' | 'mark-unread' | 'delete', userId: string, username: string) {
    if (action === 'mark-read') {
      await this.contactMessagesRepository.update(
        { id: In(ids) },
        { read: true }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'contact-message',
        newValues: { read: true, ids },
      });
    } else if (action === 'mark-unread') {
      await this.contactMessagesRepository.update(
        { id: In(ids) },
        { read: false }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'contact-message',
        newValues: { read: false, ids },
      });
    } else if (action === 'delete') {
      const contactMessages = await this.contactMessagesRepository.find({ where: { id: In(ids) } });
      await this.contactMessagesRepository.remove(contactMessages);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'contact-message',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }
}