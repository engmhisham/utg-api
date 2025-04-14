import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { UpdateTeamMemberStatusDto } from './dto/update-team-member-status.dto';
import { ReorderTeamMembersDto } from './dto/reorder-team-members.dto';
import { StatusEnum } from '../common/enums/status.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectRepository(TeamMember)
    private teamMembersRepository: Repository<TeamMember>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: StatusEnum,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.teamMembersRepository.createQueryBuilder('teamMember');
    
    if (status) {
      query.where('teamMember.status = :status', { status });
    }
    
    query.orderBy(`teamMember.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const teamMembers = await query.getMany();
    
    // Format the response based on language
    const items = teamMembers.map(teamMember => this.formatTeamMember(teamMember, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const teamMember = await this.teamMembersRepository.findOne({ where: { id } });
    
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    return this.formatTeamMember(teamMember, language);
  }

  async create(createTeamMemberDto: CreateTeamMemberDto, userId: string, username: string) {
    const teamMember = this.teamMembersRepository.create(createTeamMemberDto);
    const savedTeamMember = await this.teamMembersRepository.save(teamMember);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'team-member',
      entityId: savedTeamMember.id,
      newValues: createTeamMemberDto,
    });
    
    return savedTeamMember;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto, userId: string, username: string) {
    const teamMember = await this.teamMembersRepository.findOne({ where: { id } });
    
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    const oldValues = { ...teamMember };
    
    Object.assign(teamMember, updateTeamMemberDto);
    const updatedTeamMember = await this.teamMembersRepository.save(teamMember);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'team-member',
      entityId: id,
      oldValues,
      newValues: updateTeamMemberDto,
    });
    
    return updatedTeamMember;
  }

  async updateStatus(id: string, updateStatusDto: UpdateTeamMemberStatusDto, userId: string, username: string) {
    const teamMember = await this.teamMembersRepository.findOne({ where: { id } });
    
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    const oldValues = { status: teamMember.status };
    
    teamMember.status = updateStatusDto.status;
    const updatedTeamMember = await this.teamMembersRepository.save(teamMember);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'team-member',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedTeamMember;
  }

  async remove(id: string, userId: string, username: string) {
    const teamMember = await this.teamMembersRepository.findOne({ where: { id } });
    
    if (!teamMember) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }
    
    await this.teamMembersRepository.remove(teamMember);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'team-member',
      entityId: id,
      oldValues: teamMember,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderTeamMembersDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.teamMembersRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'team-member',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', userId: string, username: string) {
    if (action === 'activate') {
      await this.teamMembersRepository.update(
        { id: In(ids) },
        { status: StatusEnum.ACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'team-member',
        newValues: { status: StatusEnum.ACTIVE, ids },
      });
    } else if (action === 'deactivate') {
      await this.teamMembersRepository.update(
        { id: In(ids) },
        { status: StatusEnum.INACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'team-member',
        newValues: { status: StatusEnum.INACTIVE, ids },
      });
    } else if (action === 'delete') {
      const teamMembers = await this.teamMembersRepository.find({ where: { id: In(ids) } });
      await this.teamMembersRepository.remove(teamMembers);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'team-member',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatTeamMember(teamMember: TeamMember, language: LanguageEnum) {
    const result = {
      id: teamMember.id,
      status: teamMember.status,
      displayOrder: teamMember.displayOrder,
      coverImageUrl: teamMember.coverImageUrl,
      createdAt: teamMember.createdAt,
      updatedAt: teamMember.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        name: teamMember.name_en,
        title: teamMember.title_en,
      };
    } else {
      return {
        ...result,
        name: teamMember.name_ar,
        title: teamMember.title_ar,
      };
    }
  }
}