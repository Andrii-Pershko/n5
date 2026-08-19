import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetStatus, Role, UserStatus } from '../../generated/prisma/client';
import { paginate } from '../common/pagination';
import { parseList, toPublicUser } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async users(query: QueryAdminDto) {
    const users = await this.prisma.user.findMany({
      include: {
        _count: { select: { assets: true, inquiriesSent: true } },
        buyerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const items = users
      .filter((user) => {
        if (!query.q) return true;
        const hay = `${user.name} ${user.email} ${user.company ?? ''}`.toLowerCase();
        return hay.includes(query.q.toLowerCase());
      })
      .map((user) => ({
        ...toPublicUser(user),
        assetsCount: user._count.assets,
        inquiriesCount: user._count.inquiriesSent,
      }));
    return paginate(items, query.page, query.limit);
  }

  async assets(query: QueryAdminDto) {
    const assets = await this.prisma.asset.findMany({
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });
    const items = assets
      .filter((asset) => {
        if (!query.q) return true;
        const hay = `${asset.publicCode} ${asset.title} ${asset.countryName}`.toLowerCase();
        return hay.includes(query.q.toLowerCase());
      })
      .map((asset) => ({
        id: asset.id,
        publicCode: asset.publicCode,
        title: asset.title,
        country: asset.country,
        countryName: asset.countryName,
        category: asset.category,
        licenseType: asset.licenseType,
        priceEur: asset.priceEur,
        status: asset.status,
        included: parseList(asset.included),
        seller: toPublicUser(asset.seller),
      }));
    return paginate(items, query.page, query.limit);
  }

  async setUserStatus(id: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.MANAGER) {
      throw new ForbiddenException('Manager accounts cannot be suspended');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
    });
    return toPublicUser(updated);
  }

  async setAssetStatus(id: string, status: AssetStatus) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return this.prisma.asset.update({
      where: { id },
      data: { status },
    });
  }

  async deleteUser(id: string, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.id === actorId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    if (user.role === Role.MANAGER) {
      throw new ForbiddenException('Manager accounts cannot be deleted');
    }
    await this.prisma.user.delete({ where: { id } });
    return { ok: true, id };
  }
}
