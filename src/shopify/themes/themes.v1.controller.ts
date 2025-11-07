import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ShopifyStore } from 'src/decorators/shopify-store.decorator';
import { ShopifyAccessGuard } from 'src/guards/shopify-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';

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

    // @Post('update/section/:themeId')
    // updateSection(@ShopifyStore() shopifyStore: any, @Param('themeId') themeId: string, @Body() payload: any) {
    //     const accessToken = shopifyStore.accessToken;
    //     const shopId = shopifyStore.shopId;
    //     return this.themesService.updateThemeSettings({
    //         shopId: shopId,
    //         accessToken,
    //         themeId: themeId,
    //         sectionKey: payload.sectionKey,
    //         field: payload.field,
    //         newValue: payload.newValue,
    //     });
    // }

    @Post('update-theme')
    updateThemeLocally(@Body() body: any) {
        return this.themesService.updateThemeLocally({
            themeFilePath: body.filePath,
            // jsonFilePath: =``
            sectionKey: body.sectionKey,
            field: body.field,
            newValue: body.newValue
        })
    }

    @Post('update-image')
    @UseInterceptors(FileInterceptor('file'))
    uploadAndUpdateimages(@ShopifyStore() shopifyStore: any, @UploadedFile() file: Express.Multer.File, @Body() body: any) {
        console.log("🚀 ~ ThemesV1Controller ~ uploadAndUpdateimages ~ file:", file)
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.uploadAndUpdateimages({
            shopId: shopId,
            accessToken,
            file,
            themeFilePath: body.filePath,
            jsonFilePath: body.jsonFilePath,
            sectionKey: body.sectionKey,
            field: body.field,
        });
    }

    @Post('submit-theme')
    uploadFinalTheme(@ShopifyStore() shopifyStore: any, @Body() body: any) {
        return this.themesService.finalizeThemeAndUpload({
            shopifyStore: shopifyStore,
            extractPath: body.extractPath,
            themeName: body.themeName,
            themeRole: body.themeRole,
        })
    }


    @Post('upload-file')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @ShopifyStore() shopifyStore: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;

        return this.themesService.uploadToShopifyFiles({
            shopId,
            accessToken,
            file,
        });
    }

    // @Post('upload/asset/:themeId')
    // @UseInterceptors(FileInterceptor('file'))
    // async uploadAsset(
    //     @ShopifyStore() shopifyStore: any,
    //     @UploadedFile() file: Express.Multer.File,
    //     @Param('themeId') themeId: string,
    // ) {
    //     const accessToken = shopifyStore.accessToken;
    //     const shopId = shopifyStore.shopId;

    //     return this.themesService.uploadThemeAsset({
    //         shopId,
    //         accessToken,
    //         themeId,
    //         file,
    //     });
    // }

    // @Get('files')
    // async getShopifyFiles(
    //     @ShopifyStore() shopifyStore: any,
    // ) {
    //     const accessToken = shopifyStore.accessToken;
    //     const shopId = shopifyStore.shopId;

    //     return this.themesService.getShopifyFiles(shopId, accessToken);
    // }

    @Get()
    listOfThemes(@ShopifyStore() shopifyStore: any) {
        const accessToken = shopifyStore.accessToken;
        const shopId = shopifyStore.shopId;
        return this.themesService.listOfThemes(shopId, accessToken);
    }
}
