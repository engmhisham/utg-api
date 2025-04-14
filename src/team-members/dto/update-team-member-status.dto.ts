
// src/team-members/dto/update-team-member-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class UpdateTeamMemberStatusDto {
  @IsEnum(StatusEnum)
  @IsNotEmpty()
  status: StatusEnum;
}