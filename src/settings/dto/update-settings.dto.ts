import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { LanguageEnum } from '../../common/enums/language.enum';

export class UpdateSettingsDto {
  @IsEnum(LanguageEnum)
  @IsOptional()
  language?: LanguageEnum;

  @IsString()
  @IsOptional()
  siteName?: string;

  @IsString()
  @IsOptional()
  siteDescription?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactAddress?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @IsObject()
  @IsOptional()
  additionalSettings?: Record<string, any>;
}