import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('IPE Platform API')
    .setDescription('Information Prediction Exchange - Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('wallets', 'Wallet and ledger operations')
    .addTag('markets', 'Market management')
    .addTag('orders', 'Order placement')
    .addTag('trades', 'Trade execution')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║  🎯 IPE Platform API Server Running                   ║
  ║                                                        ║
  ║  📡 API Server:    http://localhost:${port}              ║
  ║  📚 API Docs:      http://localhost:${port}/api/docs     ║
  ║  🗄️  Database:      ${process.env.DATABASE_NAME}                ║
  ║  🌍 Environment:   ${process.env.NODE_ENV}             ║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
