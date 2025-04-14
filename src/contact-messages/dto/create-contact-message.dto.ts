// src/contact-messages/dto/create-contact-message.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LanguageEnum } from '../../common/enums/language.enum';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(LanguageEnum)
  @IsOptional()
  language?: LanguageEnum = LanguageEnum.EN;
}