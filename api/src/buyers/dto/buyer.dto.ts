import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class UpdateBuyerProfileDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ticketMinEur!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  ticketMaxEur!: number;

  @IsArray()
  @IsString({ each: true })
  countries!: string[];

  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @IsArray()
  @IsString({ each: true })
  licenses!: string[];

  @IsString()
  @MaxLength(2000)
  thesis!: string;
}

export class QueryBuyersDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  license?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  againstAssetId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ticketMinEur?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ticketMaxEur?: number;
}
