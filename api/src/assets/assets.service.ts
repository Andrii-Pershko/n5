import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AssetStatus,
  Prisma,
  Role,
  User,
  UserStatus,
} from '../../generated/prisma/client';
import {
  CONFIDENTIAL_SELLER,
  parseList,
  toPublicUser,
} from '../common/serialize';
import {
  assessListing,
  parseJsonList,
  scoreAssetAgainstMandate,
  type Mandate,
} from '../matching/matching';
import { paginate } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, QueryAssetsDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryAssetsDto, viewer?: User) {
    const where: Prisma.AssetWhereInput = {
      status: AssetStatus.PUBLISHED,
      seller: { status: UserStatus.ACTIVE },
    };
    if (query.category) where.category = query.category;
    if (query.country) where.country = query.country;
    if (query.businessStatus) where.businessStatus = query.businessStatus;
    if (query.minPrice != null || query.maxPrice != null) {
      where.priceEur = {};
      if (query.minPrice != null) where.priceEur.gte = query.minPrice;
      if (query.maxPrice != null) where.priceEur.lte = query.maxPrice;
    }
    if (query.q) {
      const q = { contains: query.q, mode: 'insensitive' as const };
      where.OR = [
        { title: q },
        { publicCode: q },
        { licenseType: q },
        { countryName: q },
        { summary: q },
      ];
    }

    const assets = await this.prisma.asset.findMany({
      where,
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });

    const mandate = await this.loadMandate(viewer);
    let items = assets.map((asset) => this.serialize(asset, viewer, mandate));

    if (query.sort === 'price_asc') {
      items = [...items].sort((a, b) => a.priceEur - b.priceEur);
    } else if (query.sort === 'price_desc') {
      items = [...items].sort((a, b) => b.priceEur - a.priceEur);
    } else if (query.sort === 'match' && mandate) {
      items = [...items].sort(
        (a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0),
      );
    }

    const countries = new Map<string, { country: string; countryName: string; count: number }>();
    for (const asset of assets) {
      const current = countries.get(asset.country);
      countries.set(asset.country, {
        country: asset.country,
        countryName: asset.countryName,
        count: (current?.count ?? 0) + 1,
      });
    }

    return {
      ...paginate(items, query.page, query.limit),
      meta: { countries: [...countries.values()] },
    };
  }

  async get(id: string, viewer?: User) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    const isOwner = viewer?.id === asset.sellerId;
    const isManager = viewer?.role === Role.MANAGER;
    const isPublic =
      asset.status === AssetStatus.PUBLISHED &&
      asset.seller.status === UserStatus.ACTIVE;
    if (!isPublic && !isOwner && !isManager) {
      throw new NotFoundException('Asset not found');
    }
    const mandate = await this.loadMandate(viewer);
    return this.serialize(asset, viewer, mandate);
  }

  async create(seller: User, dto: CreateAssetDto) {
    if (seller.role !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can publish assets');
    }
    const assessment = assessListing({
      country: dto.country,
      category: dto.category,
      licenseType: dto.licenseType,
      regulator: dto.regulator,
      businessStatus: dto.businessStatus,
      priceEur: dto.priceEur,
      employees: dto.employees,
      included: dto.included,
    });
    if (assessment.errors.length) {
      throw new ForbiddenException(assessment.errors.join('; '));
    }

    const count = await this.prisma.asset.count();
    const publicCode = `ND-${750 - count}`;

    const asset = await this.prisma.asset.create({
      data: {
        publicCode,
        sellerId: seller.id,
        title: dto.title,
        country: dto.country.toUpperCase(),
        countryName: dto.countryName,
        category: dto.category,
        licenseType: dto.licenseType,
        licenseName: dto.licenseName,
        regulator: dto.regulator,
        businessStatus: dto.businessStatus,
        assetType: dto.assetType,
        priceEur: dto.priceEur,
        employees: dto.employees,
        yearOfIssue: dto.yearOfIssue,
        included: JSON.stringify(dto.included),
        summary: dto.summary,
        isTopDeal: dto.isTopDeal ?? false,
        status: dto.status ?? AssetStatus.PUBLISHED,
      },
      include: { seller: true },
    });

    return {
      asset: this.serialize(asset, seller),
      validation: assessment,
    };
  }

  async mine(seller: User) {
    const assets = await this.prisma.asset.findMany({
      where: { sellerId: seller.id },
      include: { seller: true },
      orderBy: { createdAt: 'desc' },
    });
    return assets.map((asset) => this.serialize(asset, seller));
  }

  private async loadMandate(viewer?: User): Promise<Mandate | undefined> {
    if (!viewer || viewer.role !== Role.BUYER) {
      return undefined;
    }
    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId: viewer.id },
    });
    if (!profile) {
      return undefined;
    }
    return {
      countries: parseJsonList(profile.countries),
      categories: parseJsonList(profile.categories),
      licenses: parseJsonList(profile.licenses),
      ticketMinEur: profile.ticketMinEur,
      ticketMaxEur: profile.ticketMaxEur,
    };
  }

  private serialize(
    asset: Prisma.AssetGetPayload<{ include: { seller: true } }>,
    viewer?: User,
    mandate?: Mandate,
  ) {
    const canSeeSeller =
      !!viewer &&
      (viewer.role === Role.MANAGER || viewer.id === asset.sellerId);
    const match = mandate
      ? scoreAssetAgainstMandate(asset, mandate)
      : undefined;
    return {
      id: asset.id,
      publicCode: asset.publicCode,
      title: asset.title,
      country: asset.country,
      countryName: asset.countryName,
      category: asset.category,
      licenseType: asset.licenseType,
      licenseName: asset.licenseName,
      regulator: asset.regulator,
      businessStatus: asset.businessStatus,
      assetType: asset.assetType,
      priceEur: asset.priceEur,
      employees: asset.employees,
      yearOfIssue: asset.yearOfIssue,
      included: parseList(asset.included),
      summary: asset.summary,
      status: asset.status,
      isTopDeal: asset.isTopDeal,
      isValidated: asset.isValidated,
      createdAt: asset.createdAt,
      seller: canSeeSeller
        ? toPublicUser(asset.seller)
        : { ...CONFIDENTIAL_SELLER, id: 'confidential' },
      match,
    };
  }
}
