import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const PAGE_SIZE = 10;

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export function paginate<T>(items: T[], page = 1, limit = PAGE_SIZE) {
  const safeLimit = Math.min(Math.max(limit || PAGE_SIZE, 1), 50);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / safeLimit));
  const current = Math.min(Math.max(page || 1, 1), pageCount);
  const start = (current - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    total,
    page: current,
    limit: safeLimit,
    pageCount,
  };
}
