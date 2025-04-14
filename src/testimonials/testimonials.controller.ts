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
  import { TestimonialsService } from './testimonials.service';
  import { CreateTestimonialDto } from './dto/create-testimonial.dto';
  import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
  import { UpdateTestimonialStatusDto } from './dto/update-testimonial-status.dto';
  import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { TestimonialStatus } from '../common/enums/testimonial-status.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('testimonials')
  @UseGuards(JwtAuthGuard)
  export class TestimonialsController {
    constructor(private readonly testimonialsService: TestimonialsService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('status') status?: TestimonialStatus,
    ) {
      return this.testimonialsService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.testimonialsService.findOne(id, language);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createTestimonialDto: CreateTestimonialDto,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.create(createTestimonialDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    update(
      @Param('id') id: string,
      @Body() updateTestimonialDto: UpdateTestimonialDto,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.update(id, updateTestimonialDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateTestimonialStatusDto,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderTestimonialsDto,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.testimonialsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }