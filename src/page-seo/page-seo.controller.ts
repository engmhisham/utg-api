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
  import { PageSeoService } from './page-seo.service';
  import { CreatePageSeoDto } from './dto/create-page-seo.dto';
  import { UpdatePageSeoDto } from './dto/update-page-seo.dto';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('page-seo')
  export class PageSeoController {
    constructor(private readonly pageSeoService: PageSeoService) {}
  
    @Get()
    findAll(
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'pageUrl',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    ) {
      return this.pageSeoService.findAll(language, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.pageSeoService.findOne(id);
    }
  
    @Get('by-url/:url')
    findByUrl(
      @Param('url') url: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.pageSeoService.findByUrl(url, language);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createPageSeoDto: CreatePageSeoDto,
      @CurrentUser() user,
    ) {
      return this.pageSeoService.create(createPageSeoDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updatePageSeoDto: UpdatePageSeoDto,
      @CurrentUser() user,
    ) {
      return this.pageSeoService.update(id, updatePageSeoDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.pageSeoService.remove(id, user.id, user.username);
    }
  }