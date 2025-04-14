import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LanguageEnum } from '../../common/enums/language.enum';

@Entity('seo_general_settings')
export class SeoGeneralSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LanguageEnum,
    default: LanguageEnum.EN,
  })
  language: LanguageEnum;

  @Column({ nullable: true })
  gtmId: string;

  @Column({ nullable: true })
  facebookPixelId: string;

  @Column({ nullable: true })
  googleAnalyticsId: string;

  @Column({ nullable: true })
  facebookUrl: string;

  @Column({ nullable: true })
  twitterUrl: string;

  @Column({ nullable: true })
  instagramUrl: string;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  youtubeUrl: string;

  @Column({ type: 'text', nullable: true })
  customHeadScripts: string;

  @Column({ type: 'text', nullable: true })
  customBodyScripts: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}