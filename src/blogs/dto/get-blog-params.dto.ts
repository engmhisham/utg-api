// src/blogs/dto/get-blog-params.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { LanguageEnum } from '../../common/enums/language.enum';
import { BlogStatus } from '../entities/blog.entity';

export class GetBlogParamsDto {
  @IsEnum(LanguageEnum)
  @IsOptional()
  language?: LanguageEnum;

  @IsEnum(BlogStatus)
  @IsOptional()
  status?: BlogStatus;
}