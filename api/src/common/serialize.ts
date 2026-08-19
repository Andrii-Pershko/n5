import { Role, User, UserStatus } from '../../generated/prisma/client';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  role: Role;
  status: UserStatus;
};

export const CONFIDENTIAL_SELLER: Pick<PublicUser, 'name' | 'company'> = {
  name: 'Confidential',
  company: null,
};

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    company: user.company,
    country: user.country,
    role: user.role,
    status: user.status,
  };
}

export function parseList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}
