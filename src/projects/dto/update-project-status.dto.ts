// src/projects/dto/update-project-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class UpdateProjectStatusDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}