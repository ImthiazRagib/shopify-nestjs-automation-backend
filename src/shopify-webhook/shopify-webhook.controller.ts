// shopify-webhook.controller.ts
import {
    Controller,
    Post,
    Req,
    Res,
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
        @Req() req: Request,
        // @Res() res: Response,
        @Headers('x-shopify-hmac-sha256') hmacHeader: string,
        @Headers('x-shopify-topic') topic: string,
        @Headers('x-shopify-shop-domain') shopDomain: string,
    ) {
        console.log("🚀 ~ ShopifyWebhookController ~ handleWebhook ~ req:", req.body)
        console.log("🚀 ~ ShopifyWebhookController ~ handleWebhook ~ shopDomain:", { shopDomain, topic, hmacHeader })

        try {
            const secret = process.env.CLIENT_SECRET;
            if (!secret) {
                console.error('CLIENT_SECRET is not set');
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const rawBody = (req as any).body; // because of bodyParser.raw
            const digest = crypto
                .createHmac('sha256', secret)
                .update(rawBody, 'utf8')
                .digest('base64');
            console.log("🚀 ~ ShopifyWebhookController ~ handleWebhook ~ digest:", digest)

            // Protect against timing attacks
            const safeCompare =
                hmacHeader &&
                crypto.timingSafeEqual(
                    Buffer.from(digest, 'utf8'),
                    Buffer.from(hmacHeader, 'utf8'),
                );
            console.log("🚀 ~ ShopifyWebhookController ~ handleWebhook ~ safeCompare:", safeCompare)

            // if (!safeCompare) {
            //     console.warn('Invalid Shopify webhook signature');
            //     throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
            // }

            // Parse JSON *after* HMAC verification
            // const payload = JSON.parse(rawBody.toString('utf8'));

            // Optionally filter just order webhooks (orders/create, orders/paid, etc.)

            await this.shopifyWebhookService.processWebhook({
                webhookInfo: {
                    topic,
                    shopDomain,
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
