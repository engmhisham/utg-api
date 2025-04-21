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
  import { BlogsService } from './blogs.service';
  import { CreateBlogDto } from './dto/create-blog.dto';
  import { UpdateBlogDto } from './dto/update-blog.dto';
  import { UpdateBlogStatusDto } from './dto/update-blog-status.dto';
  import { BlogTranslationDto } from './dto/blog-translation.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { BlogStatus } from './entities/blog.entity';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('blogs')
  export class BlogsController {
    constructor(private readonly blogsService: BlogsService) {}
  
    @Get()
    findAll(
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('status') status?: BlogStatus,
      @Query('sortBy') sortBy: string = 'createdAt',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    ) {
      return this.blogsService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.blogsService.findOne(id, language);
    }
  
    @Get('slug/:slug')
    findBySlug(
      @Param('slug') slug: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.blogsService.findBySlug(slug, language);
    }
  
    @Get(':id/translation')
    getTranslation(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.blogsService.getTranslation(id, language);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    create(
      @Body() createBlogDto: CreateBlogDto,
      @CurrentUser() user,
    ) {
      return this.blogsService.create(createBlogDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    update(
      @Param('id') id: string,
      @Body() updateBlogDto: UpdateBlogDto,
      @CurrentUser() user,
    ) {
      return this.blogsService.update(id, updateBlogDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateBlogStatusDto,
      @CurrentUser() user,
    ) {
      return this.blogsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Patch(':id/translation')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    updateTranslation(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum,
      @Body() translationDto: BlogTranslationDto,
      @CurrentUser() user,
    ) {
      return this.blogsService.updateTranslation(id, language, translationDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.blogsService.remove(id, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.blogsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }