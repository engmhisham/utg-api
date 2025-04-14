import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findByLanguage(@Query('language') language: LanguageEnum = LanguageEnum.EN) {
    return this.settingsService.findByLanguage(language);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Query('language') language: LanguageEnum = LanguageEnum.EN,
    @CurrentUser() user,
  ) {
    return this.settingsService.update(
      updateSettingsDto, 
      language,
      user.id,
      user.username,
    );
  }
}