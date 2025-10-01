import { Module } from '@nestjs/common';
import { ShopifyStorefrontController } from './shopify-storefront.v1.controller';
import { ShopifyStorefrontService } from './shopify-storefront.service';

@Module({
  controllers: [ShopifyStorefrontController],
  providers: [ShopifyStorefrontService]
})
export class ShopifyStorefrontModule {}
