// src/contact-messages/dto/bulk-action.dto.ts
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';

export class BulkActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsIn(['mark-read', 'mark-unread', 'delete'])
  @IsNotEmpty()
  action: 'mark-read' | 'mark-unread' | 'delete';
}