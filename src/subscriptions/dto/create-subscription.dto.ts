// src/subscriptions/dto/create-subscription.dto.ts
import { IsEmail } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;
}
