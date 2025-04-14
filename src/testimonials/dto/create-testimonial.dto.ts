// src/testimonials/dto/create-testimonial.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { TestimonialStatus } from '../../common/enums/testimonial-status.enum';

export class CreateTestimonialDto {
  @IsEnum(TestimonialStatus)
  @IsOptional()
  status?: TestimonialStatus;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsString()
  @IsNotEmpty()
  name_en: string;

  @IsString()
  @IsNotEmpty()
  position_en: string;

  @IsString()
  @IsNotEmpty()
  company_en: string;

  @IsString()
  @IsNotEmpty()
  content_en: string;

  @IsString()
  @IsNotEmpty()
  name_ar: string;

  @IsString()
  @IsNotEmpty()
  position_ar: string;

  @IsString()
  @IsNotEmpty()
  company_ar: string;

  @IsString()
  @IsNotEmpty()
  content_ar: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;
}