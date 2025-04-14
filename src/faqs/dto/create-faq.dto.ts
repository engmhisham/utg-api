// src/faqs/dto/create-faq.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { StatusEnum } from '../../common/enums/status.enum';
import { FaqCategory } from '../../common/enums/faq-category.enum';

export class CreateFaqDto {
  @IsEnum(FaqCategory)
  @IsNotEmpty()
  category: FaqCategory;

  @IsEnum(StatusEnum)
  @IsOptional()
  status?: StatusEnum;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsNotEmpty()
  question_en: string;

  @IsString()
  @IsNotEmpty()
  answer_en: string;

  @IsString()
  @IsNotEmpty()
  question_ar: string;

  @IsString()
  @IsNotEmpty()
  answer_ar: string;
}
