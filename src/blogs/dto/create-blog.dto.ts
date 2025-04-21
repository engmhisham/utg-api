// src/blogs/dto/create-blog.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BlogStatus } from '../entities/blog.entity';

export class CreateBlogDto {
  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus = BlogStatus.DRAFT;

  @IsString()
  @IsNotEmpty()
  slug: string;

  // English content
  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  description_en: string;

  @IsString()
  @IsNotEmpty()
  content_en: string;

  // Arabic content
  @IsString()
  @IsNotEmpty()
  title_ar: string;

  @IsString()
  @IsNotEmpty()
  description_ar: string;

  @IsString()
  @IsNotEmpty()
  content_ar: string;

  @IsString()
  @IsNotEmpty()
  coverImageUrl: string;
}