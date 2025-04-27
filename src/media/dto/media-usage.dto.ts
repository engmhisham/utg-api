// src/media/dto/media-usage.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class MediaUsageDto {
  @IsString()
  @IsNotEmpty()
  moduleType: string;

  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @IsString()
  @IsNotEmpty()
  field: string;
}