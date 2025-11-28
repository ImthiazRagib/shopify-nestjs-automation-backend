import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ShopifyOrder } from 'src/shopify-webhook/models/order.webhook.model';

@Injectable()
export class ShopifyCronJobService {
    private readonly logger = new Logger(ShopifyCronJobService.name)

    constructor(
        @InjectModel(ShopifyOrder.name)
        private readonly shopifyOrderModel: Model<ShopifyOrder>,
        private readonly httpService: HttpService
    ) { }

    async getPendingOrders(): Promise<ShopifyOrder[]> {
        // Example: fetch all unprocessed orders
        return this.shopifyOrderModel.find({ isProcessed: { $ne: true } }).exec();
    }

    async markOrderProcessed(payloadId: Types.ObjectId) {
        return this.shopifyOrderModel.findByIdAndUpdate(payloadId, { isProcessed: true });
    }

    async sendOrderToExternalAPI(payload: ShopifyOrder) {
        console.log("🚀 ~ ShopifyCronJobService ~ sendOrderToExternalAPI ~ order:", payload)
        const marked = await this.markOrderProcessed(payload._id);
        console.log("🚀 ~ ShopifyCronJobService ~ sendOrderToExternalAPI ~ marked:", marked)
        try {
            const url = ``;
            const response = await lastValueFrom(
                this.httpService.post(url, payload),
            );
            await this.markOrderProcessed(payload._id);
            // this.logger.log(`Order ${order.payload.id} sent successfully`);
            return response.data;
        } catch (err) {
            this.logger.error(`Failed to send order ${payload._id}: ${err.message}`);
            // optionally store failed attempts
            return null;
        }
    }
}
