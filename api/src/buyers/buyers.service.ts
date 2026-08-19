import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssetStatus,
  Role,
  User,
  UserStatus,
} from '../../generated/prisma/client';
import { parseList, toPublicUser } from '../common/serialize';
import {
  parseJsonList,
  scoreBuyerAgainstAsset,
  type Mandate,
} from '../matching/matching';
import { paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBuyersDto, UpdateBuyerProfileDto } from './dto/buyer.dto';
import { matchesBuyerFilters } from './buyer-filters';

@Injectable()
export class BuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryBuyersDto, viewer: User) {
    if (viewer.role !== Role.SELLER && viewer.role !== Role.MANAGER) {
      throw new ForbiddenException('Only sellers can browse buyers');
    }

    const profiles = await this.prisma.buyerProfile.findMany({
      include: { user: true },
    });

    const against = query.againstAssetId
      ? await this.prisma.asset.findFirst({
          where: {
            id: query.againstAssetId,
            sellerId: viewer.role === Role.SELLER ? viewer.id : undefined,
          },
        })
      : await this.prisma.asset.findFirst({
          where: {
            sellerId: viewer.id,
            status: AssetStatus.PUBLISHED,
          },
          orderBy: { createdAt: 'desc' },
        });

    const active = profiles
      .filter((profile) => profile.user.status === UserStatus.ACTIVE)
      .map((profile) => {
        const mandate = this.toMandate(profile);
        const match = against
          ? scoreBuyerAgainstAsset(mandate, against)
          : undefined;
        return {
          ...this.serialize(profile),
          match,
        };
      });

    const countries = new Map<string, number>();
    const licenses = new Set<string>();
    for (const item of active) {
      for (const country of item.countries) {
        countries.set(country, (countries.get(country) ?? 0) + 1);
      }
      for (const license of item.licenses) {
        licenses.add(license);
      }
    }

    const items = active
      .filter((item) => matchesBuyerFilters(item, query))
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
    return {
      ...paginate(items, query.page, query.limit),
      meta: {
        countries: [...countries.entries()].map(([country, count]) => ({
          country,
          count,
        })),
        licenses: [...licenses].sort(),
      },
    };
  }

  async get(id: string, viewer: User) {
    if (viewer.role !== Role.SELLER && viewer.role !== Role.MANAGER) {
      throw new ForbiddenException();
    }
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId: id },
      include: { user: true },
    });
    if (!profile || profile.user.status === UserStatus.SUSPENDED) {
      throw new NotFoundException('Buyer not found');
    }
    return this.serialize(profile);
  }

  async getMine(user: User) {
    if (user.role !== Role.BUYER) {
      throw new ForbiddenException('Only buyers have a mandate profile');
    }
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return this.serialize(profile);
  }

  async updateMine(user: User, dto: UpdateBuyerProfileDto) {
    if (user.role !== Role.BUYER) {
      throw new ForbiddenException('Only buyers have a mandate profile');
    }
    if (dto.ticketMaxEur < dto.ticketMinEur) {
      throw new ForbiddenException('Max ticket must be greater than min ticket');
    }
    const profile = await this.prisma.buyerProfile.upsert({
      where: { userId: user.id },
      update: {
        ticketMinEur: dto.ticketMinEur,
        ticketMaxEur: dto.ticketMaxEur,
        countries: JSON.stringify(dto.countries),
        categories: JSON.stringify(dto.categories),
        licenses: JSON.stringify(dto.licenses),
        thesis: dto.thesis,
      },
      create: {
        userId: user.id,
        ticketMinEur: dto.ticketMinEur,
        ticketMaxEur: dto.ticketMaxEur,
        countries: JSON.stringify(dto.countries),
        categories: JSON.stringify(dto.categories),
        licenses: JSON.stringify(dto.licenses),
        thesis: dto.thesis,
      },
      include: { user: true },
    });
    return this.serialize(profile);
  }

  private toMandate(profile: {
    countries: string;
    categories: string;
    licenses: string;
    ticketMinEur: number;
    ticketMaxEur: number;
  }): Mandate {
    return {
      countries: parseJsonList(profile.countries),
      categories: parseJsonList(profile.categories),
      licenses: parseJsonList(profile.licenses),
      ticketMinEur: profile.ticketMinEur,
      ticketMaxEur: profile.ticketMaxEur,
    };
  }

  private serialize(profile: {
    userId: string;
    ticketMinEur: number;
    ticketMaxEur: number;
    countries: string;
    categories: string;
    licenses: string;
    thesis: string;
    user: User;
  }) {
    return {
      userId: profile.userId,
      ticketMinEur: profile.ticketMinEur,
      ticketMaxEur: profile.ticketMaxEur,
      countries: parseList(profile.countries),
      categories: parseList(profile.categories),
      licenses: parseList(profile.licenses),
      thesis: profile.thesis,
      user: toPublicUser(profile.user),
    };
  }
}
