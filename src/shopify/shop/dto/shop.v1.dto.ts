import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { GlobalPaginationDto } from 'src/global-dto/global-pagination.dto';

export class QueryShopProductDto extends GlobalPaginationDto {
  @ApiProperty({ description: 'Unique identifier of the shop', required: false })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ description: 'Title of the product', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Vendor of the product', required: false })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty({ description: 'Product type', required: false })
  @IsOptional()
  @IsString()
  product_type?: string;

  @ApiProperty({ description: 'Status of the product', required: false, enum: ['active', 'draft', 'archived'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Collection ID', required: false })
  @IsOptional()
  @IsString()
  collection_id?: string;

  @ApiProperty({ description: 'Fields to include', required: false })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiProperty({ description: 'Published status', required: false, enum: ['any', 'published', 'unpublished'] })
  @IsOptional()
  @IsString()
  published_status?: string = 'any';

  @ApiProperty({ description: 'Published scope', required: false, enum: ['global', 'web'] })
  @IsOptional()
  @IsString()
  published_scope?: string;
}

export class GetOrdersDto extends GlobalPaginationDto {
  @ApiProperty({ description: 'Unique identifier of the shop', required: false })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ description: 'Name of the shop', required: false })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ description: 'Domain of the shop', required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  financialStatus?: string; // paid, pending, refunded, voided

  @IsOptional()
  @IsString()
  fulfillmentStatus?: string; // fulfilled, partial, unfulfilled, restocked

  /**
   * 
   *  * fulfilled	✅ All items in the order have been fulfilled (completely shipped).
      null (or "")	🚫 None of the items have been fulfilled yet.
      partial	🟡 Some (but not all) items in the order have been fulfilled.
      restocked	🔁 The fulfillment was canceled and the items were restocked.
      unfulfilled	🟥 No fulfillment has been made yet (similar to null).
      in_progress	🚚 Fulfillment is in progress (some line items are being processed).
      on_hold	⏸️ Fulfillment is temporarily paused (rarely used, usually by 3PL apps).
      scheduled	🕓 Fulfillment is scheduled for a later date.
   */

  @IsOptional()
  @IsString()
  status?: string = 'any'; // open, closed, cancelled, any
}
export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer information',
    required: false,
    example: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+15551234567',
    },
  })
  @IsOptional()
  customer?: {
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };

  @ApiProperty({
    description: 'Send receipt to customer',
    required: false,
    default: true,
  })
  @IsOptional()
  send_receipt?: boolean = true;

  @ApiProperty({
    description: 'Financial status of the order',
    required: false,
    enum: ['paid', 'pending', 'partially_paid', 'refunded', 'voided'],
  })
  @IsOptional()
  @IsString()
  financial_status?: string = 'pending';

  @ApiProperty({
    description: 'Line items of the order',
    type: 'array',
    example: [
      { variant_id: 123456789, quantity: 2 },
      { variant_id: 987654321, quantity: 1 },
    ],
  })
  @IsNotEmpty()
  line_items: Array<{
    variant_id: number;
    quantity: number;
  }>;

  @ApiProperty({
    description: 'Billing address of the order',
    required: false,
    example: {
      first_name: 'John',
      last_name: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'US',
      zip: '10001',
    },
  })
  @IsOptional()
  billing_address?: any;

  @ApiProperty({
    description: 'Shipping address of the order',
    required: false,
    example: {
      first_name: 'John',
      last_name: 'Doe',
      address1: '123 Main St',
      city: 'New York',
      province: 'NY',
      country: 'US',
      zip: '10001',
    },
  })
  @IsOptional()
  shipping_address?: any;

  @ApiProperty({
    description: 'Fulfillment status of the order',
    required: false,
    enum: ['unfulfilled', 'fulfilled', 'partial', 'restocked'],
  })
  @IsOptional()
  @IsString()
  fulfillment_status?: string = 'unfulfilled';

  @ApiProperty({
    description: 'Order tags for internal tracking or filtering',
    required: false,
    example: 'web-order, vip-customer',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Additional note or special instruction for the order',
    required: false,
    example: 'Gift wrap this order and deliver after 5 PM.',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Browser IP address of the customer', required: false })
  @IsOptional()
  @IsString()
  browserIp?: string;
}

export class UpdateOrderDto {
  @ApiProperty({ description: 'Optional note for the order', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Comma-separated tags for the order', required: false })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ description: 'Updated shipping address', required: false })
  @IsOptional()
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
}
export class CreateOrderCapturePaymentDto {
  @ApiProperty({ description: 'Fulfillment kind', required: false, enum: ['sale', 'return'] })
  @IsOptional()
  @IsString()
  kind: string;

  @ApiProperty({ description: 'Fulfillment status', required: false, enum: ['fulfilled', 'partial', 'unfulfilled', 'restocked'] })
  @IsOptional()
  @IsString()
  status: string;

  @ApiProperty({ description: 'Total amount of the fulfillment', required: false })
  @IsOptional()
  @IsString()
  amount: string;

  @ApiProperty({ description: 'Currency of the amount', required: false })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';
}
export class CreateOrderFulfillmentDto {
  @ApiProperty({ description: 'Location ID for fulfillment', required: true, type: Number })
  @IsNotEmpty()
  locationId: number;

  @ApiProperty({ description: 'Tracking number for the shipment', required: true })
  @IsNotEmpty()
  @IsString()
  trackingNumber: string;

  @ApiProperty({ description: 'Tracking company name', required: true })
  @IsNotEmpty()
  @IsString()
  trackingCompany: string;

  @ApiProperty({ description: 'Notify customer about fulfillment', required: false, default: false })
  @IsOptional()
  notifyCustomer: boolean = true;

  @ApiProperty({
    description: 'Line items to fulfill',
    type: 'array',
    example: [{ id: 123, quantity: 2 }],
  })
  @IsNotEmpty()
  lineItems: { id: number; quantity: number }[];

  @ApiProperty({ description: 'Fulfillment service', required: false, default: 'manual' })
  @IsOptional()
  @IsString()
  fulfillmentService: string = 'manual';
}

export class RequestShopifyFulfillmentDto {
  @ApiProperty({
    description: 'Line items to fulfill',
    type: [Object],
    example: [{ id: 1111111111 }, { id: 2222222222 }],
  })
  @IsArray()
  @IsNotEmpty()
  lineItems: Array<{ id: number }>;

  @ApiProperty({ description: 'Tracking number', required: false })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty({ description: 'Tracking company', required: false })
  @IsOptional()
  @IsString()
  trackingCompany?: string;

  @ApiProperty({ description: 'Tracking URL', required: false })
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiProperty({ description: 'Whether to notify the customer', default: true })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean = true;

  @ApiProperty({ description: 'Shopify location ID', required: false })
  @IsOptional()
  @IsNumber()
  locationId?: number;
}

export class QueryShopDto extends GlobalPaginationDto {
  @ApiProperty({ description: 'Unique identifier of the shop', required: false })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty({ description: 'Name of the shop', required: false })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ description: 'Domain of the shop', required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Unique identifier of the shop' })
  @IsNotEmpty()
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Product data' })
  @IsNotEmpty()
  product: Record<string, any>;
}

