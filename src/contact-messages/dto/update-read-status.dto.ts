import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateReadStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  read: boolean;
}