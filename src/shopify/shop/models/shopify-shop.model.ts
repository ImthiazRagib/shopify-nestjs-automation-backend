import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopifyStoreDocument = ShopifyStore & Document;

@Schema({ timestamps: true })
export class ShopifyStore {
    @Prop({ required: true, unique: true })
    shopId: string; // Shopify global ID (gid://shopify/Shop/...)

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    myshopifyDomain: string;

    @Prop({ type: Object, required: true })
    primaryDomain: {
        url: string;
    };

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    accessToken: string;

    @Prop({ type: Object, required: true })
    plan: {
        displayName: string;
    };

    @Prop({ required: true })
    currencyCode: string;

    @Prop({ type: Object, default: {} })
    session: Record<string, any>;

    @Prop({ type: Object, default: {} })
    metaData: Record<string, any>;
}

export const ShopifyStoreSchema = SchemaFactory.createForClass(ShopifyStore);
