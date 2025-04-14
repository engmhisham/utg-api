// src/faqs/dto/reorder-faqs.dto.ts
import { IsArray, ValidateNested, IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  displayOrder: number;
}

export class ReorderFaqsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}