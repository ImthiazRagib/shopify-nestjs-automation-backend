import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
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

