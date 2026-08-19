import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { User } from '../../generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/pagination';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiriesService } from './inquiries.service';

@Controller('inquiries')
@UseGuards(JwtAuthGuard)
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.inquiries.list(user, query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateInquiryDto) {
    return this.inquiries.create(user, dto);
  }
}
