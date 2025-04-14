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
    ParseBoolPipe,
  } from '@nestjs/common';
  import { ContactMessagesService } from './contact-messages.service';
  import { CreateContactMessageDto } from './dto/create-contact-message.dto';
  import { UpdateReadStatusDto } from './dto/update-read-status.dto';
  import { BulkActionDto } from './dto/bulk-action.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { LanguageEnum } from '../common/enums/language.enum';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  
  @Controller('contact-messages')
  export class ContactMessagesController {
    constructor(private readonly contactMessagesService: ContactMessagesService) {}
  
    @Post()
    create(@Body() createContactMessageDto: CreateContactMessageDto) {
      return this.contactMessagesService.create(createContactMessageDto);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string = 'date',
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
      @Query('language') language?: LanguageEnum,
      @Query('read', new DefaultValuePipe(false), ParseBoolPipe) read?: boolean,
    ) {
      return this.contactMessagesService.findAll(language, read, { page, limit, sortBy, sortOrder });
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
      return this.contactMessagesService.findOne(id);
    }
  
    @Patch(':id/read')
    @UseGuards(JwtAuthGuard)
    updateReadStatus(
      @Param('id') id: string,
      @Body() updateReadStatusDto: UpdateReadStatusDto,
      @CurrentUser() user,
    ) {
      return this.contactMessagesService.updateReadStatus(id, updateReadStatusDto, user.id, user.username);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id') id: string,
      @CurrentUser() user,
    ) {
      return this.contactMessagesService.remove(id, user.id, user.username);
    }
  
    @Post('bulk-action')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkAction(
      @Body() bulkActionDto: BulkActionDto,
      @CurrentUser() user,
    ) {
      return this.contactMessagesService.bulkAction(
        bulkActionDto.ids, 
        bulkActionDto.action, 
        user.id, 
        user.username
      );
    }
  }