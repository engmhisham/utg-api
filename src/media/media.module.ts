import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media } from './entities/media.entity';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueName = uuidv4();
            const ext = extname(file.originalname);
            callback(null, `${uniqueName}${ext}`);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return callback(new Error('Only image files are allowed!'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 10 * 1024 * 1024), // Default to 10MB
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}