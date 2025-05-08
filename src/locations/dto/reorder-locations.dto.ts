import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsString()
  id: string;

  @IsNumber()
  displayOrder: number;
}

export class ReorderLocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
