import { Injectable, NotFoundException } from '@nestjs/common';
import { unlinkSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { PaginationParams, PaginatedResult } from '../common/interfaces/pagination.interface';
import { Express } from 'express';

@Injectable()
export class FilesService {
  private readonly uploadDir = './uploads';

  saveFile(file: Express.Multer.File) {
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: `uploads/${file.filename}`,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  findAll(params: PaginationParams = {}): PaginatedResult<any> {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = params;
      
      const allFiles = readdirSync(this.uploadDir)
        .filter(file => !file.startsWith('.'))
        .map(file => {
          const stats = statSync(join(this.uploadDir, file));
          return {
            filename: file,
            path: `uploads/${file}`,
            url: `/uploads/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            updatedAt: stats.mtime,
          };
        });
      
      // Sort files
      const sortedFiles = allFiles.sort((a, b) => {
        if (sortOrder === 'ASC') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedFiles = sortedFiles.slice(startIndex, endIndex);
      
      return {
        items: paginatedFiles,
        total: allFiles.length,
        page,
        limit,
        totalPages: Math.ceil(allFiles.length / limit),
      };
    } catch (error) {
      console.error('Error reading upload directory:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }
  }

  findOne(filename: string) {
    try {
      const filePath = join(this.uploadDir, filename);
      const stats = statSync(filePath);
      
      return {
        filename,
        path: `uploads/${filename}`,
        url: `/uploads/${filename}`,
        size: stats.size,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      };
    } catch (error) {
      throw new NotFoundException(`File ${filename} not found`);
    }
  }

  remove(filename: string) {
    try {
      const filePath = join(this.uploadDir, filename);
      unlinkSync(filePath);
      return { deleted: true, filename };
    } catch (error) {
      throw new NotFoundException(`File ${filename} not found`);
    }
  }
}