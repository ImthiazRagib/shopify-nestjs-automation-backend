import { Body, Controller, Get, Post } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyProductDto } from './dto/shopify.products.dto';

@Controller('v1/shopify')
export class ShopifyControllerV1 {
    constructor(
        private readonly shopifyService: ShopifyService,
    ) { }

    @Post('products/create')
    createProduct(@Body() payload: ShopifyProductDto) {
        return this.shopifyService.createProduct(payload);
    }

    @Get('products')
    getProducts() {
        return this.shopifyService.getProducts();
    }

    @Get('orders')
    getOrders() {
        return this.shopifyService.getOrders();
    }

    @Get('stores')
    getStores() {
        return this.shopifyService.getAllStores();
    }
}
