import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '../../generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssetsService } from './assets.service';
import { CreateAssetDto, QueryAssetsDto } from './dto/asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assets: AssetsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  list(@Query() query: QueryAssetsDto, @CurrentUser() user?: User) {
    return this.assets.list(query, user);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  mine(@CurrentUser() user: User) {
    return this.assets.mine(user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtGuard)
  get(@Param('id') id: string, @CurrentUser() user?: User) {
    return this.assets.get(id, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  create(@CurrentUser() user: User, @Body() dto: CreateAssetDto) {
    return this.assets.create(user, dto);
  }
}
