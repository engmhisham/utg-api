// src/projects/dto/create-project.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class CreateProjectDto {
  @IsEnum(StatusEnum)
  @IsOptional()
  status?: StatusEnum;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  description_en: string;

  @IsUrl()
  @IsOptional()
  url_en?: string;

  @IsString()
  @IsNotEmpty()
  title_ar: string;

  @IsString()
  @IsNotEmpty()
  description_ar: string;

  @IsUrl()
  @IsOptional()
  url_ar?: string;

  @IsString()
  @IsNotEmpty()
  image1Url: string;

  @IsString()
  @IsOptional()
  image2Url?: string;

  @IsString()
  @IsOptional()
  image3Url?: string;

  @IsString()
  @IsOptional()
  image4Url?: string;
}