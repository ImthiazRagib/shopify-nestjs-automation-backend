import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShopifyModule } from './shopify/shopify.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ShopifyPartnerModule } from './shopify-partner/shopify-partner.module';
import { ShopifyStorefrontModule } from './shopify-storefront/shopify-storefront.module';
import { ShopifyOAuthModule } from './shopify-o-auth/shopify-o-auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopModule } from './shopify/shop/shop.module';
import { AwsS3Module } from './s3-bucket/s3-bucket.module';
import { ShopifyWebhookModule } from './shopify-webhook/shopify-webhook.module';
import { ShopifyLogsModule } from './shopify-logs/shopify-logs.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopifyCronJobModule } from './shopify-cron-job/shopify-cron-job.module';

@Module({
  imports: [    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true, // 👈 makes it available everywhere
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot({}),
    ShopifyModule,
    AuthModule,
    ShopifyOAuthModule,
    AwsS3Module,
    ShopifyWebhookModule,
    ShopifyLogsModule,
    ShopifyCronJobModule
    // ShopifyPartnerModule,
    // ShopifyStorefrontModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
