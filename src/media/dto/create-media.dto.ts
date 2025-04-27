// src/media/dto/create-media.dto.ts
import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsOptional()
  alt_en?: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsString()
  @IsOptional()
  alt_ar?: string;

  @IsString()
  @IsOptional()
  title_ar?: string;

  @IsString()
  @IsOptional()
  caption_en?: string;

  @IsString()
  @IsOptional()
  caption_ar?: string;

  @IsString()
  @IsOptional()
  description_en?: string;

  @IsString()
  @IsOptional()
  description_ar?: string;

  @IsString()
  @IsOptional()
  credits?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  focalPoint?: string;

  @IsString()
  @IsOptional()
  license?: string;
}
