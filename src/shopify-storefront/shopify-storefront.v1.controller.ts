import { Body, Controller, Get, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ShopifyStorefrontService } from './shopify-storefront.service';
import { SearchProductsDto } from './dto/storefront.dto';

@Controller('v1/shopify/storefront')
export class ShopifyStorefrontController {
  constructor(private readonly storefrontService: ShopifyStorefrontService) { }

  @Get('products')
  async getProducts(@Query('limit', ParseIntPipe) limit: number) {
    return this.storefrontService.getProducts(limit);
  }

  @Get('product')
  async getProduct(@Query('handle') handle: string) {
    return this.storefrontService.getProductByHandle(handle);
  }

  @Get('shop')
  async getShop() {
    return this.storefrontService.getShopInfo();
  }

  @Post('search')
  async searchProducts(@Query() payload: SearchProductsDto) {
    return this.storefrontService.searchProducts(payload.query, payload.first, payload.after, payload.before);
  }
}