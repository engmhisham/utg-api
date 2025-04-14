import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { LanguageEnum } from '../../common/enums/language.enum';

@Entity('page_seo')
@Index(['pageUrl', 'language'], { unique: true })
export class PageSeo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pageUrl: string;

  @Column({
    type: 'enum',
    enum: LanguageEnum,
    default: LanguageEnum.EN,
  })
  language: LanguageEnum;

  @Column()
  title: string;

  @Column()
  metaTitle: string;

  @Column({ type: 'text' })
  metaDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}