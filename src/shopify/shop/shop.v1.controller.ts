import { Controller, Query, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Post, Body, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { GetOrdersDto, QueryShopProductDto } from './dto/shop.v1.dto';
import { ShopifyAccessGuard } from 'src/guards/shopify-access.guard';

@UseGuards(ShopifyAccessGuard)
@Controller('v1/shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) { }

    @Get('access-scopes')
    getShopifyAccessScopes(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.getShopifyAccessScopes({
            shopId: shopId,
            accessToken,
            endpoint: 'access_scopes',
        });
    }

    @Post('products/create')
    createProduct(@Req() req: any, @Body() payload: any) {
        // return {...payload, accessToken: req.accessToken}
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.createProduct({
            shopId: shopId,
            accessToken,
            data: payload,
        });
    }

    @Get('products')
    getProducts(@Req() req: any, @Query() query: QueryShopProductDto) {
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.getProducts({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }

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
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.getShopifyOrders({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }

    @Get('info')
    getShopInfo(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.getShopInfo({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }

    @Get('locations')
    getLocations(@Req() req: any, @Query() query: GetOrdersDto) {
        const accessToken = req.shopifyStore.accessToken;
        const shopId = req.shopifyStore.shopId;
        return this.shopService.getAllLocations({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }
}
