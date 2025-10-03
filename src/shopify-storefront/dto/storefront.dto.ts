import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, IsEnum } from "class-validator";

export class SearchProductsDto {
  @ApiProperty({ description: 'Search query string' })
  @IsString()
  @IsOptional()
  query: string = '';

  @ApiProperty({ description: 'Number of results to fetch (first)', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1, { message: 'first must be at least 1' })
  first?: number;

  @ApiProperty({ description: 'Number of results to fetch (last)', required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1, { message: 'last must be at least 1' })
  last?: number;

  @ApiProperty({ description: 'Cursor pagination: fetch before this cursor', required: false })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiProperty({ description: 'Cursor pagination: fetch after this cursor', required: false })
  @IsOptional()
  @IsString()
  after?: string;

  @ApiProperty({ description: 'Prefix filter for product titles', required: false, enum: ['LAST', 'NONE'] })
  @IsOptional()
  @IsEnum(['LAST', 'NONE'])
  prefix?: 'LAST' | 'NONE';

  @ApiProperty({ description: 'Reverse the order of results', required: false, default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  reverse?: boolean;

  @ApiProperty({ description: 'Sort key for ordering results', required: false, enum: ['TITLE', 'PRICE', 'CREATED_AT', 'UPDATED_AT', 'ID'] })
  @IsOptional()
  @IsEnum(['PRICE', 'RELEVENCE'])
  sortKey?: 'PRICE' | 'RELEVENCE';

  @ApiProperty({ description: 'Filter by product type', required: false, enum: ['ARTICLE', 'PAGE', 'PRODUCT'] })
  @IsOptional()
  @IsEnum(['ARTICLE', 'PAGE', 'PRODUCT'])
  type?: 'ARTICLE' | 'PAGE' | 'PRODUCT';

  @ApiProperty({ description: 'Filter by product availability', required: false, enum: ['SHOW', 'HIDE', 'FIRST_AVAILABLE'] })
  @IsOptional()
  @IsEnum(['SHOW', 'HIDE', 'LAST'])
  unavailableProducts?: 'SHOW' | 'HIDE' | 'LAST';
}
