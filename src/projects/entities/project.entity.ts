import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatusEnum } from '../../common/enums/status.enum';

@Entity('projects')
export class Project {
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
  title_en: string;

  @Column({ type: 'text' })
  description_en: string;

  @Column({ nullable: true })
  url_en: string;

  @Column()
  title_ar: string;

  @Column({ type: 'text' })
  description_ar: string;

  @Column({ nullable: true })
  url_ar: string;

  @Column()
  image1Url: string;

  @Column({ nullable: true })
  image2Url: string;

  @Column({ nullable: true })
  image3Url: string;

  @Column({ nullable: true })
  image4Url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}