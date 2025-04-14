// src/page-seo/dto/update-page-seo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePageSeoDto } from './create-page-seo.dto';

export class UpdatePageSeoDto extends PartialType(CreatePageSeoDto) {}