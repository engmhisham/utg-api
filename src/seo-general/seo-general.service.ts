import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoGeneralSetting } from './entities/seo-general.entity';
import { UpdateSeoGeneralDto } from './dto/update-seo-general.dto';
import { LanguageEnum } from '../common/enums/language.enum';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class SeoGeneralService {
  constructor(
    @InjectRepository(SeoGeneralSetting)
    private seoGeneralRepository: Repository<SeoGeneralSetting>,
    private auditLogsService: AuditLogsService,
  ) {}

  async findByLanguage(language: LanguageEnum = LanguageEnum.EN): Promise<SeoGeneralSetting> {
    let settings = await this.seoGeneralRepository.findOne({
      where: { language },
    });
    
    // If no settings exist for this language, create a default one
    if (!settings) {
      settings = this.seoGeneralRepository.create({ language });
      await this.seoGeneralRepository.save(settings);
    }
    
    return settings;
  }

  async update(
    updateSeoGeneralDto: UpdateSeoGeneralDto, 
    language: LanguageEnum = LanguageEnum.EN,
    userId: string,
    username: string,
  ): Promise<SeoGeneralSetting> {
    let settings = await this.seoGeneralRepository.findOne({
      where: { language },
    });
    
    const oldValues = { ...settings };
    
    // If no settings exist for this language, create a new one
    if (!settings) {
      settings = this.seoGeneralRepository.create({ 
        ...updateSeoGeneralDto,
        language,
      });
    } else {
      // Otherwise update the existing one
      Object.assign(settings, updateSeoGeneralDto);
    }
    
    const updatedSettings = await this.seoGeneralRepository.save(settings);
    
    // Log the action
    await this.auditLogsService.create({
      userId,
      username,
      action: ActionType.UPDATE,
      entity: 'seo-general',
      entityId: updatedSettings.id,
      oldValues,
      newValues: updateSeoGeneralDto,
    });
    
    return updatedSettings;
  }
}