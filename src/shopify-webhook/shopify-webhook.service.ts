// shopify-webhook.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

interface ShopifyWebhookContext {
    topic: string;
    shopDomain: string;
    payload: any;
}

@Injectable()
export class ShopifyWebhookService {
    constructor() { }

    async processWebhook(ctx: ShopifyWebhookContext): Promise<void> {
        const { topic, shopDomain, payload } = ctx;

        switch (topic) {
            case 'orders/create':
                await this.handleOrderCreated(shopDomain, payload);
                break;

            case 'orders/paid':
                await this.handleOrderPaid(shopDomain, payload);
                break;

            case 'orders/fulfilled':
                await this.handleOrderFulfilled(shopDomain, payload);
                break;

            default:
                // Ignore other topics or log them
                console.log(`Unhandled Shopify topic: ${topic}`);
        }
    }

    private async handleOrderCreated(shopDomain: string, order: any) {
        console.log('New order from Shopify:', shopDomain, order.id);

        // Example: save to DB, dispatch job, etc.
        // const total = order.total_price;
        // const currency = order.currency;
        // const email = order.email;
        // const lineItems = order.line_items;
        // await this.ordersRepository.createFromShopify(order);
    }

    private async handleOrderPaid(shopDomain: string, order: any) {
        console.log('Order paid:', shopDomain, order);
        // Update payment status in your system
    }

    private async handleOrderFulfilled(shopDomain: string, order: any) {
        console.log('Order fulfilled:', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }
}
