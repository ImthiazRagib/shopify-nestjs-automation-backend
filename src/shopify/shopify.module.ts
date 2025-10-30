import { Module } from '@nestjs/common';
import { ShopifyControllerV1 } from './shopify.v1.controller';
import { ShopifyService } from './shopify.service';
import { HttpModule } from '@nestjs/axios';
import { ShopModule } from './shop/shop.module'
import { ThemesModule } from './themes/themes.module';
@Module({
  imports: [HttpModule, ShopModule, ThemesModule],
  controllers: [ShopifyControllerV1],
  providers: [ShopifyService]
})
export class ShopifyModule { }
