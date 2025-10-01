import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopifyModule } from './shopify/shopify.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ShopifyPartnerModule } from './shopify-partner/shopify-partner.module';

@Module({
  imports: [    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes it available everywhere
    }),
    ShopifyModule,
    AuthModule,
    ShopifyPartnerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
