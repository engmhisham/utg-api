import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TestimonialStatus } from '../../common/enums/testimonial-status.enum';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TestimonialStatus,
    default: TestimonialStatus.DRAFT,
  })
  status: TestimonialStatus;

  @Column({ default: 0 })
  displayOrder: number;

  @Column()
  name_en: string;

  @Column()
  position_en: string;

  @Column()
  company_en: string;

  @Column({ type: 'text' })
  content_en: string;

  @Column()
  name_ar: string;

  @Column()
  position_ar: string;

  @Column()
  company_ar: string;

  @Column({ type: 'text' })
  content_ar: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}