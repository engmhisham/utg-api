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
  import { TeamMembersService } from './team-members.service';
  import { CreateTeamMemberDto } from './dto/create-team-member.dto';
  import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
  import { UpdateTeamMemberStatusDto } from './dto/update-team-member-status.dto';
  import { ReorderTeamMembersDto } from './dto/reorder-team-members.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { StatusEnum } from '../common/enums/status.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('team-members')
  @UseGuards(JwtAuthGuard)
  export class TeamMembersController {
    constructor(private readonly teamMembersService: TeamMembersService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('status') status?: StatusEnum,
    ) {
      return this.teamMembersService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findOne(
      @Param('id') id: string,
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
    ) {
      return this.teamMembersService.findOne(id, language);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createTeamMemberDto: CreateTeamMemberDto,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.create(createTeamMemberDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updateTeamMemberDto: UpdateTeamMemberDto,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.update(id, updateTeamMemberDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateTeamMemberStatusDto,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderTeamMembersDto,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.teamMembersService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }