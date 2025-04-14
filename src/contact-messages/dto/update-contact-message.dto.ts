// src/contact-messages/dto/update-contact-message.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto extends PartialType(CreateContactMessageDto) {}

// src/contact-messages/dto/update-read-status.dto.ts
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateReadStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  read: boolean;
}