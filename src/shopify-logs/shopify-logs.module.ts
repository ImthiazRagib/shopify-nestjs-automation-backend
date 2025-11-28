import { Module } from '@nestjs/common';
import { ShopifyLogsController } from './shopify-logs.controller';
import { ShopifyLogsService } from './shopify-logs.service';
import { ShopifyLogs, ShopifyLogsSchema } from './models/shopify-logs.model';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ShopifyErrorLoggerFilter } from 'src/interceptors/shopify.error.interceptor';
import { ShopifyLogsResponseInterceptor } from 'src/interceptors/shopify.response.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShopifyLogs.name, schema: ShopifyLogsSchema }]),
  ],
  controllers: [ShopifyLogsController],
  providers: [ShopifyLogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ShopifyLogsResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: ShopifyErrorLoggerFilter
    }
  ]
})
export class ShopifyLogsModule { }
