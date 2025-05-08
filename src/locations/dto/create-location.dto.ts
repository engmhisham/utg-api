// src/locations/dto/create-location.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { LocationStatus } from 'src/common/enums/locations.enum';


export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  title_ar: string;

  @IsOptional()
  description_en?: string;

  @IsOptional()
  description_ar?: string;

  @IsOptional()
  cover?: string;

  @IsOptional()
  city_en?: string;

  @IsOptional()
  city_ar?: string;

  @IsOptional()
  phone_en?: string;

  @IsOptional()
  phone_ar?: string;

  @IsOptional()
  map_url?: string;

  @IsOptional()
  working_hours_en?: string;

  @IsOptional()
  working_hours_ar?: string;

  @IsOptional()
  content_en?: string;

  @IsOptional()
  content_ar?: string;
}
