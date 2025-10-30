import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ShopifyStore } from 'src/decorators/shopify-store.decorator';
import { ShopifyAccessGuard } from 'src/guards/shopify-access.guard';

@UseGuards(ShopifyAccessGuard)
@Controller('v1/shop/themes')
export class ThemesV1Controller {
    constructor(private readonly themesService: ThemesService) { }


    @Post(':themeId/publish')
    publishTheme(@ShopifyStore() shopifyStore: any, @Param('themeId') themeId: number) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.publishTheme({
            shopId: shopId,
            accessToken,
            themeId: themeId,
        });
    }

    @Post('update/section/:themeId')
    updateSection(@ShopifyStore() shopifyStore: any, @Param('themeId') themeId: string, @Body() payload: any) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.updateThemeSettings({
            shopId: shopId,
            accessToken,
            themeId: themeId,
            sectionKey: payload.sectionKey,
            field: payload.field,
            newValue: payload.newValue,
        });
    }

    @Post('update/header-default/:themeId')
    updateHeaderDefaultSection(@ShopifyStore() shopifyStore: any, @Param('themeId') themeId: string, @Body() body: any) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.updateThemeSettings({
            shopId: shopId,
            accessToken,
            themeId: themeId,
            sectionKey: "header-default",
            field: "settings",
            newValue: {
                "type": "header-default",
                "settings": {
                    "message": true,
                    "message_text": "🔥 Limited Offer: Free Shipping over $299!",
                    "free_shipping_text": "Big Sale: Up to 80% off this weekend by ragib",
                    "logo_text": "JewelX",
                    "logo_pc": "shopify://shop_images/new-logo.png",
                    "enable_header_wishlist": false
                },
            },
        })
    }

    @Post('upload')
    uploadTheme(@ShopifyStore() shopifyStore: any, @Body() payload: any) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.uploadTheme({
            shopId: shopId,
            accessToken,
            ...payload,
        });
    }

    @Get()
    listOfThemes(@ShopifyStore() shopifyStore: any) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.listOfThemes(shopId, accessToken);
    }
}
