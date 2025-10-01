import { Module } from '@nestjs/common';
import { ShopifyPartnerController } from './shopify-partner.v1.controller';
import { ShopifyPartnerService } from './shopify-partner.service';

@Module({
  controllers: [ShopifyPartnerController],
  providers: [ShopifyPartnerService]
})
export class ShopifyPartnerModule {}
