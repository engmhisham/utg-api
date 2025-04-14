// src/clients/dto/update-client-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class UpdateClientStatusDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}