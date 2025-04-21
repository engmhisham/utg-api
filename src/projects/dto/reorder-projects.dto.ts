// src/projects/dto/reorder-projects.dto.ts
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

export class ReorderProjectsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}