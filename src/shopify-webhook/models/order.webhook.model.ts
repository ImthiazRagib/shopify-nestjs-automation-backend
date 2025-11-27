import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopifyOrderDocument = ShopifyOrder & Document;

@Schema({ timestamps: true, collection: 'shopify_orders' })
export class ShopifyOrder {
    @Prop({})
    order_id: number;

    @Prop({})
    admin_graphql_api_id: string;

    @Prop()
    app_id: number;

    @Prop()
    browser_ip: string;

    @Prop()
    buyer_accepts_marketing: boolean;

    @Prop()
    cancel_reason: string;

    @Prop()
    cancelled_at: string;

    @Prop()
    cart_token: string;

    @Prop()
    checkout_id: number;

    @Prop()
    checkout_token: string;

    @Prop({ type: Object })
    client_details: Record<string, any>;

    @Prop()
    closed_at: string;

    @Prop()
    confirmation_number: string;

    @Prop()
    confirmed: boolean;

    @Prop()
    created_at: string;

    @Prop({})
    currency: string;

    // ---- Current / Price sets ----
    @Prop({ type: Object })
    current_shipping_price_set: Record<string, any>;

    @Prop()
    current_subtotal_price: string;

    @Prop({ type: Object })
    current_subtotal_price_set: Record<string, any>;

    @Prop({ type: Object })
    current_total_additional_fees_set: Record<string, any>;

    @Prop()
    current_total_discounts: string;

    @Prop({ type: Object })
    current_total_discounts_set: Record<string, any>;

    @Prop({ type: Object })
    current_total_duties_set: Record<string, any>;

    @Prop()
    current_total_price: string;

    @Prop({ type: Object })
    current_total_price_set: Record<string, any>;

    @Prop()
    current_total_tax: string;

    @Prop({ type: Object })
    current_total_tax_set: Record<string, any>;

    @Prop()
    customer_locale: string;

    @Prop()
    device_id: string;

    @Prop({ type: Array })
    discount_codes: Record<string, any>[];

    @Prop()
    duties_included: boolean;

    @Prop()
    estimated_taxes: boolean;

    @Prop()
    financial_status: string;

    @Prop()
    fulfillment_status: string;

    @Prop()
    landing_site: string;

    @Prop()
    landing_site_ref: string;

    @Prop()
    location_id: string;

    @Prop()
    merchant_business_entity_id: string;

    @Prop()
    merchant_of_record_app_id: string;

    @Prop()
    name: string;

    @Prop()
    note: string;

    @Prop({ type: Array })
    note_attributes: Record<string, any>[];

    @Prop()
    number: number;

    @Prop()
    order_number: number;

    @Prop({ type: Object })
    original_total_additional_fees_set: Record<string, any>;

    @Prop({ type: Object })
    original_total_duties_set: Record<string, any>;

    @Prop({ type: Array })
    payment_gateway_names: string[];

    @Prop()
    po_number: string;

    @Prop()
    presentment_currency: string;

    @Prop()
    processed_at: string;

    @Prop()
    reference: string;

    @Prop()
    referring_site: string;

    @Prop()
    source_identifier: string;

    @Prop()
    source_name: string;

    @Prop()
    source_url: string;

    @Prop()
    subtotal_price: string;

    @Prop({ type: Object })
    subtotal_price_set: Record<string, any>;

    @Prop()
    tags: string;

    @Prop()
    tax_exempt: boolean;

    @Prop({ type: Array })
    tax_lines: Record<string, any>[];

    @Prop()
    taxes_included: boolean;

    @Prop()
    test: boolean;

    @Prop()
    token: string;

    @Prop({ type: Object })
    total_cash_rounding_payment_adjustment_set: Record<string, any>;

    @Prop({ type: Object })
    total_cash_rounding_refund_adjustment_set: Record<string, any>;

    @Prop()
    total_discounts: string;

    @Prop({ type: Object })
    total_discounts_set: Record<string, any>;

    @Prop()
    total_line_items_price: string;

    @Prop({ type: Object })
    total_line_items_price_set: Record<string, any>;

    @Prop()
    total_outstanding: string;

    @Prop()
    total_price: string;

    @Prop({ type: Object })
    total_price_set: Record<string, any>;

    @Prop({ type: Object })
    total_shipping_price_set: Record<string, any>;

    @Prop()
    total_tax: string;

    @Prop({ type: Object })
    total_tax_set: Record<string, any>;

    @Prop()
    total_tip_received: string;

    @Prop()
    total_weight: number;

    @Prop()
    updated_at: string;

    @Prop()
    user_id: number;

    // ---- Nested Complex Objects ----
    @Prop({ type: Object })
    billing_address: Record<string, any>;

    @Prop({ type: Object })
    customer: Record<string, any>;

    @Prop({ type: Array })
    discount_applications: Record<string, any>[];

    @Prop({ type: Array })
    fulfillments: Record<string, any>[];

    @Prop({ type: Array })
    line_items: Record<string, any>[];

    @Prop({ type: Object })
    payment_terms: Record<string, any>;

    @Prop({ type: Array })
    refunds: Record<string, any>[];

    @Prop({ type: Object })
    shipping_address: Record<string, any>;

    @Prop({ type: Array })
    shipping_lines: Record<string, any>[];

    @Prop({ type: Array })
    returns: Record<string, any>[];

    @Prop({ type: Array })
    line_item_groups: Record<string, any>[];

    // Store complete raw payload
    @Prop({ type: Object })
    rawData: Record<string, any>;

    @Prop({ type: Object })
    webhookInfo: Record<string, any>;

    @Prop({ default: false })
    isTracked: boolean;
}

export const ShopifyOrderSchema = SchemaFactory.createForClass(ShopifyOrder);

ShopifyOrderSchema.index({ email: 1, shopId: 1 }); // Compound Index
ShopifyOrderSchema.index({ name: 'text', myshopifyDomain: 'text' }); // Text Search