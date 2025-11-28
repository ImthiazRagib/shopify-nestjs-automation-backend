import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'shopify_logs' })
export class ShopifyLogs extends Document {
  @Prop()
  method: string;

  @Prop()
  url: string;

  @Prop()
  statusCode: number;

  @Prop({ type: Object })
  response?: any;

  @Prop({ type: Object })
  error?: any;

  @Prop()
  type: 'success' | 'error';

  @Prop()
  ip: string;

  @Prop()
  userAgent: string;
}

export const ShopifyLogsSchema = SchemaFactory.createForClass(ShopifyLogs);
