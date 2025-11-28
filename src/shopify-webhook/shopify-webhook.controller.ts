// shopify-webhook.controller.ts
import {
    Controller,
    Post,
    Req,
    Headers,
    HttpCode,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ShopifyWebhookService } from './shopify-webhook.service';

@Controller('webhooks/shopify')
export class ShopifyWebhookController {
    constructor(
        private readonly shopifyWebhookService: ShopifyWebhookService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK) // Shopify expects 200 if accepted
    async handleWebhook(
        @Req() req: any,
        @Headers('x-shopify-hmac-sha256') hmac: string,
        @Headers('x-shopify-topic') topic: string,
        @Headers('x-shopify-shop-domain') shopDomain: string,
    ) {

        try {
            const secret = process.env.CLIENT_SECRET;
            if (!secret) {
                console.error('CLIENT_SECRET is not set');
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Raw body from bodyParser
            // const rawBody = req.rawBody;

            // const generatedHash = crypto
            //     .createHmac('sha256', secret)
            //     .update(rawBody)            // NOT JSON.stringify(...)
            //     .digest('base64');

            // console.log("Generated:", generatedHash);
            // console.log("Shopify Sent:", hmac);
            // console.log("Shopify bool:", hmac === generatedHash);
            // const isValid = crypto.timingSafeEqual(
            //     Buffer.from(generatedHash, 'utf8'),
            //     Buffer.from(hmac, 'utf8'),
            // );

            // if (!isValid) {
            //     throw new UnauthorizedException('Invalid HMAC');
            // }

            await this.shopifyWebhookService.processWebhook({
                webhookInfo: {
                    topic,
                    shopDomain,
                    hmac
                },
                payload: req.body,
            });
        } catch (e) {
            console.error('Error processing Shopify webhook:', e);
            // Shopify will retry on non-2xx, so you can decide what to return
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Must return 200 quickly, within 5 seconds
        return { status: 'ok' };
    }


}
