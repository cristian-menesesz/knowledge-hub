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
    .setDescription(
      `Knowledge Hub - Content Management Service
      
## Features
- **Content Management**: Create, read, update, and delete content items
- **Draft System**: Manage drafts with auto-save and preview capabilities
- **Version Control**: Track content history and restore previous versions
- **Advanced Filtering**: Search and filter by status, type, author, and more
- **Rate Limiting**: 200 requests per minute via Kong Gateway

## Architecture
This service uses:
- **PostgreSQL**: For content metadata and structured data
- **MongoDB**: For draft storage and flexible content
- **TypeORM & Mongoose**: For database access
- **Kong Gateway**: For API gateway and rate limiting

## Access Points
- **Direct**: http://localhost:3001/api/v1 (development only)
- **Via Kong**: http://localhost:8000/api/v1 (recommended, includes rate limiting and CORS)`,
    )
    .setVersion('1.0.0')
    .setContact('Knowledge Hub Team', 'https://github.com/knowledge-hub', 'team@knowledge-hub.io')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001/api/v1', 'Direct Service Access (Development)')
    .addServer('http://localhost:8000/api/v1', 'Kong Gateway (Recommended)')
    .addTag('content', 'Content CRUD operations, version control, and publishing')
    .addTag('Drafts', 'Draft management with auto-save and preview')
    .addTag('Health', 'Service health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token (will be implemented in auth-service)',
      },
      'JWT',
    )
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
