import { Module } from '@nestjs/common';
import { ThemesV1Controller } from './themes.v1.controller';
import { ThemesService } from './themes.service';
import { HttpModule } from '@nestjs/axios';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [ShopModule, HttpModule],
  controllers: [ThemesV1Controller],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
