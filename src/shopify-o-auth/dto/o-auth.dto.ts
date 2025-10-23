import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InstallAppDto {
    // @IsNotEmpty({ message: 'Shop domain is required, e.g. my-store.myshopify.com' })
    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'my-store.myshopify.com', description: 'Shop domain in the format {shop}.myshopify.com' })
    shop: string;
}

export class CallbackDto {
    @IsNotEmpty({ message: 'Shop domain is required, e.g. my-store.myshopify.com' })
    @IsString()
    @ApiProperty({ example: 'my-store.myshopify.com', description: 'Shop domain in the format {shop}.myshopify.com' })
    shop: string;

    @IsNotEmpty({ message: 'Authorization code is required, e.g. 342544jtRth' })
    @IsString()
    @ApiProperty({ example: '342544jtRth', description: 'Authorization code from Shopify' })
    code: string;

    @IsNotEmpty({ message: 'HMAC signature is required, e.g. de123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456' })
    @IsString()
    @ApiProperty({ example: 'de123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456', description: 'HMAC signature from Shopify' })
    hmac: string;
}