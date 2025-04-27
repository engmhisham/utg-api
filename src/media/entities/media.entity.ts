// src/media/entities/media.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  filename: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  originalname: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  mimetype: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  path: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alt_en: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title_en: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alt_ar: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title_ar: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  caption_en: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  caption_ar: string | null;

  @Column({ type: 'text', nullable: true })
  description_en: string | null;

  @Column({ type: 'text', nullable: true })
  description_ar: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  credits: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Tracks moduleType, moduleId, and field for each usage',
  })
  usage: { moduleType: string; moduleId: string; field: string }[] | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  focalPoint: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  license: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
