// src/brands/dto/update-brand-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class UpdateBrandStatusDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}