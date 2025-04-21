import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeoGeneralModule } from './seo-general/seo-general.module';
import { PageSeoModule } from './page-seo/page-seo.module';
import { ClientsModule } from './clients/clients.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { BrandsModule } from './brands/brands.module';
import { ContactMessagesModule } from './contact-messages/contact-messages.module';
import { FaqsModule } from './faqs/faqs.module';
import { FilesModule } from './files/files.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { ProjectsModule } from './projects/projects.module';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST =', configService.get('DB_HOST'));
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: parseInt(configService.get('DB_PORT') || '5432'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNC', false),
        };
      },      
    }),
    UsersModule,
    AuthModule,
    SeoGeneralModule,
    PageSeoModule,
    ClientsModule,
    TeamMembersModule,
    TestimonialsModule,
    BrandsModule,
    ContactMessagesModule,
    FaqsModule,
    FilesModule,
    SettingsModule,
    AuditLogsModule,
    ProjectsModule,
    BlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}