import { IsEnum, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GlobalQueryDto {
  @IsOptional()
  @Type(() => String)
  search?: string;

  @IsOptional()
  @Type(() => String)
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}


export class GlobalPaginationDto extends GlobalQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => String)
  pageInfo?: string; // for pagination
}