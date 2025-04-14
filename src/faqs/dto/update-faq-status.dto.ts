// src/faqs/dto/update-faq-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class UpdateFaqStatusDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}