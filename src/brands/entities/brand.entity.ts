import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatusEnum } from '../../common/enums/status.enum';

@Entity('brands')
export class Brand {
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
  name_en: string;

  @Column({ type: 'text' })
  description_en: string;

  @Column()
  name_ar: string;

  @Column({ type: 'text' })
  description_ar: string;

  @Column()
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}