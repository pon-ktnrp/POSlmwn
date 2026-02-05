import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS

  app.enableCors({
    origin: 'http://localhost:3001', // Allow only the frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // 2. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      transform: true, // Auto-convert types (e.g., "1" in URL becomes number 1)
      forbidNonWhitelisted: true, // Throw error if unknown properties exist
    }),
  );

  // 3. Setup Swagger (API Documentation)
  const config = new DocumentBuilder()
    .setTitle('LMWN POS API')
    .setDescription('The Point-of-Sale backend API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();