import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { SeoGeneralService } from './seo-general.service';
import { UpdateSeoGeneralDto } from './dto/update-seo-general.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('seo-general')
export class SeoGeneralController {
  constructor(private readonly seoGeneralService: SeoGeneralService) {}

  @Get()
  findByLanguage(@Query('language') language: LanguageEnum = LanguageEnum.EN) {
    return this.seoGeneralService.findByLanguage(language);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Body() updateSeoGeneralDto: UpdateSeoGeneralDto,
    @Query('language') language: LanguageEnum = LanguageEnum.EN,
    @CurrentUser() user,
  ) {
    return this.seoGeneralService.update(
      updateSeoGeneralDto, 
      language,
      user.id,
      user.username,
    );
  }
}