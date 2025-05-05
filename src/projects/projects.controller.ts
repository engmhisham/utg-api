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
  import { ProjectsService } from './projects.service';
  import { CreateProjectDto } from './dto/create-project.dto';
  import { UpdateProjectDto } from './dto/update-project.dto';
  import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
  import { ReorderProjectsDto } from './dto/reorder-projects.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { StatusEnum } from '../common/enums/status.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('projects')
  @UseGuards(JwtAuthGuard)
  export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}
  
    @Get()
    findAll(
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('status') status?: StatusEnum,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
    ) {
      return this.projectsService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.projectsService.findOne(id, language);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createProjectDto: CreateProjectDto,
      @CurrentUser() user,
    ) {
      return this.projectsService.create(createProjectDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updateProjectDto: UpdateProjectDto,
      @CurrentUser() user,
    ) {
      return this.projectsService.update(id, updateProjectDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateProjectStatusDto,
      @CurrentUser() user,
    ) {
      return this.projectsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.projectsService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderProjectsDto,
      @CurrentUser() user,
    ) {
      return this.projectsService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.projectsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }