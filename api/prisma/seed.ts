import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  BusinessCategory,
  BusinessStatus,
  PrismaClient,
  Role,
} from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://n5deal:n5deal@localhost:5003/n5deal',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log('Seed skipped — database already has users');
    return;
  }

  const password = await bcrypt.hash('demo', 10);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@n5deal.demo',
      password,
      name: 'Platform Manager',
      company: 'N5Deal',
      country: 'CY',
      role: Role.MANAGER,
    },
  });

  const sellerA = await prisma.user.create({
    data: {
      email: 'seller@n5deal.demo',
      password,
      name: 'Helena Kovacs',
      company: 'Apex License Partners',
      country: 'HK',
      role: Role.SELLER,
    },
  });

  const sellerB = await prisma.user.create({
    data: {
      email: 'seller2@n5deal.demo',
      password,
      name: 'James Whitford',
      company: 'Northstar Exits',
      country: 'UK',
      role: Role.SELLER,
    },
  });

  const buyerA = await prisma.user.create({
    data: {
      email: 'buyer@n5deal.demo',
      password,
      name: 'Sofia Marin',
      company: 'Horizon Capital',
      country: 'UK',
      role: Role.BUYER,
      buyerProfile: {
        create: {
          ticketMinEur: 200_000,
          ticketMaxEur: 2_000_000,
          countries: JSON.stringify(['UK', 'LT', 'CY', 'MT']),
          categories: JSON.stringify(['EMI', 'PAYMENT', 'FINTECH']),
          licenses: JSON.stringify(['EMI', 'SEMI', 'PSP']),
          thesis:
            'Acquiring EU/UK e-money and payment licences with existing operational teams. Preference for IBAN + multi-currency rails.',
        },
      },
    },
  });

  const extraBuyers = [
    {
      email: 'buyer2@n5deal.demo',
      name: 'Kenji Nakamura',
      company: 'Pacific License Fund',
      country: 'SG',
      ticketMinEur: 250_000,
      ticketMaxEur: 1_200_000,
      countries: ['HK', 'SG', 'AE'],
      categories: ['PAYMENT', 'CRYPTO'],
      licenses: ['MSO', 'MPI', 'VASP'],
      thesis:
        'Asia-focused mandate for money service operators and crypto VASPs with clean regulatory records.',
    },
    {
      email: 'buyer3@n5deal.demo',
      name: 'Amelia Brooks',
      company: 'Apex Banking Group',
      country: 'CH',
      ticketMinEur: 2_000_000,
      ticketMaxEur: 15_000_000,
      countries: ['UK', 'CH', 'US', 'LT'],
      categories: ['BANK', 'FINTECH'],
      licenses: ['BANK', 'SEMI'],
      thesis:
        'Family office looking for licensed banks or high-quality EMI platforms as a regulated entry point into Europe.',
    },
    {
      email: 'buyer4@n5deal.demo',
      name: 'Tomasz Lewandowski',
      company: 'Baltic Ventures',
      country: 'LT',
      ticketMinEur: 500_000,
      ticketMaxEur: 3_000_000,
      countries: ['LT', 'PL', 'CY', 'MT'],
      categories: ['EMI', 'CRYPTO'],
      licenses: ['EMI', 'VASP'],
      thesis:
        'Cee/Baltic specialist fund. Interested in EMI shells that can be turned into full operating fintechs.',
    },
    {
      email: 'buyer5@n5deal.demo',
      name: 'Nora Voss',
      company: 'Rhine Payments',
      country: 'DE',
      ticketMinEur: 300_000,
      ticketMaxEur: 1_500_000,
      countries: ['DE', 'LT', 'NL'],
      categories: ['EMI', 'PAYMENT'],
      licenses: ['EMI', 'PSP'],
      thesis: 'DACH acquirer looking for licensed EMI platforms with SEPA connectivity and a ready compliance stack.',
    },
    {
      email: 'buyer6@n5deal.demo',
      name: 'Luca Bianchi',
      company: 'Mediterraneo SPV',
      country: 'IT',
      ticketMinEur: 1_000_000,
      ticketMaxEur: 8_000_000,
      countries: ['IT', 'MT', 'CY', 'UK'],
      categories: ['BANK', 'FINTECH'],
      licenses: ['BANK', 'SEMI'],
      thesis: 'Italian family office acquiring regulated shells as a European banking entry point.',
    },
    {
      email: 'buyer7@n5deal.demo',
      name: 'Priya Shah',
      company: 'Gulf Digital Holdings',
      country: 'AE',
      ticketMinEur: 400_000,
      ticketMaxEur: 2_000_000,
      countries: ['AE', 'SG', 'HK'],
      categories: ['PAYMENT', 'CRYPTO'],
      licenses: ['MSO', 'VASP', 'MPI'],
      thesis: 'GCC mandate for payment and virtual-asset licences with existing staff and AML programmes.',
    },
    {
      email: 'buyer8@n5deal.demo',
      name: 'Erik Lindqvist',
      company: 'Nordic Licence Partners',
      country: 'SE',
      ticketMinEur: 250_000,
      ticketMaxEur: 1_800_000,
      countries: ['LT', 'PL', 'UK'],
      categories: ['EMI', 'FINTECH'],
      licenses: ['EMI', 'SEMI', 'SPI'],
      thesis: 'Nordic roll-up of small EMIs and payment institutions with a path to a full PI.',
    },
    {
      email: 'buyer9@n5deal.demo',
      name: 'Claire Dupont',
      company: 'Sequoia Europe Desk',
      country: 'FR',
      ticketMinEur: 600_000,
      ticketMaxEur: 4_000_000,
      countries: ['FR', 'UK', 'LT', 'CY'],
      categories: ['PAYMENT', 'EMI'],
      licenses: ['EMI', 'PSP'],
      thesis: 'Growth fund buying operating payment businesses, not dormant licences.',
    },
    {
      email: 'buyer10@n5deal.demo',
      name: 'David Chen',
      company: 'Harbour Bridge Capital',
      country: 'HK',
      ticketMinEur: 200_000,
      ticketMaxEur: 900_000,
      countries: ['HK', 'SG'],
      categories: ['PAYMENT', 'CRYPTO'],
      licenses: ['MSO', 'VASP'],
      thesis: 'Hong Kong desk focused on MSO and VASP assets with clean supervisory records.',
    },
    {
      email: 'buyer11@n5deal.demo',
      name: 'Ines Moreau',
      company: 'Iberia Fintech Fund',
      country: 'ES',
      ticketMinEur: 350_000,
      ticketMaxEur: 2_200_000,
      countries: ['ES', 'PT', 'MT', 'CY'],
      categories: ['EMI', 'PAYMENT'],
      licenses: ['EMI', 'SPI'],
      thesis: 'Iberian specialist searching for EMI/SPI platforms that can serve SME merchants.',
    },
    {
      email: 'buyer12@n5deal.demo',
      name: 'Omar Haddad',
      company: 'Levant Ventures',
      country: 'CY',
      ticketMinEur: 150_000,
      ticketMaxEur: 800_000,
      countries: ['CY', 'AE', 'MT'],
      categories: ['CRYPTO', 'FINTECH'],
      licenses: ['VASP', 'EMI'],
      thesis: 'Eastern Mediterranean crypto and fintech licences with existing AML policies.',
    },
  ];

  const seededBuyers = [buyerA];
  for (const buyer of extraBuyers) {
    seededBuyers.push(
      await prisma.user.create({
        data: {
          email: buyer.email,
          password,
          name: buyer.name,
          company: buyer.company,
          country: buyer.country,
          role: Role.BUYER,
          buyerProfile: {
            create: {
              ticketMinEur: buyer.ticketMinEur,
              ticketMaxEur: buyer.ticketMaxEur,
              countries: JSON.stringify(buyer.countries),
              categories: JSON.stringify(buyer.categories),
              licenses: JSON.stringify(buyer.licenses),
              thesis: buyer.thesis,
            },
          },
        },
      }),
    );
  }

  const assets = [
    {
      publicCode: 'ND-750',
      sellerId: sellerA.id,
      title: 'Hong Kong MSO — remittance operator since 2018',
      country: 'HK',
      countryName: 'Hong Kong',
      category: BusinessCategory.PAYMENT,
      licenseType: 'MSO',
      licenseName: 'Money Service Operator (MSO)',
      regulator: 'C&ED',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 440_000,
      employees: 3,
      yearOfIssue: 2018,
      included: ['Staff', 'Security', 'Multi-Currency'],
      summary:
        'Factual operation of a Hong Kong MSO (exchange remittance) since 2018. Renewed in 2025, valid until September 2027. Clean record, no penalties. Includes 3-person team. No corporate banking.',
      isTopDeal: true,
    },
    {
      publicCode: 'ND-749',
      sellerId: sellerA.id,
      title: 'Hong Kong MSO — operational office and 4-person team',
      country: 'HK',
      countryName: 'Hong Kong',
      category: BusinessCategory.PAYMENT,
      licenseType: 'MSO',
      licenseName: 'Money Service Operator (MSO)',
      regulator: 'C&ED',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 350_000,
      employees: 4,
      yearOfIssue: 2024,
      included: ['Staff', 'Security', 'Support', 'Multi-Currency'],
      summary:
        'Established 2024 Hong Kong MSO. Fully operational with office infrastructure, 4-person team, and 2026 licence renewal valid through 2028.',
      isTopDeal: true,
    },
    {
      publicCode: 'ND-741',
      sellerId: sellerB.id,
      title: 'UK SEMI — multi-currency accounts and merchant acquiring',
      country: 'UK',
      countryName: 'United Kingdom',
      category: BusinessCategory.FINTECH,
      licenseType: 'SEMI',
      licenseName: 'Small Electronic Money Institution (SEMI)',
      regulator: 'FCA',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 4_000_000,
      employees: 3,
      yearOfIssue: 2020,
      included: [
        'Staff',
        'Software',
        'Clients',
        'IBAN',
        'SWIFT',
        'Acquiring',
        'Payment Gateway',
        'Multi-Currency',
      ],
      summary:
        'UK-regulated fintech operating under a Small EMI licence issued by the FCA. Provides multi-currency digital accounts, payment execution, and merchant processing infrastructure.',
      isTopDeal: true,
    },
    {
      publicCode: 'ND-560',
      sellerId: sellerA.id,
      title: 'Hong Kong MSO licensed Q3 2024',
      country: 'HK',
      countryName: 'Hong Kong',
      category: BusinessCategory.PAYMENT,
      licenseType: 'MSO',
      licenseName: 'Money Service Operator (MSO)',
      regulator: 'C&ED',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 330_000,
      employees: null,
      yearOfIssue: 2024,
      included: ['Staff', 'Software', 'Security', 'Support'],
      summary: 'HK MSO licensed Q3 2024. Preliminary compliance check in progress.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-612',
      sellerId: sellerB.id,
      title: 'Lithuania EMI with IBAN issuing stack',
      country: 'LT',
      countryName: 'Lithuania',
      category: BusinessCategory.EMI,
      licenseType: 'EMI',
      licenseName: 'Electronic Money Institution',
      regulator: 'Bank of Lithuania',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 1_800_000,
      employees: 11,
      yearOfIssue: 2019,
      included: ['Staff', 'Software', 'IBAN', 'SWIFT', 'Clients', 'Multi-Currency'],
      summary:
        'Fully authorised Lithuanian EMI with live IBAN issuance, SEPA connectivity and an in-house compliance function. Suitable for a European payments roll-up.',
      isTopDeal: true,
    },
    {
      publicCode: 'ND-588',
      sellerId: sellerA.id,
      title: 'Cyprus VASP — exchange and custody-adjacent setup',
      country: 'CY',
      countryName: 'Cyprus',
      category: BusinessCategory.CRYPTO,
      licenseType: 'VASP',
      licenseName: 'Virtual Asset Service Provider',
      regulator: 'CySEC',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 900_000,
      employees: 6,
      yearOfIssue: 2023,
      included: ['Staff', 'Software', 'Security', 'Support'],
      summary:
        'Cyprus-registered VASP with exchange stack and AML programme. No proprietary token. Clean supervisory record.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-501',
      sellerId: sellerB.id,
      title: 'US MSB fintech with multi-state coverage',
      country: 'US',
      countryName: 'United States',
      category: BusinessCategory.FINTECH,
      licenseType: 'MSB',
      licenseName: 'Money Services Business',
      regulator: 'FinCEN',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 2_500_000,
      employees: 14,
      yearOfIssue: 2017,
      included: ['Staff', 'Software', 'Clients', 'Support'],
      summary:
        'US money services business with an existing customer book and compliance OS. Useful as a US entry vehicle for a European group.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-430',
      sellerId: sellerA.id,
      title: 'Singapore MPI — major payment institution',
      country: 'SG',
      countryName: 'Singapore',
      category: BusinessCategory.PAYMENT,
      licenseType: 'MPI',
      licenseName: 'Major Payment Institution',
      regulator: 'MAS',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 1_200_000,
      employees: 8,
      yearOfIssue: 2021,
      included: ['Staff', 'Software', 'Multi-Currency', 'Support'],
      summary:
        'MAS-licensed Major Payment Institution. Cross-border remittance plus merchant services. Office and key staff included.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-390',
      sellerId: sellerB.id,
      title: 'Malta credit institution licence — license only',
      country: 'MT',
      countryName: 'Malta',
      category: BusinessCategory.BANK,
      licenseType: 'BANK',
      licenseName: 'Credit Institution Licence',
      regulator: 'MFSA',
      businessStatus: BusinessStatus.LICENSE_ONLY,
      assetType: 'License Only',
      priceEur: 6_500_000,
      employees: 0,
      yearOfIssue: 2016,
      included: ['Software'],
      summary:
        'Dormant Maltese banking licence. No active book. Buyer must complete fit-and-proper and capitalisation. Introduced as a structured licence acquisition.',
      isTopDeal: true,
    },
    {
      publicCode: 'ND-277',
      sellerId: sellerA.id,
      title: 'Poland small payment institution',
      country: 'PL',
      countryName: 'Poland',
      category: BusinessCategory.EMI,
      licenseType: 'SPI',
      licenseName: 'Small Payment Institution',
      regulator: 'KNF',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 750_000,
      employees: 5,
      yearOfIssue: 2022,
      included: ['Staff', 'Software', 'Clients'],
      summary:
        'Polish SPI with a SME acquiring niche. Pathway to a full PI application already scoped with local counsel.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-198',
      sellerId: sellerB.id,
      title: 'UAE VASPs desk — DIFC-adjacent structure',
      country: 'AE',
      countryName: 'United Arab Emirates',
      category: BusinessCategory.CRYPTO,
      licenseType: 'VASP',
      licenseName: 'Virtual Asset Service Provider',
      regulator: 'VARA',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 1_100_000,
      employees: 7,
      yearOfIssue: 2024,
      included: ['Staff', 'Security', 'Support', 'Multi-Currency'],
      summary:
        'Dubai virtual asset desk with VARA authorisation in progress / granted for broker-dealer activity. Team and policies included.',
      isTopDeal: false,
    },
    {
      publicCode: 'ND-088',
      sellerId: sellerB.id,
      title: 'Swiss securities firm — wealth + payments adjacency',
      country: 'CH',
      countryName: 'Switzerland',
      category: BusinessCategory.BANK,
      licenseType: 'BANK',
      licenseName: 'Securities Firm / Banking-adjacent',
      regulator: 'FINMA',
      businessStatus: BusinessStatus.ACTIVE,
      assetType: 'Active Business (Licensed)',
      priceEur: 12_000_000,
      employees: 18,
      yearOfIssue: 2009,
      included: ['Staff', 'Clients', 'Software', 'Security'],
      summary:
        'Long-standing Swiss licensed firm. Conservative book, strong compliance culture. Suitable for a strategic banking buyer.',
      isTopDeal: false,
    },
  ];

  for (const asset of assets) {
    await prisma.asset.create({
      data: {
        ...asset,
        included: JSON.stringify(asset.included),
        isValidated: true,
      },
    });
  }

  const listings = await prisma.asset.findMany();
  const byCode = new Map(listings.map((asset) => [asset.publicCode, asset]));
  const listing = (code: string) => {
    const asset = byCode.get(code);
    if (!asset) {
      throw new Error(`Missing seeded asset ${code}`);
    }
    return asset;
  };
  const buyerAt = (index: number) => {
    const buyer = seededBuyers[index];
    if (!buyer) {
      throw new Error(`Missing seeded buyer ${index}`);
    }
    return buyer;
  };

  const inquirySeeds = [
    {
      from: buyerA,
      toId: listing('ND-612').sellerId,
      asset: listing('ND-612'),
      message:
        'Horizon Capital would like to open a confidential discussion on the Lithuanian EMI. Mandate fits on jurisdiction, licence and ticket. Please share a teaser under NDA.',
      matchScore: 100,
    },
    {
      from: buyerAt(1),
      toId: listing('ND-750').sellerId,
      asset: listing('ND-750'),
      message: 'Pacific License Fund is reviewing the Hong Kong MSO. Please share a teaser.',
      matchScore: 80,
    },
    {
      from: buyerAt(2),
      toId: listing('ND-390').sellerId,
      asset: listing('ND-390'),
      message: 'Apex Banking Group is interested in the Malta credit institution licence.',
      matchScore: 75,
    },
    {
      from: buyerAt(3),
      toId: listing('ND-588').sellerId,
      asset: listing('ND-588'),
      message: 'Baltic Ventures would like an intro on the Cyprus VASP.',
      matchScore: 70,
    },
    {
      from: buyerAt(4),
      toId: listing('ND-612').sellerId,
      asset: listing('ND-612'),
      message: 'Rhine Payments is evaluating the Lithuanian EMI as a SEPA entry vehicle.',
      matchScore: 85,
    },
    {
      from: buyerAt(5),
      toId: listing('ND-741').sellerId,
      asset: listing('ND-741'),
      message: 'Mediterraneo SPV wants a confidential intro on the UK SEMI.',
      matchScore: 90,
    },
    {
      from: buyerAt(6),
      toId: listing('ND-198').sellerId,
      asset: listing('ND-198'),
      message: 'Gulf Digital Holdings is looking at the UAE VASP desk.',
      matchScore: 80,
    },
    {
      from: buyerAt(7),
      toId: listing('ND-277').sellerId,
      asset: listing('ND-277'),
      message: 'Nordic Licence Partners would like materials on the Polish SPI.',
      matchScore: 65,
    },
    {
      from: buyerAt(8),
      toId: listing('ND-430').sellerId,
      asset: listing('ND-430'),
      message: 'Sequoia Europe Desk is reviewing the Singapore MPI.',
      matchScore: 60,
    },
    {
      from: buyerAt(9),
      toId: listing('ND-749').sellerId,
      asset: listing('ND-749'),
      message: 'Harbour Bridge Capital requests an intro on the operational HK MSO.',
      matchScore: 85,
    },
    {
      from: sellerA,
      toId: buyerAt(1).id,
      asset: listing('ND-750'),
      key: `buyer:${sellerA.id}:${buyerAt(1).id}`,
      message: 'Apex License Partners would like to introduce the Hong Kong MSO book to Pacific License Fund.',
      matchScore: 80,
    },
    {
      from: sellerB,
      toId: buyerAt(2).id,
      asset: listing('ND-390'),
      key: `buyer:${sellerB.id}:${buyerAt(2).id}`,
      message: 'Northstar Exits can share a teaser on the Malta licence with Apex Banking Group.',
      matchScore: 70,
    },
  ];

  for (const inquiry of inquirySeeds) {
    await prisma.inquiry.create({
      data: {
        threadKey:
          inquiry.key ?? `asset:${inquiry.from.id}:${inquiry.asset.id}`,
        fromUserId: inquiry.from.id,
        toUserId: inquiry.toId,
        assetId: inquiry.asset.id,
        message: inquiry.message,
        matchScore: inquiry.matchScore,
        matchReasons: JSON.stringify(['Seeded demo inquiry']),
      },
    });
  }

  console.log('Seeded N5Deal demo data', {
    manager: manager.email,
    seller: sellerA.email,
    buyer: buyerA.email,
    users: 3 + seededBuyers.length,
    buyers: seededBuyers.length,
    assets: assets.length,
    inquiries: inquirySeeds.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
