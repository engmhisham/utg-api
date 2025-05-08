// src/locations/locations.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
  DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateLocationStatusDto } from './dto/update-location-status.dto';
import { ReorderLocationsDto } from './dto/reorder-locations.dto';
import { BulkActionDto } from './dto/bulk-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LanguageEnum } from 'src/common/enums/language.enum';
import { LocationStatus } from 'src/common/enums/locations.enum';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: string = 'displayOrder',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    @Query('language') language: LanguageEnum = LanguageEnum.EN,
    @Query('status') status?: LocationStatus,
  ) {
    return this.service.findAll(language, status, { page, limit, sortBy, sortOrder });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateLocationDto, @CurrentUser() user) {
    return this.service.create(dto, user.id, user.username);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto, @CurrentUser() user) {
    return this.service.update(id, dto, user.id, user.username);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateLocationStatusDto, @CurrentUser() user) {
    return this.service.updateStatus(id, dto, user.id, user.username);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.service.remove(id, user.id, user.username);
  }

  @Patch('reorder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
  reorder(@Body() dto: ReorderLocationsDto, @CurrentUser() user) {
    return this.service.reorder(dto, user.id, user.username);
  }

  @Post('bulk-action')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  bulkAction(@Body() dto: BulkActionDto, @CurrentUser() user) {
    return this.service.bulkAction(dto, user.id, user.username);
  }
}
