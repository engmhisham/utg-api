// src/testimonials/dto/update-testimonial-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TestimonialStatus } from '../../common/enums/testimonial-status.enum';

export class UpdateTestimonialStatusDto {
  @IsEnum(TestimonialStatus)
  @IsNotEmpty()
  status: TestimonialStatus;
}