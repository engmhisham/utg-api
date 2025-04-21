// src/auth/dto/verify-reset-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}