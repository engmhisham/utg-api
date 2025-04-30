// src/media/media.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import * as sharp from 'sharp';
import { LanguageEnum } from '../common/enums/language.enum';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(
    language: LanguageEnum = LanguageEnum.EN,
    params: PaginationParams = {},
    filters: { category?: string; tags?: string[] } = {},
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 24, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
    const query = this.mediaRepository.createQueryBuilder('media');

    if (filters.category) {
      query.andWhere('media.category = :category', { category: filters.category });
    }
    if (filters.tags && filters.tags.length > 0) {
      query.andWhere('media.tags && :tags', { tags: filters.tags });
    }

    query.orderBy(`media.${sortBy}`, sortOrder as 'ASC' | 'DESC');
    const total = await query.getCount();
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const items = await query.getMany();
    const formattedItems = items.map(item => this.formatMedia(item, language));

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, language: LanguageEnum = LanguageEnum.EN): Promise<any> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return this.formatMedia(media, language);
  }

  async create(file: Express.Multer.File, createMediaDto: CreateMediaDto): Promise<Media> {
    console.log('createMediaDto received:', createMediaDto);
    let width: number | null = null;
    let height: number | null = null;
    try {
      const metadata = await sharp(file.path).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }

    const folder = createMediaDto.category || 'general';
    const newPath = `uploads/${folder}/${file.filename}`;

    // 🆕 Move the file into the correct subfolder
    const oldPath = path.join(process.cwd(), file.path);
    const newFullPath = path.join(process.cwd(), newPath);

    // Ensure folder exists
    const dir = path.dirname(newFullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(oldPath, newFullPath); // Move file

    const newMedia = new Media();
    newMedia.filename = file.filename;
    newMedia.originalname = file.originalname;
    newMedia.mimetype = file.mimetype;
    newMedia.path = newPath;
    newMedia.size = file.size;
    newMedia.width = width;
    newMedia.height = height;
    newMedia.alt_en = createMediaDto.alt_en || file.originalname;
    newMedia.title_en = createMediaDto.title_en || file.originalname;
    newMedia.alt_ar = createMediaDto.alt_ar ?? null;
    newMedia.title_ar = createMediaDto.title_ar ?? null;
    newMedia.caption_en = createMediaDto.caption_en ?? null;
    newMedia.caption_ar = createMediaDto.caption_ar ?? null;
    newMedia.description_en = createMediaDto.description_en ?? null;
    newMedia.description_ar = createMediaDto.description_ar ?? null;
    newMedia.credits = createMediaDto.credits ?? null;
    newMedia.tags = createMediaDto.tags || [];
    newMedia.category = folder ?? null;
    newMedia.focalPoint = createMediaDto.focalPoint ?? null;
    newMedia.license = createMediaDto.license ?? null;
    newMedia.usage = [];
    console.log('Saving media with path:', newPath);
    return this.mediaRepository.save(newMedia);
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    Object.keys(updateMediaDto).forEach((key: keyof UpdateMediaDto) => {
      const value = updateMediaDto[key];
      (media as any)[key] = value !== undefined ? value : null;
    });
    return this.mediaRepository.save(media);
  }

  async remove(id: string): Promise<{ id: string }> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    if (media.usage && media.usage.length > 0) {
      throw new Error('Cannot delete media that is currently in use');
    }
    try {
      await unlinkAsync(path.join(process.cwd(), media.path));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    await this.mediaRepository.remove(media);
    return { id };
  }

  async addUsage(
    id: string,
    usage: { moduleType: string; moduleId: string; field: string },
  ): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    media.usage = media.usage ?? [];
    const exists = media.usage.some(
      u =>
        u.moduleType === usage.moduleType &&
        u.moduleId === usage.moduleId &&
        u.field === usage.field,
    );
    if (!exists) {
      media.usage.push(usage);
      await this.mediaRepository.save(media);
    }
    return media;
  }

  async removeUsage(
    id: string,
    usage: { moduleType: string; moduleId: string; field: string },
  ): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    media.usage = media.usage
      ? media.usage.filter(
          u =>
            !(
              u.moduleType === usage.moduleType &&
              u.moduleId === usage.moduleId &&
              u.field === usage.field
            ),
        )
      : null;
    await this.mediaRepository.save(media);
    return media;
  }

  private formatMedia(media: Media, language: LanguageEnum) {
    const base = {
      id: media.id,
      filename: media.filename,
      originalname: media.originalname,
      path: media.path,
      url: `/${media.path}`,
      mimetype: media.mimetype,
      size: media.size,
      width: media.width,
      height: media.height,
      credits: media.credits,
      tags: media.tags,
      category: media.category,
      usage: media.usage,
      focalPoint: media.focalPoint,
      license: media.license,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };

    if (language === LanguageEnum.EN) {
      return {
        ...base,
        alt: media.alt_en,
        title: media.title_en,
        caption: media.caption_en,
        description: media.description_en,
      };
    } else {
      return {
        ...base,
        alt: media.alt_ar,
        title: media.title_ar,
        caption: media.caption_ar,
        description: media.description_ar,
      };
    }
  }

  async removeByUrl(input: string): Promise<void> {
    let relPath: string;
  
    // 1️⃣ Handle full URL (http://host/uploads/xxx.jpg) or path (/uploads/xxx.jpg)
    try {
      const parsed = new URL(input);
      relPath = parsed.pathname.replace(/^\/api/, '').replace(/^\/+/, '');
    } catch {
      // Not a full URL, treat it as path
      relPath = input.replace(/^\/+/, '');
    }
  
    // 2️⃣ Find in DB
    const media = await this.mediaRepository.findOne({ where: { path: relPath } });
    if (!media) {
      console.warn('⚠️ No media found to remove for path:', relPath);
      return;
    }
  
    // 3️⃣ Delete from disk if not in use
    if (!media.usage?.length) {
      try {
        await unlinkAsync(path.join(process.cwd(), media.path));
      } catch (err) {
        console.error('Failed to delete file from disk:', err);
      }
    }
  
    // 4️⃣ Remove from DB
    await this.mediaRepository.remove(media);
  }
  
}
