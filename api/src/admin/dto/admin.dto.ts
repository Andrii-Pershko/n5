import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatus, UserStatus } from '../../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class QueryAdminDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}

export class PatchUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

export class PatchAssetStatusDto {
  @IsEnum(AssetStatus)
  status!: AssetStatus;
}
