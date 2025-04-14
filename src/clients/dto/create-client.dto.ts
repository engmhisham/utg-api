// src/clients/dto/create-client.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class CreateClientDto {
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
  logoUrl: string;
}
