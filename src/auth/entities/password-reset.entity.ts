// src/auth/entities/password-reset.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  used: boolean;
}