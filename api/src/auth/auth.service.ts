import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role, User, UserStatus } from '../../generated/prisma/client';
import { toPublicUser } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        'This account is suspended by the platform manager',
      );
    }
    return this.issueSession(user);
  }

  async register(dto: RegisterDto) {
    if (dto.role === Role.MANAGER) {
      throw new ForbiddenException('Manager accounts cannot be self-registered');
    }
    const email = dto.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        name: dto.name.trim(),
        company: dto.company?.trim() || null,
        country: dto.country?.trim().toUpperCase() || null,
        role: dto.role,
        buyerProfile:
          dto.role === Role.BUYER
            ? {
                create: {
                  ticketMinEur: 0,
                  ticketMaxEur: 10_000_000,
                  countries: JSON.stringify([]),
                  categories: JSON.stringify([]),
                  licenses: JSON.stringify([]),
                  thesis: '',
                },
              }
            : undefined,
      },
    });
    return this.issueSession(user);
  }

  private async issueSession(user: User) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, user: toPublicUser(user) };
  }
}
