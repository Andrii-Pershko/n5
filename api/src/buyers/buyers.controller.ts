import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { Role, type User } from '../../generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BuyersService } from './buyers.service';
import { QueryBuyersDto, UpdateBuyerProfileDto } from './dto/buyer.dto';

@Controller()
export class BuyersController {
  constructor(private readonly buyers: BuyersService) {}

  @Get('buyers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.MANAGER)
  list(@Query() query: QueryBuyersDto, @CurrentUser() user: User) {
    return this.buyers.list(query, user);
  }

  @Get('buyers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER, Role.MANAGER)
  get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.buyers.get(id, user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER)
  mine(@CurrentUser() user: User) {
    return this.buyers.getMine(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER)
  update(@CurrentUser() user: User, @Body() dto: UpdateBuyerProfileDto) {
    return this.buyers.updateMine(user, dto);
  }
}
