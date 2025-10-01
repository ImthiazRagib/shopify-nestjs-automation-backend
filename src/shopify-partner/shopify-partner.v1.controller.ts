import { Controller, Get, Post } from '@nestjs/common';
import { ShopifyPartnerService } from './shopify-partner.service';

@Controller('v1/shopify-partner')
export class ShopifyPartnerController {

    constructor(private readonly shopifyPartnerService: ShopifyPartnerService) { }
    @Post('stores')
    createStore() {
        return this.shopifyPartnerService.createStore({
            name: 'Quick Drop X',
            shopDomain: 'quick-drop-x.myshopify.com',
            userEmail: 'admin@quick-drop-x.myshopify.com',
            shopOwner: 'Quick Drop X',
            password: '123456',
            plan: 'Free',
        });
    }


    @Get('organizations')
    async getOrganizations() {
        return this.shopifyPartnerService.getOrganizations();
    }

    @Get('apps')
    async getApps() {
        return this.shopifyPartnerService.getApps();
    }
}
