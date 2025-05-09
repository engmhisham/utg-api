// src/faqs/dto/update-faq.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFaqDto } from './create-faq.dto';

export class UpdateFaqDto extends PartialType(CreateFaqDto) {}