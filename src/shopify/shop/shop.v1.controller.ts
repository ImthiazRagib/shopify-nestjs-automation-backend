import { Controller, Query, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Post, Body, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { GetOrdersDto } from './dto/shop.v1.dto';
import { ShopifyAccessGuard } from 'src/guards/shopify-access.guard';

@UseGuards(ShopifyAccessGuard)
@Controller('v1/shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    // @Get('info')
    // getShopInfo(@Query() query: GetOrdersDto) {
    //     return this.shopService.getShopifyShop(query);
    // }

    @Get('access-scopes')
    getShopifyAccessScopes(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.accessToken;
        return this.shopService.getShopifyAccessScopes({
            shopId: query.shopId,
            accessToken,
            endpoint: 'access_scopes',
        });
    }

    // @Post('products/create')
    // createProduct(@Body() payload: any) {
    //     return this.shopService.createProduct(payload);
    // }

    // @Get('products')
    // getProducts() {
    //     return this.shopService.getProducts();
    // }

    // @Get('products/:id')
    // getSingleProduct(@Param('id', ParseIntPipe) productId: number) {
    //     return this.shopService.getSingleProduct(productId);
    // }

    // @Put('products/:id')
    // updateProduct(@Param('id', ParseIntPipe) productId: number, @Body() payload: UpdateShopifyProductDto) {
    //     return this.shopService.updateProduct(productId, payload);
    // }


    // @Delete('products/:id')
    // deleteProduct(@Param('id', ParseIntPipe) productId: number) {
    //     return this.shopService.deleteProduct(productId);
    // }

    // @Get('custom-collections')
    // getCustomCollections() {
    //     return this.shopService.getCustomCollections();
    // }

    // @Get('smart-collections')
    // getSmartCollections() {
    //     return this.shopService.getSmartCollections();
    // }

    // @Get('product-types')
    // getProductTypes() {
    //     return this.shopService.getProductTypes();
    // }

    @Get('orders')
    getOrders(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.accessToken;
        return this.shopService.getShopifyOrders({
            ...query
        }, accessToken,);
    }

    @Get('info')
    getShopInfo(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.accessToken;
        return this.shopService.getShopInfo({
            ...query
        }, accessToken,);
    }


    // @Get('locations')
    // getLocations() {
    //     return this.shopService.getAllLocations();
    // }
}
