// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  findAll(type?: CategoryType) {
    if (type) {
      return this.categoryRepo.find({ where: { type } });
    }
    return this.categoryRepo.find();
  }

  findOne(id: string) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.findOne(id);
    if (!cat) throw new NotFoundException('Category not found');
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    if (!cat) throw new NotFoundException('Category not found');
    return this.categoryRepo.remove(cat);
  }
}
