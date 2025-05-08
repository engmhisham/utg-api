// src/subscriptions/subscriptions.controller.ts
import {
    Controller, Get, Post, Delete, Param, Body, Res, UseGuards
  } from '@nestjs/common';
  import { SubscriptionsService } from './subscriptions.service';
  import { CreateSubscriptionDto } from './dto/create-subscription.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { Response } from 'express';
  
  @Controller('subscriptions')
  export class SubscriptionsController {
    constructor(private readonly service: SubscriptionsService) {}
  
    @Post()
    create(@Body() dto: CreateSubscriptionDto) {
      return this.service.create(dto);
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    findAll() {
      return this.service.findAll();
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.service.remove(id);
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('/export/excel')
    async exportExcel(@Res() res: Response) {
      const buffer = await this.service.exportExcel();
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="subscriptions.xlsx"',
      });
      res.send(buffer);
    }
  }
  