import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Content Service API')
    .setDescription('Knowledge Hub - Content Management Service')
    .setVersion('1.0')
    .addTag('content', 'Content CRUD operations')
    .addTag('draft', 'Draft management')
    .addTag('version', 'Content versioning')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
  SwaggerModule.setup(swaggerPath, app, document);

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Content Service running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();
