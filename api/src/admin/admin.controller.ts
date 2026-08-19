import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, type User } from '../../generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  PatchAssetStatusDto,
  PatchUserStatusDto,
  QueryAdminDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MANAGER)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  users(@Query() query: QueryAdminDto) {
    return this.admin.users(query);
  }

  @Get('assets')
  assets(@Query() query: QueryAdminDto) {
    return this.admin.assets(query);
  }

  @Patch('users/:id')
  setUserStatus(@Param('id') id: string, @Body() dto: PatchUserStatusDto) {
    return this.admin.setUserStatus(id, dto.status);
  }

  @Patch('assets/:id')
  setAssetStatus(@Param('id') id: string, @Body() dto: PatchAssetStatusDto) {
    return this.admin.setAssetStatus(id, dto.status);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() actor: User) {
    return this.admin.deleteUser(id, actor.id);
  }
}
