import { Module } from '@nestjs/common';
import { ShopController } from './shop.v1.controller';
import { ShopService } from './shop.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopifyStore, ShopifyStoreSchema } from './models/shopify-shop.model';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: ShopifyStore.name, schema: ShopifyStoreSchema }])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService]
})
export class ShopModule { }
