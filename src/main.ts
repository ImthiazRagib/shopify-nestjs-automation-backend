import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

    // 👇 Set EJS as the view engine
  app.setViewEngine('ejs');

  // 👇 Set the views directory
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  // 👇 Set global prefix
  app.setGlobalPrefix('api');

  // ✅ Use global response wrapper
  // app.useGlobalInterceptors(new ResponseInterceptor());


  // ✅ Global error filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // ✅ Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error if extra properties sent
      transform: true, // transforms payloads to DTO classes
    }),
  );

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();
