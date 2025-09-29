import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller('v1/shopify')
export class ShopifyControllerV1 {
    constructor(
        private readonly shopifyService: ShopifyService
    ) { }

    @Get('products')
    getProducts() {
        throw new HttpException('This is an error', HttpStatus.BAD_GATEWAY)
        return this.shopifyService.getOrders();
    }

    @Get('orders')
    getOrders() {
        return this.shopifyService.getOrders();
    }
}
