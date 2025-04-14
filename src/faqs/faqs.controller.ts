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
  import { FaqsService } from './faqs.service';
  import { CreateFaqDto } from './dto/create-faq.dto';
  import { UpdateFaqDto } from './dto/update-faq.dto';
  import { UpdateFaqStatusDto } from './dto/update-faq-status.dto';
  import { ReorderFaqsDto } from './dto/reorder-faqs.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { StatusEnum } from '../common/enums/status.enum';
  import { FaqCategory } from '../common/enums/faq-category.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('faqs')
  @UseGuards(JwtAuthGuard)
  export class FaqsController {
    constructor(private readonly faqsService: FaqsService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('category') category?: FaqCategory,
      @Query('status') status?: StatusEnum,
    ) {
      return this.faqsService.findAll(language, category, status, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.faqsService.findOne(id, language);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createFaqDto: CreateFaqDto,
      @CurrentUser() user,
    ) {
      return this.faqsService.create(createFaqDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    update(
      @Param('id') id: string,
      @Body() updateFaqDto: UpdateFaqDto,
      @CurrentUser() user,
    ) {
      return this.faqsService.update(id, updateFaqDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateFaqStatusDto,
      @CurrentUser() user,
    ) {
      return this.faqsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.faqsService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderFaqsDto,
      @CurrentUser() user,
    ) {
      return this.faqsService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.faqsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }