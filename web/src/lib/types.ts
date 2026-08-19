export type Role = 'BUYER' | 'SELLER' | 'MANAGER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type AssetStatus = 'DRAFT' | 'PUBLISHED' | 'SUSPENDED';
export type BusinessCategory = 'BANK' | 'FINTECH' | 'PAYMENT' | 'EMI' | 'CRYPTO';
export type BusinessStatus = 'ACTIVE' | 'LICENSE_ONLY';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  company: string | null;
  country: string | null;
  role: Role;
  status: UserStatus;
};

export type MatchResult = {
  score: number;
  reasons: string[];
};

export type Asset = {
  id: string;
  publicCode: string;
  title: string;
  country: string;
  countryName: string;
  category: BusinessCategory;
  licenseType: string;
  licenseName: string;
  regulator: string | null;
  businessStatus: BusinessStatus;
  assetType: string;
  priceEur: number;
  employees: number | null;
  yearOfIssue: number | null;
  included: string[];
  summary: string;
  status: AssetStatus;
  isTopDeal: boolean;
  isValidated: boolean;
  createdAt: string;
  seller: PublicUser | { id: string; name: string; company: string | null };
  match?: MatchResult;
};

export type BuyerProfile = {
  userId: string;
  ticketMinEur: number;
  ticketMaxEur: number;
  countries: string[];
  categories: string[];
  licenses: string[];
  thesis: string;
  user: PublicUser;
  match?: MatchResult;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export type Inquiry = {
  id: string;
  message: string;
  matchScore: number | null;
  matchReasons: string[];
  status: string;
  createdAt: string;
  from: PublicUser;
  to: PublicUser;
  direction: 'in' | 'out';
  asset: {
    id: string;
    publicCode: string;
    title: string;
    countryName: string;
    priceEur: number;
  } | null;
};

export const CATEGORIES: BusinessCategory[] = [
  'BANK',
  'FINTECH',
  'PAYMENT',
  'EMI',
  'CRYPTO',
];

export const DEMO_ACCOUNTS = [
  {
    role: 'BUYER' as Role,
    email: 'buyer@n5deal.demo',
    label: 'Enter as Buyer',
    hint: 'Horizon Capital · EU/UK EMI mandate',
  },
  {
    role: 'SELLER' as Role,
    email: 'seller@n5deal.demo',
    label: 'Enter as Seller',
    hint: 'Apex License Partners · HK listings',
  },
  {
    role: 'MANAGER' as Role,
    email: 'manager@n5deal.demo',
    label: 'Enter as Manager',
    hint: 'N5Deal platform moderation',
  },
];
