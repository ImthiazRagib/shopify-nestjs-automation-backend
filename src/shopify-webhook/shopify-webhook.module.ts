import { Module } from '@nestjs/common';
import { ShopifyWebhookService } from './shopify-webhook.service';
import { ShopifyWebhookController } from './shopify-webhook.controller';

@Module({
  providers: [ShopifyWebhookService],
  controllers: [ShopifyWebhookController]
})
export class ShopifyWebhookModule {}
