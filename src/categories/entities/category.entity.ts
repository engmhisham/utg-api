// src/categories/entities/category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Blog } from 'src/blogs/entities/blog.entity';
import { Faq } from 'src/faqs/entities/faq.entity';

export enum CategoryType {
  BLOG = 'blog',
  FAQ = 'faq',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: CategoryType })
  type: CategoryType;

  @OneToMany(() => Blog, blog => blog.category)
  blogs: Blog[];

  @OneToMany(() => Faq, faq => faq.category)
  faqs: Faq[];
}
