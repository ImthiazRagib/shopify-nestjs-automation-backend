import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👇 Set global prefix
  app.setGlobalPrefix('api');

  // ✅ Use global response wrapper
  app.useGlobalInterceptors(new ResponseInterceptor());


  // ✅ Global error filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`🚀 Server listening on port ${process.env.PORT ?? 3000}`);
  });
}
bootstrap();
