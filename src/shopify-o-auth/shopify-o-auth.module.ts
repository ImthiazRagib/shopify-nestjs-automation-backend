import { Module } from '@nestjs/common';
import { ShopifyOAuthController } from './shopify-o-auth.controller';
import { ShopifyOAuthService } from './shopify-o-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyStore, ShopifyStoreSchema } from 'src/shopify/shop/models/shopify-shop.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShopifyStore.name, schema: ShopifyStoreSchema }])],
  controllers: [ShopifyOAuthController],
  providers: [ShopifyOAuthService]
})
export class ShopifyOAuthModule { }
