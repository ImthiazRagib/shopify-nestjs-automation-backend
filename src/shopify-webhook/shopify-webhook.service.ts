// shopify-webhook.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { CUSTOMER_WEBHOOKS, ORDER_WEBHOOKS } from './enums/webhooks.enum';

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
        console.log("🚀 ~ ShopifyWebhookService ~ processWebhook ~ ctx:", ctx)

        switch (topic) {
            case ORDER_WEBHOOKS.ORDER_CREATED:
                await this.handleOrderCreated(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_PAID:
                await this.handleOrderPaid(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_FULFILLED:
                await this.handleOrderFulfilled(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_PARTIALLY_FULFILLED:
                await this.handleOrderPartialyFulfilled(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_CANCELLED:
                await this.handleOrderCanceled(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_UPDATED:
                await this.handleOrderUpdated(shopDomain, payload);
                break;

            case ORDER_WEBHOOKS.REFUND_CREATED:
                await this.handleRefundCreated(shopDomain, payload);
                break;

            // * Customer Methos
            case CUSTOMER_WEBHOOKS.CUSTOMER_CREATED:
                await this.handleCustomerCreated(shopDomain, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_UPDATED:
                await this.handleCustomerUpdated(shopDomain, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_DELETED:
                await this.handleCustomerDeleted(shopDomain, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_REDACT:
                await this.handleCustomerRedact(shopDomain, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_DATA_REQUEST:
                await this.handleCustomerDataRequest(shopDomain, payload);
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

    private async handleOrderPartialyFulfilled(shopDomain: string, order: any) {
        console.log('Order fulfilled:', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleOrderCanceled(shopDomain: string, order: any) {
        console.log('handleOrderCanceled', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleOrderUpdated(shopDomain: string, order: any) {
        console.log('handleOrderUpdated', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleRefundCreated(shopDomain: string, order: any) {
        console.log('handleRefundCreated', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleOrderFulfilled(shopDomain: string, order: any) {
        console.log('handleOrderFulfilled', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerCreated(shopDomain: string, order: any) {
        console.log('handleCustomerCreated', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerUpdated(shopDomain: string, order: any) {
        console.log('handleCustomerUpdated', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerDeleted(shopDomain: string, order: any) {
        console.log('handleCustomerDeleted', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerRedact(shopDomain: string, order: any) {
        console.log('handleCustomerRedact', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerDataRequest(shopDomain: string, order: any) {
        console.log('handleCustomerDataRequest', shopDomain, order);
        // Update fulfillment status, notify logistics, etc.
    }
}
