import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ReorderProjectsDto } from './dto/reorder-projects.dto';
import { StatusEnum } from '../common/enums/status.enum';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: StatusEnum,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'displayOrder', sortOrder = 'ASC' } = params;
    
    const query = this.projectsRepository.createQueryBuilder('project');
    
    if (status) {
      query.where('project.status = :status', { status });
    }
    
    query.orderBy(`project.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const projects = await query.getMany();
    
    // Format the response based on language
    const items = projects.map(project => this.formatProject(project, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return this.formatProject(project, language);
  }

  async create(createProjectDto: CreateProjectDto, userId: string, username: string) {
    const project = this.projectsRepository.create(createProjectDto);
    const savedProject = await this.projectsRepository.save(project);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'project',
      entityId: savedProject.id,
      newValues: createProjectDto,
    });
    
    return savedProject;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string, username: string) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    const oldValues = { ...project };
    
    Object.assign(project, updateProjectDto);
    const updatedProject = await this.projectsRepository.save(project);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'project',
      entityId: id,
      oldValues,
      newValues: updateProjectDto,
    });
    
    return updatedProject;
  }

  async updateStatus(id: string, updateStatusDto: UpdateProjectStatusDto, userId: string, username: string) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    const oldValues = { status: project.status };
    
    project.status = updateStatusDto.status;
    const updatedProject = await this.projectsRepository.save(project);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'project',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedProject;
  }

  async remove(id: string, userId: string, username: string) {
    const project = await this.projectsRepository.findOne({ where: { id } });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    await this.projectsRepository.remove(project);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'project',
      entityId: id,
      oldValues: project,
    });
    
    return { id };
  }

  async reorder(reorderDto: ReorderProjectsDto, userId: string, username: string) {
    const updates = reorderDto.items.map(item => {
      return this.projectsRepository.update(item.id, { displayOrder: item.displayOrder });
    });
    
    await Promise.all(updates);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'project',
      newValues: { reordered: reorderDto.items },
    });
    
    return { success: true };
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', userId: string, username: string) {
    if (action === 'activate') {
      await this.projectsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.ACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'project',
        newValues: { status: StatusEnum.ACTIVE, ids },
      });
    } else if (action === 'deactivate') {
      await this.projectsRepository.update(
        { id: In(ids) },
        { status: StatusEnum.INACTIVE }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'project',
        newValues: { status: StatusEnum.INACTIVE, ids },
      });
    } else if (action === 'delete') {
      const projects = await this.projectsRepository.find({ where: { id: In(ids) } });
      await this.projectsRepository.remove(projects);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'project',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatProject(project: Project, language: LanguageEnum) {
    const result = {
      id: project.id,
      status: project.status,
      displayOrder: project.displayOrder,
      image1Url: project.image1Url,
      image2Url: project.image2Url,
      image3Url: project.image3Url,
      image4Url: project.image4Url,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        title: project.title_en,
        description: project.description_en,
        url: project.url_en,
      };
    } else {
      return {
        ...result,
        title: project.title_ar,
        description: project.description_ar,
        url: project.url_ar,
      };
    }
  }
}