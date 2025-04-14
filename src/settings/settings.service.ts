import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findByLanguage(language: LanguageEnum = LanguageEnum.EN): Promise<Setting> {
    let settings = await this.settingsRepository.findOne({
      where: { language },
    });
    
    // If no settings exist for this language, create a default one
    if (!settings) {
      settings = this.settingsRepository.create({ language });
      await this.settingsRepository.save(settings);
    }
    
    return settings;
  }

  async update(
    updateSettingsDto: UpdateSettingsDto, 
    language: LanguageEnum = LanguageEnum.EN,
    userId: string,
    username: string,
  ): Promise<Setting> {
    let settings = await this.settingsRepository.findOne({
      where: { language },
    });
    
    const oldValues = { ...settings };
    
    // If no settings exist for this language, create a new one
    if (!settings) {
      settings = this.settingsRepository.create({ 
        ...updateSettingsDto,
        language,
      });
    } else {
      // Otherwise update the existing one
      Object.assign(settings, updateSettingsDto);
    }
    
    const updatedSettings = await this.settingsRepository.save(settings);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'settings',
      entityId: updatedSettings.id,
      oldValues,
      newValues: updateSettingsDto,
    });
    
    return updatedSettings;
  }
}