import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { LanguageEnum } from '../../common/enums/language.enum';

export class UpdateSeoGeneralDto {
  @IsEnum(LanguageEnum)
  @IsOptional()
  language?: LanguageEnum;

  @IsString()
  @IsOptional()
  gtmId?: string;

  @IsString()
  @IsOptional()
  facebookPixelId?: string;

  @IsString()
  @IsOptional()
  googleAnalyticsId?: string;

  @IsUrl()
  @IsOptional()
  facebookUrl?: string;

  @IsUrl()
  @IsOptional()
  twitterUrl?: string;

  @IsUrl()
  @IsOptional()
  instagramUrl?: string;

  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @IsUrl()
  @IsOptional()
  youtubeUrl?: string;

  @IsString()
  @IsOptional()
  customHeadScripts?: string;

  @IsString()
  @IsOptional()
  customBodyScripts?: string;
}