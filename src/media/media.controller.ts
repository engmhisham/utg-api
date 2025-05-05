import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseInterceptors, 
  UploadedFile,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { LanguageEnum } from '../common/enums/language.enum';
import { Express } from 'express';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll(
    @Query('language') language: LanguageEnum = LanguageEnum.EN,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(24), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.mediaService.findAll(
      language,
      { page, limit, sortBy, sortOrder },
      { category, tags: tagArray },
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('language') language: LanguageEnum = LanguageEnum.EN,
  ) {
    return this.mediaService.findOne(id, language);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createMediaDto: CreateMediaDto,
  ) {
    return this.mediaService.create(file, createMediaDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateMediaDto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  @Post(':id/usage')
  addUsage(
    @Param('id') id: string,
    @Body() usageDto: { moduleType: string; moduleId: string; field: string },
  ) {
    return this.mediaService.addUsage(id, usageDto);
  }

  @Delete(':id/usage')
  removeUsage(
    @Param('id') id: string,
    @Body() usageDto: { moduleType: string; moduleId: string; field: string },
  ) {
    return this.mediaService.removeUsage(id, usageDto);
  }

  @Post('remove-by-url')
  removeByUrl(@Body('url') url: string) {
    return this.mediaService.removeByUrl(url);
  }
}