import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateBlogStatusDto } from './dto/update-blog-status.dto';
import { BlogTranslationDto } from './dto/blog-translation.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: BlogStatus,
    params: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
    
    const query = this.blogsRepository.createQueryBuilder('blog');
    
    if (status) {
      query.where('blog.status = :status', { status });
    }
    
    query.orderBy(`blog.${sortBy}`, sortOrder);
    
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    
    query.skip(skip).take(limit);
    
    const blogs = await query.getMany();
    
    // Format the response based on language
    const items = blogs.map(blog => this.formatBlog(blog, language));
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    return this.formatBlog(blog, language);
  }

  async findBySlug(slug: string, language: LanguageEnum = LanguageEnum.EN) {
    const blog = await this.blogsRepository.findOne({ where: { slug } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with slug '${slug}' not found`);
    }
    
    return this.formatBlog(blog, language);
  }

  async create(createBlogDto: CreateBlogDto, userId: string, username: string) {
    // Check if slug already exists
    const existingBlog = await this.blogsRepository.findOne({
      where: { slug: createBlogDto.slug },
    });
    
    if (existingBlog) {
      throw new ConflictException(`Blog with slug '${createBlogDto.slug}' already exists`);
    }
    
    const blog = this.blogsRepository.create(createBlogDto);
    
    if (createBlogDto.status === BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }
    
    const savedBlog = await this.blogsRepository.save(blog);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'blog',
      entityId: savedBlog.id,
      newValues: createBlogDto,
    });
    
    return savedBlog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    // Check if slug is being changed and if new slug already exists
    if (updateBlogDto.slug && updateBlogDto.slug !== blog.slug) {
      const existingBlog = await this.blogsRepository.findOne({
        where: { slug: updateBlogDto.slug },
      });
      
      if (existingBlog) {
        throw new ConflictException(`Blog with slug '${updateBlogDto.slug}' already exists`);
      }
    }
    
    const oldValues = { ...blog };
    
    // If status is being changed to published and blog was not published before
    if (updateBlogDto.status === BlogStatus.PUBLISHED && blog.status !== BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }
    
    Object.assign(blog, updateBlogDto);
    const updatedBlog = await this.blogsRepository.save(blog);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: updateBlogDto,
    });
    
    return updatedBlog;
  }

  async updateStatus(id: string, updateStatusDto: UpdateBlogStatusDto, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    const oldValues = { status: blog.status };
    
    // If changing status to published and blog was not published before
    if (updateStatusDto.status === BlogStatus.PUBLISHED && blog.status !== BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }
    
    blog.status = updateStatusDto.status;
    const updatedBlog = await this.blogsRepository.save(blog);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: updateStatusDto,
    });
    
    return updatedBlog;
  }

  async updateTranslation(
    id: string, 
    language: LanguageEnum, 
    translationDto: BlogTranslationDto, 
    userId: string, 
    username: string
  ) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    const oldValues = { ...blog };
    const updateData = {};
    
    if (language === LanguageEnum.EN) {
      updateData['title_en'] = translationDto.title;
      updateData['description_en'] = translationDto.description;
      updateData['content_en'] = translationDto.content;
    } else if (language === LanguageEnum.AR) {
      updateData['title_ar'] = translationDto.title;
      updateData['description_ar'] = translationDto.description;
      updateData['content_ar'] = translationDto.content;
    }
    
    Object.assign(blog, updateData);
    const updatedBlog = await this.blogsRepository.save(blog);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: { language, ...translationDto },
    });
    
    return updatedBlog;
  }

  async remove(id: string, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    await this.blogsRepository.remove(blog);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.DELETE,
      entity: 'blog',
      entityId: id,
      oldValues: blog,
    });
    
    return { id };
  }

  async bulkAction(ids: string[], action: 'publish' | 'draft' | 'archive' | 'delete', userId: string, username: string) {
    if (action === 'publish') {
      await this.blogsRepository.update(
        { id: In(ids) },
        { 
          status: BlogStatus.PUBLISHED,
          publishedAt: new Date()
        }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.PUBLISHED, ids },
      });
    } else if (action === 'draft') {
      await this.blogsRepository.update(
        { id: In(ids) },
        { status: BlogStatus.DRAFT }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.DRAFT, ids },
      });
    } else if (action === 'archive') {
      await this.blogsRepository.update(
        { id: In(ids) },
        { status: BlogStatus.ARCHIVED }
      );
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.ARCHIVED, ids },
      });
    } else if (action === 'delete') {
      const blogs = await this.blogsRepository.find({ where: { id: In(ids) } });
      await this.blogsRepository.remove(blogs);
      
      // Log the action
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.DELETE,
        entity: 'blog',
        newValues: { deleted: ids },
      });
    }
    
    return { success: true };
  }

  private formatBlog(blog: Blog, language: LanguageEnum) {
    const result = {
      id: blog.id,
      slug: blog.slug,
      status: blog.status,
      coverImageUrl: blog.coverImageUrl,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
    
    if (language === LanguageEnum.EN) {
      return {
        ...result,
        title: blog.title_en,
        description: blog.description_en,
        content: blog.content_en,
      };
    } else {
      return {
        ...result,
        title: blog.title_ar,
        description: blog.description_ar,
        content: blog.content_ar,
      };
    }
  }

  // Method to get a translation object for the frontend
  async getTranslation(id: string, language: LanguageEnum) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    
    if (language === LanguageEnum.EN) {
      return {
        title: blog.title_en,
        description: blog.description_en,
        content: blog.content_en,
      };
    } else {
      return {
        title: blog.title_ar,
        description: blog.description_ar,
        content: blog.content_ar,
      };
    }
  }
}