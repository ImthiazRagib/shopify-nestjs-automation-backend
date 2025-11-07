import { Module } from '@nestjs/common';
import { ThemesV1Controller } from './themes.v1.controller';
import { ThemesService } from './themes.service';
import { HttpModule } from '@nestjs/axios';
import { ShopModule } from '../shop/shop.module';
import { AwsS3Module } from 'src/s3-bucket/s3-bucket.module';

@Module({
  imports: [ShopModule, HttpModule, AwsS3Module], 
  controllers: [ThemesV1Controller],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
