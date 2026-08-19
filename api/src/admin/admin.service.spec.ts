import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new AdminService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hard-deletes a seller', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'seller-1',
      role: 'SELLER',
    });
    prisma.user.delete.mockResolvedValue({});
    await expect(service.deleteUser('seller-1', 'manager-1')).resolves.toEqual({
      ok: true,
      id: 'seller-1',
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'seller-1' },
    });
  });

  it('refuses to delete the acting manager', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'manager-1',
      role: 'MANAGER',
    });
    await expect(
      service.deleteUser('manager-1', 'manager-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses to delete another manager', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'manager-2',
      role: 'MANAGER',
    });
    await expect(
      service.deleteUser('manager-2', 'manager-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('404s when the user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.deleteUser('missing', 'manager-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to suspend a manager', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'manager-1',
      role: 'MANAGER',
      status: 'ACTIVE',
    });
    await expect(
      service.setUserStatus('manager-1', 'SUSPENDED' as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
