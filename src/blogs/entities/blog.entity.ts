import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BlogStatus {
  PUBLISHED = 'published',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Column()
  @Index({ unique: true })
  slug: string;

  // English content
  @Column()
  title_en: string;

  @Column({ type: 'text' })
  description_en: string;

  @Column({ type: 'text' })
  content_en: string;

  // Arabic content
  @Column()
  title_ar: string;

  @Column({ type: 'text' })
  description_ar: string;

  @Column({ type: 'text' })
  content_ar: string;

  @Column()
  coverImageUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}