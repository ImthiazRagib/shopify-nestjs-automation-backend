import { Module } from '@nestjs/common';
import { ShopifyCronJobController } from './shopify-cron-job.controller';
import { ShopifyCronJobService } from './shopify-cron-job.service';
import { ShopifyWebhookModule } from 'src/shopify-webhook/shopify-webhook.module';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyOrder, ShopifyOrderSchema } from 'src/shopify-webhook/models/order.webhook.model';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: ShopifyOrder.name,
      schema: ShopifyOrderSchema
    }]),
    ShopifyWebhookModule,
    HttpModule
  ],
  controllers: [ShopifyCronJobController],
  providers: [ShopifyCronJobService]
})
export class ShopifyCronJobModule { }
