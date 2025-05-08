// src/subscriptions/subscriptions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'buffer';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly repo: Repository<Subscription>,
  ) {}

  async create(dto: CreateSubscriptionDto) {
    const exists = await this.repo.findOneBy({ email: dto.email });
    if (exists) return exists;
    return await this.repo.save(this.repo.create(dto));
  }

  async findAll() {
    return await this.repo.find({ order: { subscribed_at: 'DESC' } });
  }

  async remove(id: string) {
    const sub = await this.repo.findOneBy({ id });
    if (!sub) throw new NotFoundException('Subscription not found');
    await this.repo.remove(sub);
    return { id };
  }

  async exportExcel(): Promise<any> {
    const subs = await this.repo.find({ order: { subscribed_at: 'DESC' } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Subscriptions');

    sheet.columns = [
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Subscribed At', key: 'subscribed_at', width: 30 },
    ];

    sheet.addRows(subs.map(sub => ({
      email: sub.email,
      subscribed_at: sub.subscribed_at.toISOString(),
    })));

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
