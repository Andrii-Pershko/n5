import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AssetStatus,
  BusinessCategory,
  BusinessStatus,
} from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class CreateAssetDto {
  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  country!: string;

  @IsString()
  countryName!: string;

  @IsEnum(BusinessCategory)
  category!: BusinessCategory;

  @IsString()
  licenseType!: string;

  @IsString()
  licenseName!: string;

  @IsOptional()
  @IsString()
  regulator?: string;

  @IsEnum(BusinessStatus)
  businessStatus!: BusinessStatus;

  @IsString()
  assetType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  priceEur!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employees?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearOfIssue?: number;

  @IsArray()
  @IsString({ each: true })
  included!: string[];

  @IsString()
  @MaxLength(2000)
  summary!: string;

  @IsOptional()
  @IsBoolean()
  isTopDeal?: boolean;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}

export class QueryAssetsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(BusinessCategory)
  category?: BusinessCategory;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(BusinessStatus)
  businessStatus?: BusinessStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'match';
}
