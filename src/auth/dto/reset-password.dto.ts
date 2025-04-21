// src/auth/dto/reset-password.dto.ts
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak - must contain uppercase, lowercase, and numbers or symbols',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  confirmPassword: string;
}