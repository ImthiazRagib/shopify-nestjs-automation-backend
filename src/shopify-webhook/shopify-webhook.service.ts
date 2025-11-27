// shopify-webhook.service.ts
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CUSTOMER_WEBHOOKS, ORDER_WEBHOOKS } from './enums/webhooks.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopifyOrder, ShopifyOrderDocument } from './models/order.webhook.model';

interface ShopifyWebhookContext {
    webhookInfo: {
        shopDomain: string
        topic: string
    }
    payload: any;
}

@Injectable()
export class ShopifyWebhookService {
    constructor(
        @InjectModel(ShopifyOrder.name) private readonly orderModel: Model<ShopifyOrderDocument>,
        // @InjectModel('Customer') private readonly customerModel: Model<CustomerDocument>,
    ) { }

    async processWebhook(ctx: ShopifyWebhookContext): Promise<void> {
        const { webhookInfo, payload } = ctx;
        const { topic } = webhookInfo

        switch (topic) {
            case ORDER_WEBHOOKS.ORDER_CREATED:
                await this.handleOrderCreated(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_PAID:
                await this.handleOrderPaid(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_FULFILLED:
                await this.handleOrderFulfilled(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_PARTIALLY_FULFILLED:
                await this.handleOrderPartialyFulfilled(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_CANCELLED:
                await this.handleOrderCanceled(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.ORDER_UPDATED:
                await this.handleOrderUpdated(webhookInfo, payload);
                break;

            case ORDER_WEBHOOKS.REFUND_CREATED:
                await this.handleRefundCreated(webhookInfo, payload);
                break;

            // * Customer Methos
            case CUSTOMER_WEBHOOKS.CUSTOMER_CREATED:
                await this.handleCustomerCreated(webhookInfo, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_UPDATED:
                await this.handleCustomerUpdated(webhookInfo, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_DELETED:
                await this.handleCustomerDeleted(webhookInfo, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_REDACT:
                await this.handleCustomerRedact(webhookInfo, payload);
                break;

            case CUSTOMER_WEBHOOKS.CUSTOMER_DATA_REQUEST:
                await this.handleCustomerDataRequest(webhookInfo, payload);
                break;

            default:
                // Ignore other topics or log them
                console.log(`Unhandled Shopify topic: ${topic}`);
        }
    }

    async findOrderById(query: {
        orderId?: number | string;
        topic?: string
    }): Promise<ShopifyOrderDocument | null> {
        const { orderId, topic } = query;
        const where: any = {}

        if (orderId) {
            where.orderId = orderId
        }

        if (topic) {
            where.topic = topic
        }


        return await this.orderModel.findOne({ ...where }).exec();
    }

    private async handleOrderCreated(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleOrderPaid(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const { id, ...rest } = order;

            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleOrderPartialyFulfilled(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const { id, ...rest } = order;

            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleOrderCanceled(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const { id, ...rest } = order;

            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleOrderUpdated(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const { id, ...rest } = order;

            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleRefundCreated(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleRefundCreated', webhookInfo, order);
        // try {
        //     // Example: save to DB, dispatch job, etc.
        //     const createdOrder = new this.orderModel({
        //         ...order,
        //         webhookInfo,
        //     } as ShopifyOrder);
        //     await createdOrder.save();
        // } catch (error) {
        //     throw new HttpException(
        //         `Failed to save order webhook: ${error.message}`,
        //         HttpStatus.INTERNAL_SERVER_ERROR
        //     );
        // }
    }

    private async handleOrderFulfilled(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        try {
            // const { id, ...rest } = order;

            // const existedOrder = await this.findOrderById({
            //     orderId: id
            // })
            // if (existedOrder?.webhookInfo.topic === webhookInfo.topic) return;

            const createdOrder = new this.orderModel({
                payload: order,
                webhookInfo,
                // quick_drop_x_webhook: {},
                // quick_drop_x_webhook_response: {},
                // cronjob_executed: false,
                // executedAt: 
            } as ShopifyOrder);
            await createdOrder.save();
        } catch (error) {
            throw new HttpException(
                `Failed to save order webhook: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async handleCustomerCreated(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleCustomerCreated', webhookInfo, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerUpdated(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleCustomerUpdated', webhookInfo, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerDeleted(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleCustomerDeleted', webhookInfo, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerRedact(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleCustomerRedact', webhookInfo, order);
        // Update fulfillment status, notify logistics, etc.
    }

    private async handleCustomerDataRequest(webhookInfo: {
        shopDomain: string;
        topic: string;
    }, order: any) {
        console.log('handleCustomerDataRequest', webhookInfo, order);
        // Update fulfillment status, notify logistics, etc.
    }
}
