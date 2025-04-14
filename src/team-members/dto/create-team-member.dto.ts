// src/team-members/dto/create-team-member.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';

export class CreateTeamMemberDto {
  @IsEnum(StatusEnum)
  @IsOptional()
  status?: StatusEnum;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsNotEmpty()
  name_en: string;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  name_ar: string;

  @IsString()
  @IsNotEmpty()
  title_ar: string;

  @IsString()
  @IsNotEmpty()
  coverImageUrl: string;
}
