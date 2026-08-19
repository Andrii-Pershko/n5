import {
  BadRequestException,
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
  scoreAssetAgainstMandate,
} from '../matching/matching';
import { paginate, type PaginationQueryDto } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(from: User, dto: CreateInquiryDto) {
    if (!dto.assetId && !dto.buyerId) {
      throw new BadRequestException('Provide assetId or buyerId');
    }
    if (from.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Suspended accounts cannot send inquiries');
    }

    if (dto.assetId) {
      return this.createForAsset(from, dto.assetId, dto.message);
    }
    return this.createForBuyer(from, dto.buyerId!, dto.message);
  }

  async list(user: User, query: PaginationQueryDto) {
    const inquiries = await this.prisma.inquiry.findMany({
      where:
        user.role === Role.MANAGER
          ? undefined
          : { OR: [{ fromUserId: user.id }, { toUserId: user.id }] },
      include: {
        fromUser: true,
        toUser: true,
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return paginate(
      inquiries.map((item) => this.serialize(item, user)),
      query.page,
      query.limit,
    );
  }

  private async createForAsset(from: User, assetId: string, message: string) {
    if (from.role !== Role.BUYER) {
      throw new ForbiddenException('Only buyers can inquire on assets');
    }
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { seller: true },
    });
    if (
      !asset ||
      asset.status !== AssetStatus.PUBLISHED ||
      asset.seller.status !== UserStatus.ACTIVE
    ) {
      throw new NotFoundException('Asset is not available');
    }
    if (asset.sellerId === from.id) {
      throw new ForbiddenException('You cannot inquire on your own asset');
    }

    const profile = await this.prisma.buyerProfile.findUnique({
      where: { userId: from.id },
    });
    const match = profile
      ? scoreAssetAgainstMandate(asset, {
          countries: parseJsonList(profile.countries),
          categories: parseJsonList(profile.categories),
          licenses: parseJsonList(profile.licenses),
          ticketMinEur: profile.ticketMinEur,
          ticketMaxEur: profile.ticketMaxEur,
        })
      : undefined;

    const threadKey = `asset:${from.id}:${asset.id}`;
    const existing = await this.prisma.inquiry.findUnique({
      where: { threadKey },
    });
    if (existing) {
      throw new BadRequestException('You already opened an inquiry for this asset');
    }

    const created = await this.prisma.inquiry.create({
      data: {
        threadKey,
        fromUserId: from.id,
        toUserId: asset.sellerId,
        assetId: asset.id,
        message,
        matchScore: match?.score,
        matchReasons: match ? JSON.stringify(match.reasons) : null,
      },
      include: { fromUser: true, toUser: true, asset: true },
    });
    return this.serialize(created, from);
  }

  private async createForBuyer(from: User, buyerId: string, message: string) {
    if (from.role !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can contact buyers');
    }
    if (from.id === buyerId) {
      throw new ForbiddenException('You cannot contact yourself');
    }
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
      include: { buyerProfile: true },
    });
    if (!buyer || buyer.role !== Role.BUYER || buyer.status !== UserStatus.ACTIVE) {
      throw new NotFoundException('Buyer is not available');
    }
    const threadKey = `buyer:${from.id}:${buyer.id}`;
    const existing = await this.prisma.inquiry.findUnique({
      where: { threadKey },
    });
    if (existing) {
      throw new BadRequestException('You already contacted this buyer');
    }

    const asset = await this.prisma.asset.findFirst({
      where: { sellerId: from.id, status: AssetStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
    });
    const match =
      buyer.buyerProfile && asset
        ? scoreAssetAgainstMandate(asset, {
            countries: parseJsonList(buyer.buyerProfile.countries),
            categories: parseJsonList(buyer.buyerProfile.categories),
            licenses: parseJsonList(buyer.buyerProfile.licenses),
            ticketMinEur: buyer.buyerProfile.ticketMinEur,
            ticketMaxEur: buyer.buyerProfile.ticketMaxEur,
          })
        : undefined;

    const created = await this.prisma.inquiry.create({
      data: {
        threadKey,
        fromUserId: from.id,
        toUserId: buyer.id,
        assetId: asset?.id,
        message,
        matchScore: match?.score,
        matchReasons: match ? JSON.stringify(match.reasons) : null,
      },
      include: { fromUser: true, toUser: true, asset: true },
    });
    return this.serialize(created, from);
  }

  private serialize(
    inquiry: {
      id: string;
      threadKey: string;
      message: string;
      matchScore: number | null;
      matchReasons: string | null;
      status: string;
      createdAt: Date;
      fromUser: User;
      toUser: User;
      asset: {
        id: string;
        publicCode: string;
        title: string;
        countryName: string;
        priceEur: number;
      } | null;
    },
    viewer: User,
  ) {
    return {
      id: inquiry.id,
      message: inquiry.message,
      matchScore: inquiry.matchScore,
      matchReasons: parseList(inquiry.matchReasons),
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      from: toPublicUser(inquiry.fromUser),
      to: toPublicUser(inquiry.toUser),
      direction: inquiry.fromUser.id === viewer.id ? 'out' : 'in',
      asset: inquiry.asset
        ? {
            id: inquiry.asset.id,
            publicCode: inquiry.asset.publicCode,
            title: inquiry.asset.title,
            countryName: inquiry.asset.countryName,
            priceEur: inquiry.asset.priceEur,
          }
        : null,
    };
  }
}
