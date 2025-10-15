import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { GlobalPaginationDto } from 'src/global-dto/global-pagination.dto';

export class GetOrdersDto extends GlobalPaginationDto {
  @ApiProperty({ description: 'Unique identifier of the shop' })
  @IsNotEmpty()
  @IsString()
  shopId: string;

//   @ApiProperty({ description: 'Access token for the shop', required: false })
//   @IsNotEmpty()
//   @IsString()
//   accessToken: string;

  @ApiProperty({ description: 'Name of the shop', required: false })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ description: 'Domain of the shop', required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}

export class QueryShopDto extends GlobalPaginationDto {
  @ApiProperty({ description: 'Unique identifier of the shop' })
  @IsNotEmpty()
  @IsString()
  shopId: string;
//   @ApiProperty({ description: 'Access token for the shop', required: false })
//   @IsOptional()
//   @IsString()
//   accessToken?: string;

  @ApiProperty({ description: 'Name of the shop', required: false })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiProperty({ description: 'Domain of the shop', required: false })
  @IsOptional()
  @IsString()
  domain?: string;
}
