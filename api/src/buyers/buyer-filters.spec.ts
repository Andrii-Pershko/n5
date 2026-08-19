import { matchesBuyerFilters } from './buyer-filters';

const horizon = {
  countries: ['UK', 'LT', 'CY'],
  categories: ['EMI', 'PAYMENT'],
  licenses: ['EMI', 'SEMI'],
  ticketMinEur: 200_000,
  ticketMaxEur: 2_000_000,
  thesis: 'Acquiring EU/UK e-money licences',
  user: { name: 'Sofia Marin', company: 'Horizon Capital' },
};

describe('matchesBuyerFilters', () => {
  it('keeps a buyer when no filters are set', () => {
    expect(matchesBuyerFilters(horizon, {})).toBe(true);
  });

  it('filters by mandate jurisdiction', () => {
    expect(matchesBuyerFilters(horizon, { country: 'UK' })).toBe(true);
    expect(matchesBuyerFilters(horizon, { country: 'US' })).toBe(false);
  });

  it('filters by category and licence', () => {
    expect(matchesBuyerFilters(horizon, { category: 'emi' })).toBe(true);
    expect(matchesBuyerFilters(horizon, { license: 'SEMI' })).toBe(true);
    expect(matchesBuyerFilters(horizon, { license: 'VASP' })).toBe(false);
  });

  it('filters by overlapping ticket range', () => {
    expect(matchesBuyerFilters(horizon, { ticketMinEur: 500_000 })).toBe(true);
    expect(matchesBuyerFilters(horizon, { ticketMaxEur: 100_000 })).toBe(false);
  });

  it('searches thesis and company', () => {
    expect(matchesBuyerFilters(horizon, { q: 'horizon' })).toBe(true);
    expect(matchesBuyerFilters(horizon, { q: 'crypto' })).toBe(false);
  });
});
