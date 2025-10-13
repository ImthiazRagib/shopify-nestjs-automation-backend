import { Module } from '@nestjs/common';
import { ShopifyOAuthController } from './shopify-o-auth.controller';
import { ShopifyOAuthService } from './shopify-o-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyStore } from './models/shopify-shop.model';
import { ShopifyStoreSchema } from './models/shopify-shop.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShopifyStore.name, schema: ShopifyStoreSchema }])],
  controllers: [ShopifyOAuthController],
  providers: [ShopifyOAuthService]
})
export class ShopifyOAuthModule { }
