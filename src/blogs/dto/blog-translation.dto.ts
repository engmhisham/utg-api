// src/blogs/dto/blog-translation.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class BlogTranslationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}