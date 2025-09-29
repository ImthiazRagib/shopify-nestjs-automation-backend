import { Controller, Get } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('v1/shopify')
export class ShopifyControllerV1 {
    constructor(
        private readonly shopifyService: ShopifyService,
    ) { }

    @Get('products')
    getProducts() {
        return this.shopifyService.getProducts();
    }

    @Get('orders')
    getOrders() {
        return this.shopifyService.getOrders();
    }
}
