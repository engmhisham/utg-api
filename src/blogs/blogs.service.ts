// src/blogs/blogs.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { Blog, BlogStatus } from './entities/blog.entity';
import { Media } from '../media/entities/media.entity';
import { MediaService } from '../media/media.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateBlogStatusDto } from './dto/update-blog-status.dto';
import { BlogTranslationDto } from './dto/blog-translation.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { URL } from 'url';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,

    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private mediaService: MediaService,
    private auditLogsService: AuditLogsService,
    private categoriesService: CategoriesService,
  ) {}
  private toDbPath(fullUrl: string): string {
    try {
      const u = new URL(fullUrl);
      return u.pathname.replace(/^\/api\//, '').replace(/^\//, '');
    } catch {
      // not a valid URL? just return as-is
      return fullUrl;
    }
  }
  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    status?: BlogStatus,
    params: PaginationParams & { category?: string } = {}
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', category} = params;
    const query = this.blogsRepository.createQueryBuilder('blog').leftJoinAndSelect('blog.category', 'category');

    if (status || category) {
      query.where('1 = 1'); // dummy condition to allow dynamic ANDs
    }
    if (status) {
      query.andWhere('blog.status = :status', { status });
    }
    if (category) {
      query.andWhere('category.id = :categoryId', { categoryId: category });
    }

    query.orderBy(`blog.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    const total = await query.getCount();
    query.skip((page - 1) * limit).take(limit);

    const blogs = await query.getMany();
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
    const existing = await this.blogsRepository.findOne({ where: { slug: createBlogDto.slug } });
    if (existing) {
      throw new ConflictException(`Blog with slug '${createBlogDto.slug}' already exists`);
    }

    const blog = this.blogsRepository.create(createBlogDto);

    if (createBlogDto.categoryId) {
      const category = await this.categoriesService.findOne(createBlogDto.categoryId);
      if (category) {
        blog.category = category;
      }
    }

    if (createBlogDto.status === BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }

    const saved = await this.blogsRepository.save(blog);


    if (saved.coverImageUrl) {
      const relPath = this.toDbPath(saved.coverImageUrl);
      const coverMedia = await this.mediaRepository.findOne({ where: { path: relPath } });
      if (coverMedia) {
        await this.mediaService.addUsage(coverMedia.id, {
          moduleType: 'blog',
          moduleId: saved.id,
          field: 'coverImageUrl',
        });
      }
    }

    for (const lang of ['content_en','content_ar'] as const) {
      const raw = (saved as any)[lang] as string;
      let parsed: any;
      try { parsed = JSON.parse(raw) } catch { continue }
      for (const b of parsed.blocks || []) {
        if (b.type === 'image' && b.data?.file?.url) {
          const relPath = this.toDbPath(b.data.file.url);
          const imgMedia = await this.mediaRepository.findOne({ where: { path: relPath } });
          if (imgMedia) {
            await this.mediaService.addUsage(imgMedia.id, {
              moduleType: 'blog',
              moduleId: saved.id,
              field: lang,
            });
          }
        }
      }
    }

    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.CREATE,
      entity: 'blog',
      entityId: saved.id,
      newValues: createBlogDto,
    });

    return saved;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    if (updateBlogDto.slug && updateBlogDto.slug !== blog.slug) {
      const existing = await this.blogsRepository.findOne({ where: { slug: updateBlogDto.slug } });
      if (existing) {
        throw new ConflictException(`Blog with slug '${updateBlogDto.slug}' already exists`);
      }
    }

    // ① capture old logo URL
    const oldCoverImageUrl = blog.coverImageUrl;

    // ② if the DTO contains a new logoUrl and it's different,
    //     delete the old one from media storage
    if (
      updateBlogDto.coverImageUrl &&
      oldCoverImageUrl &&
      updateBlogDto.coverImageUrl !== oldCoverImageUrl
    ) {
      try {
        await this.mediaService.removeByUrl(oldCoverImageUrl);
      } catch (err) {
        // you can log this but still proceed with update
        console.warn('Failed to delete old coverImageUrl:', err);
      }
    }

    const extractImageUrls = (raw: string) => {
      try {
        const doc = JSON.parse(raw);
        return (doc.blocks || [])
          .filter(b => b.type === 'image' && b.data?.file?.url)
          .map(b => b.data.file.url as string);
      } catch {
        return [];
      }
    };
    const oldUrlsEn = extractImageUrls(blog.content_en);
    const oldUrlsAr = extractImageUrls(blog.content_ar);

    const oldValues = { ...blog };
    if (updateBlogDto.status === BlogStatus.PUBLISHED && blog.status !== BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }

    Object.assign(blog, updateBlogDto);
    
    if (updateBlogDto.categoryId) {
      const category = await this.categoriesService.findOne(updateBlogDto.categoryId);
      if (category) {
        blog.category = category;
      }
    }
    
    const updated = await this.blogsRepository.save(blog);

    const newUrlsEn = extractImageUrls(updated.content_en);
    const newUrlsAr = extractImageUrls(updated.content_ar);

    const removedEn = oldUrlsEn.filter(u => !newUrlsEn.includes(u));
    const removedAr = oldUrlsAr.filter(u => !newUrlsAr.includes(u));

    // remove DB usage + file for each
    for (const url of removedEn) {
      const rel = this.toDbPath(url);
      const m = await this.mediaRepository.findOne({ where: { path: rel } });
      if (m) {
        await this.mediaService.removeUsage(m.id, {
          moduleType: 'blog',
          moduleId: updated.id,
          field: 'content_en',
        });
        await this.mediaService.remove(m.id);
      }
    }
    for (const url of removedAr) {
      const rel = this.toDbPath(url);
      const m = await this.mediaRepository.findOne({ where: { path: rel } });
      if (m) {
        await this.mediaService.removeUsage(m.id, {
          moduleType: 'blog',
          moduleId: updated.id,
          field: 'content_ar',
        });
        await this.mediaService.remove(m.id);
      }
    }

    if (updated.coverImageUrl) { 
      const relPath = this.toDbPath(updated.coverImageUrl);
      const coverMedia = await this.mediaRepository.findOne({ where: { path: relPath } });
      if (coverMedia) {
        await this.mediaService.addUsage(coverMedia.id, {
          moduleType: 'blog',
          moduleId: updated.id,
          field: 'coverImageUrl',
        });
      }
    }

    for (const lang of ['content_en', 'content_ar'] as const) {
      const raw = (updated as any)[lang] as string;
      if (!raw) continue;
      let parsed: any;
      try { parsed = JSON.parse(raw); } catch { continue; }
      if (!Array.isArray(parsed.blocks)) continue;
  
      for (const lang of ['content_en', 'content_ar'] as const) {
        const blockUrls = extractImageUrls((updated as any)[lang]);
        for (const url of blockUrls) {
          const rel = this.toDbPath(url);
          const imgMedia = await this.mediaRepository.findOne({ where: { path: rel } });
          if (imgMedia) {
            await this.mediaService.addUsage(imgMedia.id, {
              moduleType: 'blog',
              moduleId: updated.id,
              field: lang,
            });
          }
        }
      }
    }


    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: updateBlogDto,
    });

    return updated;
  }

  async updateStatus(id: string, dto: UpdateBlogStatusDto, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    const oldValues = { status: blog.status };
    if (dto.status === BlogStatus.PUBLISHED && blog.status !== BlogStatus.PUBLISHED) {
      blog.publishedAt = new Date();
    }

    blog.status = dto.status;
    const updated = await this.blogsRepository.save(blog);
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: dto,
    });

    return updated;
  }

  async updateTranslation(
    id: string,
    language: LanguageEnum,
    dto: BlogTranslationDto,
    userId: string,
    username: string,
  ) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    const oldValues = { ...blog };
    if (language === LanguageEnum.EN) {
      blog.title_en = dto.title;
      blog.description_en = dto.description;
      blog.content_en = dto.content;
    } else {
      blog.title_ar = dto.title;
      blog.description_ar = dto.description;
      blog.content_ar = dto.content;
    }

    const updated = await this.blogsRepository.save(blog);
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'blog',
      entityId: id,
      oldValues,
      newValues: { language, ...dto },
    });

    return updated;
  }

  async remove(id: string, userId: string, username: string) {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    if (!blog) throw new NotFoundException(`Blog with ID ${id} not found`);

    // 1️⃣ COVER IMAGE
    if (blog.coverImageUrl) {
      const path = this.toDbPath(blog.coverImageUrl);
      const coverMedia = await this.mediaRepository.findOne({ where: { path } });
      if (coverMedia) {
        await this.mediaService.removeUsage(coverMedia.id, {
          moduleType: 'blog',
          moduleId: id,
          field: 'coverImageUrl',
        });
        await this.mediaService.remove(coverMedia.id);
      }
    }

    // 2️⃣ EDITORJS IMAGES
    for (const lang of ['content_en', 'content_ar'] as const) {
      const raw = (blog as any)[lang] as string;
      if (!raw) continue;
      let parsed: any;
      try { parsed = JSON.parse(raw); } catch { continue; }
      for (const block of parsed.blocks || []) {
        if (block.type === 'image' && block.data?.file?.url) {
          const path = this.toDbPath(block.data.file.url);
          const imgMedia = await this.mediaRepository.findOne({ where: { path } });
          if (imgMedia) {
            await this.mediaService.removeUsage(imgMedia.id, {
              moduleType: 'blog',
              moduleId: id,
              field: lang,
            });
            await this.mediaService.remove(imgMedia.id);
          }
        }
      }
    }

    // 3️⃣ REMOVE BLOG
    await this.blogsRepository.remove(blog);
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

  async bulkAction(
    ids: string[],
    action: 'publish' | 'draft' | 'archive' | 'delete',
    userId: string,
    username: string,
  ) {
    if (action === 'delete') {
      await Promise.all(ids.map(id => this.remove(id, userId, username)));
    } else if (action === 'publish') {
      await this.blogsRepository.update(
        { id: In(ids) },
        { status: BlogStatus.PUBLISHED, publishedAt: new Date() },
      );
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.PUBLISHED, ids },
      });
    } else if (action === 'draft') {
      await this.blogsRepository.update({ id: In(ids) }, { status: BlogStatus.DRAFT });
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.DRAFT, ids },
      });
    } else if (action === 'archive') {
      await this.blogsRepository.update({ id: In(ids) }, { status: BlogStatus.ARCHIVED });
      await this.auditLogsService.create({
        userId,
        username,
        action: ActionType.UPDATE,
        entity: 'blog',
        newValues: { status: BlogStatus.ARCHIVED, ids },
      });
    }

    return { success: true };
  }

  private formatBlog(blog: Blog, language: LanguageEnum) {
    const base = {
      id: blog.id,
      slug: blog.slug,
      status: blog.status,
      coverImageUrl: blog.coverImageUrl,
      publishedAt: blog.publishedAt,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      categoryId: blog.category?.id || null,
      category: blog.category
        ? {
          id: blog.category.id,
          name:
            language === LanguageEnum.EN
              ? blog.category.name_en
              : blog.category.name_ar,
        }
        : null,
    };

    if (language === LanguageEnum.EN) {
      return {
        ...base,
        title: blog.title_en,
        description: blog.description_en,
        content: blog.content_en,
      };
    }

    return {
      ...base,
      title: blog.title_ar,
      description: blog.description_ar,
      content: blog.content_ar,
    };
  }


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
    }

    return {
      title: blog.title_ar,
      description: blog.description_ar,
      content: blog.content_ar,
    };
  }
}
