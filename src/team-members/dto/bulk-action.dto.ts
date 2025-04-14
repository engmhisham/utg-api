// src/team-members/dto/bulk-action.dto.ts
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsIn(['activate', 'deactivate', 'delete'])
  @IsNotEmpty()
  action: 'activate' | 'deactivate' | 'delete';
}