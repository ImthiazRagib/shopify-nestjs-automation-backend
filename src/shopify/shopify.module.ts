import { Module } from '@nestjs/common';
import { ShopifyControllerV1 } from './shopify.v1.controller';
import { ShopifyService } from './shopify.service';

@Module({
  controllers: [ShopifyControllerV1],
  providers: [ShopifyService]
})
export class ShopifyModule { }
