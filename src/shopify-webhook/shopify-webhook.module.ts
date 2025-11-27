import { Module } from '@nestjs/common';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyOrder, ShopifyOrderSchema } from './models/order.webhook.model';

@Module({
  imports: [MongooseModule.forFeature([{
    name: ShopifyOrder.name,
    schema: ShopifyOrderSchema
  }])],
  providers: [ShopifyWebhookService],
  controllers: [ShopifyWebhookController]
})
export class ShopifyWebhookModule {}
