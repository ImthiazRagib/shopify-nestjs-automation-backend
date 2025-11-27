import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopifyOrderDocument = ShopifyOrder & Document;

@Schema({ timestamps: true, collection: 'shopify_orders' })
export class ShopifyOrder {

    // Store complete raw payload
    @Prop({ type: Object })
    payload: Record<string, any>;

    @Prop({ type: Object })
    webhookInfo: Record<string, any>;

    @Prop({ type: Object })
    quick_drop_x_webhook?: Record<string, any>;

    @Prop({ type: Object })
    quick_drop_x_webhook_response?: Record<string, any>;

    @Prop({ default: false })
    cronjob_executed?: boolean;

    @Prop({ type: Date })
    executedAt?: Date;
}

export const ShopifyOrderSchema = SchemaFactory.createForClass(ShopifyOrder);

ShopifyOrderSchema.index({ email: 1, shopId: 1 }); // Compound Index
ShopifyOrderSchema.index({ name: 'text', myshopifyDomain: 'text' }); // Text Search