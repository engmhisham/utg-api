import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { StatusEnum } from '../../common/enums/status.enum';
import { Category } from 'src/categories/entities/category.entity';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => Category, { eager: true, nullable: true })
  category: Category;
}