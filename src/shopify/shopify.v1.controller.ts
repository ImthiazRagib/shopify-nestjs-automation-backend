import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { AddShopifyProductDto, UpdateShopifyProductDto } from './dto/shopify.products.dto';

@Controller('v1/shopify')
export class ShopifyControllerV1 {
    constructor(
        private readonly shopifyService: ShopifyService,
    ) { }

    @Post('products/create')
    createProduct(@Body() payload: any) {
        return this.shopifyService.createProduct(payload);
    }

    @Get('products')
    getProducts() {
        return this.shopifyService.getProducts();
    }
    
    @Get('products/:id')
    getSingleProduct(@Param('id', ParseIntPipe) productId: number) {
        return this.shopifyService.getSingleProduct(productId);
    }

    @Put('products/:id')
    updateProduct(@Param('id', ParseIntPipe) productId: number, @Body() payload: UpdateShopifyProductDto) {
        return this.shopifyService.updateProduct(productId, payload);
    }


    @Delete('products/:id')
    deleteProduct(@Param('id', ParseIntPipe) productId: number) {
        return this.shopifyService.deleteProduct(productId);
    }

    @Get('custom-collections')
    getCustomCollections() {
        return this.shopifyService.getCustomCollections();
    }

    @Get('smart-collections')
    getSmartCollections() {
        return this.shopifyService.getSmartCollections();
    }

    @Get('product-types')
    getProductTypes() {
        return this.shopifyService.getProductTypes();
    }

    @Get('orders')
    getOrders() {
        return this.shopifyService.getOrders();
    }

    @Get('shops')
    getShops() {
        return this.shopifyService.getShopInfo();
    }


    @Get('locations')
    getLocations() {
        return this.shopifyService.getAllLocations();
    }
}
