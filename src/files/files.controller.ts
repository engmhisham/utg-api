import { 
    Controller, 
    Post, 
    UseInterceptors, 
    UploadedFile, 
    UseGuards, 
    Get, 
    Delete, 
    Param, 
    Query,
    ParseIntPipe,
    DefaultValuePipe
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../users/entities/user.entity';
  import { FilesService } from './files.service';
  import { Express } from 'express';
  
  @Controller('files')
  @UseGuards(JwtAuthGuard)
  export class FilesController {
    constructor(private readonly filesService: FilesService) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
      return this.filesService.saveFile(file);
    }
  
    @Get()
    findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
      @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
      @Query('sortBy') sortBy: string,
      @Query('sortOrder') sortOrder: 'ASC' | 'DESC',
    ) {
      return this.filesService.findAll({ page, limit, sortBy, sortOrder });
    }
  
    @Get(':filename')
    findOne(@Param('filename') filename: string) {
      return this.filesService.findOne(filename);
    }
  
    @Delete(':filename')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('filename') filename: string) {
      return this.filesService.remove(filename);
    }
  }