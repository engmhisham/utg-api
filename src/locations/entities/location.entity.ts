// src/locations/entities/location.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LocationStatus } from '../../common/enums/locations.enum';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: LocationStatus, default: LocationStatus.DRAFT })
  status: LocationStatus;

  @Column({ default: 0 })
  displayOrder: number;

  @Column()
  title_en: string;

  @Column()
  title_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  city_en: string;

  @Column({ nullable: true })
  city_ar: string;

  @Column({ nullable: true })
  phone_en: string;

  @Column({ nullable: true })
  phone_ar: string;

  @Column({ nullable: true })
  map_url: string;

  @Column({ type: 'text', nullable: true })
  working_hours_en: string;

  @Column({ type: 'text', nullable: true })
  working_hours_ar: string;

  @Column({ type: 'text', nullable: true })
  content_en: string;

  @Column({ type: 'text', nullable: true })
  content_ar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
