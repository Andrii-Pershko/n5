import {
  assessListing,
  scoreAssetAgainstMandate,
  type Mandate,
} from './matching';

const mandate: Mandate = {
  countries: ['UK', 'LT'],
  categories: ['EMI', 'FINTECH'],
  licenses: ['SEMI', 'EMI'],
  ticketMinEur: 200_000,
  ticketMaxEur: 2_000_000,
};

describe('scoreAssetAgainstMandate', () => {
  it('scores a perfect UK SEMI fit at 100', () => {
    const result = scoreAssetAgainstMandate(
      {
        country: 'UK',
        category: 'FINTECH',
        licenseType: 'SEMI',
        priceEur: 1_000_000,
      },
      mandate,
    );
    expect(result.score).toBe(100);
    expect(result.reasons).toHaveLength(4);
  });

  it('scores zero when nothing overlaps', () => {
    const result = scoreAssetAgainstMandate(
      {
        country: 'US',
        category: 'CRYPTO',
        licenseType: 'MSB',
        priceEur: 12_000_000,
      },
      mandate,
    );
    expect(result.score).toBe(0);
  });
});

describe('assessListing', () => {
  it('rejects missing price and country', () => {
    const result = assessListing({ licenseType: 'MSO' });
    expect(result.errors.join(' ')).toMatch(/Jurisdiction/);
    expect(result.errors.join(' ')).toMatch(/price/);
  });

  it('warns when EMI listing has no IBAN', () => {
    const result = assessListing({
      country: 'LT',
      category: 'EMI',
      licenseType: 'EMI',
      regulator: 'Bank of Lithuania',
      priceEur: 800_000,
      included: ['Staff'],
    });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.some((item) => /IBAN/i.test(item))).toBe(true);
  });
});
