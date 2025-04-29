import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  console.log('🚨 process.env.PORT =', process.env.PORT);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',               
      'https://utg-dashboard.vercel.app',   
    ],
    credentials: true,
  });
  
  // Set up global pipes, filters, and interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // Serve static files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Set global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/uploads/(.*)'],
  });

  
  // Start the server
  const port = configService.get<number>('PORT', 5000); // default fallback is good practice
  await app.listen(port, '0.0.0.0');
  console.log(`✅ App is running on http://localhost:${port}/api`);
}

bootstrap();