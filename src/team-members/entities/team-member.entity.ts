import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StatusEnum } from '../../common/enums/status.enum';

@Entity('team_members')
export class TeamMember {
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

  @Column()
  title_en: string;

  @Column()
  name_ar: string;

  @Column()
  title_ar: string;

  @Column()
  coverImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}