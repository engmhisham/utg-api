// src/testimonials/dto/bulk-action.dto.ts
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsIn(['publish', 'draft', 'delete'])
  @IsNotEmpty()
  action: 'publish' | 'draft' | 'delete';
}