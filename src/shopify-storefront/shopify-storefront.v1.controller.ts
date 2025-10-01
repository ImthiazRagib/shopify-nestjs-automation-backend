import { Controller, Get, Query } from '@nestjs/common';
import { ShopifyStorefrontService } from './shopify-storefront.service';

@Controller('v1/shopify/storefront')
export class ShopifyStorefrontController {
  constructor(private readonly storefrontService: ShopifyStorefrontService) {}

  @Get('products')
  async getProducts(@Query('limit') limit: number) {
    return this.storefrontService.getProducts(limit || 5);
  }

  @Get('product')
  async getProduct(@Query('handle') handle: string) {
    return this.storefrontService.getProductByHandle(handle);
  }
}