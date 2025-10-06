import { Module } from '@nestjs/common';
import { ShopifyOAuthController } from './shopify-o-auth.controller';
import { ShopifyOAuthService } from './shopify-o-auth.service';

@Module({
  controllers: [ShopifyOAuthController],
  providers: [ShopifyOAuthService]
})
export class ShopifyOAuthModule {}
