import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopifyModule } from './shopify/shopify.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes it available everywhere
    }),
    ShopifyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
