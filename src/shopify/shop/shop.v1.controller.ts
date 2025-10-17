import { Controller, Query, Req, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { Post, Body, Get, Param, ParseIntPipe, Put, Delete } from '@nestjs/common';
import { CreateOrderCapturePaymentDto, CreateOrderDto, CreateOrderFulfillmentDto, GetOrdersDto, QueryShopProductDto } from './dto/shop.v1.dto';
import { ShopifyAccessGuard } from 'src/guards/shopify-access.guard';
import { ClientIp } from 'src/decorators/client-ip.decorator';
import { ShopifyStore } from 'src/decorators/shopify-store.decorator';

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
    createProduct(@ShopifyStore() shopifyStore: any, @Req() req: any, @Body() payload: any) {
        // return {...payload, accessToken: req.accessToken}
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.createProduct({
            shopId: shopId,
            accessToken,
            data: payload,
        });
    }

    @Get('products')
    getProducts(@ShopifyStore() shopifyStore: any, @Req() req: any, @Query() query: QueryShopProductDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
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

    @Post('orders/create')
    createOrder(@ShopifyStore() shopifyStore: any, @ClientIp() clientIp: string, @Req() req: any, @Body() payload: CreateOrderDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        // const browserIp = req.ip;
        console.log("🚀 ~ ShopController ~ createOrder ~ clientIp:", clientIp)
        return clientIp;
        return this.shopService.createShopifyOrder({
            shopId: shopId,
            accessToken,
            order: payload,
        });
    }

    @Post('orders/capture-payment/:id')
    captureOrder(@ShopifyStore() shopifyStore: any, @Param('id', ParseIntPipe) orderId: number, @Body() payload: CreateOrderCapturePaymentDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.capturePayment({
            shopId: shopId,
            accessToken,
            orderId: orderId,
            amount: payload.amount,
            currency: payload.currency,
            status: payload.status,
            kind: payload.kind,
        });
    }

    @Post('orders/fulfillment/:id')
    fulfillOrder(@ShopifyStore() shopifyStore: any, @Param('id', ParseIntPipe) orderId: number, @Body() payload: CreateOrderFulfillmentDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        const fulfillmentService = shopifyStore.name || payload.fulfillmentService;
        return this.shopService.fulfillOrder({
            shopId: shopId,
            accessToken,
            orderId: orderId,
            locationId: payload.locationId,
            trackingNumber: payload.trackingNumber,
            trackingCompany: payload.trackingCompany,
            notifyCustomer: payload.notifyCustomer,
            lineItems: payload.lineItems,
            fulfillmentService,
        });
    }

    @Get('orders')
    getOrders(@ShopifyStore() shopifyStore: any, @Query() query: GetOrdersDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.getShopifyOrders({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }

    @Get('orders/:id')
    getSingleOrder(@ShopifyStore() shopifyStore: any, @Param('id', ParseIntPipe) orderId: number) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.getSingleOrder({
            shopId: shopId,
            accessToken,
            orderId: orderId,
        });
    }

    @Get('orders/:id/fulfillment')
    getSingleOrderFulfillment(@ShopifyStore() shopifyStore: any, @Param('id', ParseIntPipe) orderId: number) {
        return this.shopService.getShopifyOrderFulfillment({
            shopId: shopifyStore.shopId,
            accessToken: shopifyStore.accessToken,
            orderId: orderId,
        });
    }

    @Get('orders/:id/transactions')
    getSingleOrderTransactions(@ShopifyStore() shopifyStore: any, @Param('id', ParseIntPipe) orderId: number) {
        return this.shopService.getShopifyOrderTransactions({
            shopId: shopifyStore.shopId,
            accessToken: shopifyStore.accessToken,
            orderId: orderId,
        });
    }

    @Get('info')
    getShopInfo(@ShopifyStore() shopifyStore: any, @Query() query: GetOrdersDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.getShopInfo({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }

    @Get('locations')
    getLocations(@ShopifyStore() shopifyStore: any, @Query() query: GetOrdersDto) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.shopService.getAllLocations({
            ...query,
            shopId: shopId,
        }, accessToken,);
    }
}
