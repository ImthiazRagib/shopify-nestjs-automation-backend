import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsArray,
    IsOptional,
    ValidateNested,
    IsIn,
    IsInt,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MediaType } from '../enum';

class ProductVariantDto {
    @ApiProperty({ example: 'Small' })
    @IsString()
    option1: string;

    @ApiProperty({ example: '29.99' })
    @IsString()
    price: string;

    @ApiProperty({ example: 'TSHIRT-SM' })
    @IsString()
    sku: string;

    @ApiProperty({ example: 'shopify', description: 'Inventory management system' })
    @IsString()
    inventory_management: string;

    @ApiProperty({ example: 10, description: 'Inventory quantity' })
    @IsInt()
    inventory_quantity: number;
}

class ProductOptionDto {
    @ApiProperty({ example: 'Size' })
    @IsString()
    name: string;

    @ApiProperty({ example: ['Small', 'Medium'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    values: string[];
}

class ProductCategoryDto {
    @ApiProperty({ example: 'gid://shopify/ProductCategory/123', description: 'Category ID' })
    @IsString()
    id: string;

    @ApiProperty({ example: false, description: 'Whether the category is archived' })
    @IsOptional()
    isArchived?: boolean;

    @ApiProperty({ example: true, description: 'Whether the category is a leaf node' })
    @IsOptional()
    isLeaf?: boolean;

    @ApiProperty({ example: false, description: 'Whether the category is root' })
    @IsOptional()
    isRoot?: boolean;

    @ApiProperty({ example: 2, description: 'Category level in hierarchy' })
    @IsOptional()
    level?: number;

    @ApiProperty({ example: 'Animals & Pet Supplies > Pet Supplies > Dog Supplies > Dog Beds.', description: 'Category full name' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'Shirts', description: 'Category name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'gid://shopify/ProductCategory/12', description: 'Parent category ID' })
    @IsOptional()
    parentId?: string;
}

class ProductCollectionDto {
    @ApiProperty({ example: 123, description: 'Collection ID as integer' })
    @IsInt()
    id: number;

    @ApiProperty({ example: 'Summer Collection', description: 'Collection title' })
    @IsString()
    title: string;

    @ApiProperty({ example: 456, description: 'Sort order integer' })
    @IsInt()
    sortOrder: number;

    @ApiProperty({ example: 'Visible', description: 'Collection handle' })
    @IsString()
    handle: string;

    @ApiProperty({ example: true, description: 'Whether the collection is published' })
    @IsBoolean()
    published: boolean;

    @ApiProperty({ example: 'updated_at', enum: ['id', 'relevance', 'title', 'updated_at'], description: 'Sort key for collection' })
    @IsIn(['id', 'relevance', 'title', 'updated_at'])
    sortKey: 'id' | 'relevance' | 'title' | 'updated_at';

    @ApiProperty({ example: 'summer-collection', description: 'Collection handle for querying' })
    @IsString()
    @IsOptional()
    query?: string;

}

class ProductMediaDto {
    @IsOptional()
    @ApiProperty({ example: 'Image', description: 'Media type' })
    @IsIn(Object.values(MediaType))
    media_type: MediaType;

    // @ApiProperty({ example: 'https://cdn.shopify.com/s/files/1/1234/5678/products/tshirt.jpg', description: 'Source URL for the media' })
    // @IsString()
    // src: string;

    // @ApiProperty({ example: 'T-Shirt Front View', description: 'Alt text for accessibility' })
    // @IsOptional()
    // @IsString()
    // alt?: string;

    // @ApiProperty({ example: 1, description: 'Position in the media list' })
    // @IsInt()
    // position: number;

    // @ApiProperty({ example: true, description: 'Whether this media is the featured image' })
    // @IsBoolean()
    // is_featured: boolean;

    // Pagination helpers
    @ApiProperty({ example: 10, description: 'The first n elements from the paginated list', required: false })
    @IsOptional()
    @IsInt()
    first?: number;

    @ApiProperty({ example: 'eyJsYXN0X2lkIjo0MDk5MzEwNzA0LCJsYXN0X3ZhbHVlIjoiNDA5OTMxMDcwNCJ9', description: 'The elements that come after the specified cursor', required: false })
    @IsOptional()
    @IsString()
    after?: string;

    @ApiProperty({ example: 10, description: 'The last n elements from the paginated list', required: false })
    @IsOptional()
    @IsInt()
    last?: number;

    @ApiProperty({ example: 'eyJmaXJzdF9pZCI6NDA5OTMxMDcwNCwiZmlyc3RfdmFsdWUiOiI0MDk5MzEwNzA0In0=', description: 'The elements that come before the specified cursor', required: false })
    @IsOptional()
    @IsString()
    before?: string;

    @ApiProperty({ example: false, description: 'Reverse the order of the underlying list', required: false })
    @IsOptional()
    @IsBoolean()
    reverse?: boolean;

    @ApiProperty({ example: 'POSITION', enum: ['ID', 'POSITION'], description: 'Sort key for media list', required: false })
    @IsOptional()
    @IsIn(['ID', 'POSITION'])
    sortKey?: 'ID' | 'POSITION';

    @ApiProperty({ example: `Search by id, media_type like, ${Object.values(MediaType)}`, description: 'Search by query', required: false })
    @IsOptional()
    @IsString()
    query?: string;
}

class ProductImageDto {
    @ApiProperty({ example: 'https://cdn.shopify.com/s/files/1/1234/5678/products/tshirt.jpg', description: 'Image source URL' })
    @IsString()
    src: string;

    @ApiProperty({ example: 1, description: 'Position of the image in the list' })
    @IsInt()
    position: number;
}

class ProductImagesArrayDto {
    @ApiProperty({ type: [ProductImageDto], description: 'Array of product images with src and position' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images: { src: string; position: number }[];
}


export class AddShopifyProductDto {
    @IsNotEmpty()
    @ApiProperty({ example: 'Elegant Cotton T-Shirt' })
    @IsString()
    title: string;

    @ApiProperty({
        example: '<strong>Soft, durable, and stylish.</strong>',
        description: 'HTML description for product',
    })
    @IsString()
    body_html: string;

    @ApiProperty({ example: 'Imthiaz Apparel' })
    @IsString()
    vendor: string;

    @ApiProperty({ example: 'T-Shirts' })
    @IsString()
    product_type: string;

    @ApiProperty({ example: ['cotton', 'unisex', 'summer'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ example: 100, description: 'Total inventory count' })
    @IsInt()
    totalInventory: number;

    @ApiProperty({ type: ProductImagesArrayDto, description: 'Product images' })
    @ValidateNested()
    @Type(() => ProductImagesArrayDto)
    images: ProductImagesArrayDto;

    @ApiProperty({ example: true, description: 'Whether inventory is tracked' })
    @IsBoolean()
    tracksInventory: boolean;

    @ApiProperty({ type: [ProductCategoryDto], description: 'Product categories' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCategoryDto)
    categories: ProductCategoryDto[];

    @ApiProperty({ type: [ProductCollectionDto], description: 'Collections this product belongs to' })
    @ValidateNested({ each: true })
    @Type(() => ProductCollectionDto)
    collections: ProductCollectionDto[];

    @ApiProperty({ type: [ProductVariantDto] })
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];

    @ApiProperty({ type: [ProductOptionDto] })
    @ValidateNested({ each: true })
    @Type(() => ProductOptionDto)
    options: ProductOptionDto[];

    @ApiProperty({
        example: 'active',
        enum: ['active', 'draft', 'archived'],
        description: 'Shopify product status',
    })
    @IsIn(['active', 'draft', 'archived'])
    status: string;
}

export class UpdateShopifyProductDto {
    @IsNotEmpty()
    @ApiProperty({ example: 'Elegant Cotton T-Shirt' })
    @IsString()
    title: string;

    @ApiProperty({
        example: '<strong>Soft, durable, and stylish.</strong>',
        description: 'HTML description for product',
    })
    @IsString()
    body_html: string;

    @ApiProperty({ example: 'Imthiaz Apparel' })
    @IsString()
    vendor: string;

    @ApiProperty({ example: 'T-Shirts' })
    @IsString()
    product_type: string;

    @ApiProperty({ example: ['cotton', 'unisex', 'summer'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({ example: 100, description: 'Total inventory count' })
    @IsInt()
    totalInventory: number;

    @ApiProperty({ type: ProductImagesArrayDto, description: 'Product images' })
    @ValidateNested()
    @Type(() => ProductImagesArrayDto)
    images: ProductImagesArrayDto;

    @ApiProperty({ example: true, description: 'Whether inventory is tracked' })
    @IsBoolean()
    tracksInventory: boolean;

    @ApiProperty({ type: [ProductCategoryDto], description: 'Product categories' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductCategoryDto)
    categories: ProductCategoryDto[];

    @ApiProperty({ type: [ProductCollectionDto], description: 'Collections this product belongs to' })
    @ValidateNested({ each: true })
    @Type(() => ProductCollectionDto)
    collections: ProductCollectionDto[];

    @ApiProperty({ type: [ProductVariantDto] })
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];

    @ApiProperty({ type: [ProductOptionDto] })
    @ValidateNested({ each: true })
    @Type(() => ProductOptionDto)
    options: ProductOptionDto[];

    @ApiProperty({
        example: 'active',
        enum: ['active', 'draft', 'archived'],
        description: 'Shopify product status',
    })
    @IsIn(['active', 'draft', 'archived'])
    status: string;
}
