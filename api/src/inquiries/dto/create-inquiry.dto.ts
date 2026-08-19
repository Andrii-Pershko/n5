import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  buyerId?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
