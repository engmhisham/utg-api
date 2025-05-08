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
  import { ClientsService } from './clients.service';
  import { CreateClientDto } from './dto/create-client.dto';
  import { UpdateClientDto } from './dto/update-client.dto';
  import { UpdateClientStatusDto } from './dto/update-client-status.dto';
  import { ReorderClientsDto } from './dto/reorder-clients.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { StatusEnum } from '../common/enums/status.enum';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('clients')
  @UseGuards(JwtAuthGuard)
  export class ClientsController {
    constructor(private readonly clientsService: ClientsService) {}
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'displayOrder',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'ASC',
      @Query('language') language: LanguageEnum = LanguageEnum.EN,
      @Query('status') status?: StatusEnum,
    ) {
      return this.clientsService.findAll(language, status, { page, limit, sortBy, sortOrder });
    }
  
    // @Get(':id')
    // @UseGuards(RolesGuard)
    // @Roles(UserRole.ADMIN)
    // findOne(
    //   @Param('id') id: string,
    //   @Query('language') language: LanguageEnum = LanguageEnum.EN,
    // ) {
    //   return this.clientsService.findOne(id, language);
    // }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    findOne(@Param('id') id: string) {
      return this.clientsService.findOne(id);
    }
  
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    create(
      @Body() createClientDto: CreateClientDto,
      @CurrentUser() user,
    ) {
      return this.clientsService.create(createClientDto, user.id, user.username);
    }
  
    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updateClientDto: UpdateClientDto,
      @CurrentUser() user,
    ) {
      return this.clientsService.update(id, updateClientDto, user.id, user.username);
    }
  
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    updateStatus(
      @Param('id') id: string,
      @Body() updateStatusDto: UpdateClientStatusDto,
      @CurrentUser() user,
    ) {
      return this.clientsService.updateStatus(id, updateStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.clientsService.remove(id, user.id, user.username);
    }
  
    @Patch('reorder')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.CONTENT_SUPPORT)
    reorder(
      @Body() reorderDto: ReorderClientsDto,
      @CurrentUser() user,
    ) {
      return this.clientsService.reorder(reorderDto, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.clientsService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }