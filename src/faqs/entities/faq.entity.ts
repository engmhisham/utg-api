import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatusEnum } from '../../common/enums/status.enum';
import { FaqCategory } from '../../common/enums/faq-category.enum';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FaqCategory,
    default: FaqCategory.GENERAL,
  })
  category: FaqCategory;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE,
  })
  status: StatusEnum;

  @Column({ default: 0 })
  displayOrder: number;

  @Column()
  question_en: string;

  @Column({ type: 'text' })
  answer_en: string;

  @Column()
  question_ar: string;

  @Column({ type: 'text' })
  answer_ar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}