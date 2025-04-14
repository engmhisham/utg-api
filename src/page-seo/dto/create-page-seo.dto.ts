// src/page-seo/dto/create-page-seo.dto.ts
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LanguageEnum } from '../../common/enums/language.enum';

export class CreatePageSeoDto {
  @IsString()
  @IsNotEmpty()
  pageUrl: string;

  @IsEnum(LanguageEnum)
  @IsNotEmpty()
  language: LanguageEnum;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  metaTitle: string;

  @IsString()
  @IsNotEmpty()
  metaDescription: string;
}
