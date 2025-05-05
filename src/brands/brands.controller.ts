import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    Query, 
    UseGuards,
    DefaultValuePipe,
    ParseIntPipe,
  } from '@nestjs/common';
  import { BrandsService } from './brands.service';
  import { CreateBrandDto } from './dto/create-brand.dto';
  import { UpdateBrandDto } from './dto/update-brand.dto';
  import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
  import { ReorderBrandsDto } from './dto/reorder-brands.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { StatusEnum } from '../common/enums/status.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('brands')
  @UseGuards(JwtAuthGuard)
  export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('status') status?: StatusEnum,
    ) {
      return this.brandsService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.brandsService.findOne(id, language);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createBrandDto: CreateBrandDto,
      @CurrentUser() user,
    ) {
      return this.brandsService.create(createBrandDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updateBrandDto: UpdateBrandDto,
      @CurrentUser() user,
    ) {
      return this.brandsService.update(id, updateBrandDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateBrandStatusDto,
      @CurrentUser() user,
    ) {
      return this.brandsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.brandsService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderBrandsDto,
      @CurrentUser() user,
    ) {
      return this.brandsService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.brandsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }