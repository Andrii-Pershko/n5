import { ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
  const service = new AuthService(
    prisma as never,
    jwt as unknown as JwtService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.signAsync.mockResolvedValue('token');
  });

  it('rejects manager self-signup', async () => {
    await expect(
      service.register({
        email: 'boss@n5deal.demo',
        password: 'secret1',
        name: 'Boss',
        role: 'MANAGER' as never,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        email: 'buyer@n5deal.demo',
        password: 'secret1',
        name: 'Buyer',
        role: 'BUYER' as never,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a buyer with an empty mandate and returns a session', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'new@n5deal.demo',
      name: 'New Buyer',
      company: null,
      country: 'UK',
      role: 'BUYER',
      status: 'ACTIVE',
    });

    const result = await service.register({
      email: 'new@n5deal.demo',
      password: 'secret1',
      name: 'New Buyer',
      country: 'uk',
      role: 'BUYER' as never,
    });

    expect(result.accessToken).toBe('token');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@n5deal.demo',
          role: 'BUYER',
          buyerProfile: expect.objectContaining({ create: expect.any(Object) }),
        }),
      }),
    );
  });
});
