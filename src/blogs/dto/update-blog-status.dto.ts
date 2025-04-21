// src/blogs/dto/update-blog-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BlogStatus } from '../entities/blog.entity';

export class UpdateBlogStatusDto {
  @IsEnum(BlogStatus)
  @IsNotEmpty()
  status: BlogStatus;
}