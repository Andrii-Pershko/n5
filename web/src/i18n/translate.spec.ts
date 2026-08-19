import { describe, expect, it } from 'vitest';
import { translate } from './translate';

describe('translate', () => {
  it('resolves nested English keys', () => {
    expect(translate('en', 'nav.listings')).toBe('Listings');
  });

  it('resolves Ukrainian keys', () => {
    expect(translate('uk', 'nav.listings')).toBe('Лістинги');
  });

  it('interpolates variables', () => {
    expect(translate('en', 'home.sessionRestored', { name: 'Sofia' })).toBe(
      'Session restored for Sofia. Filters and auth persist after refresh.',
    );
  });

  it('returns the path when a key is missing', () => {
    expect(translate('en', 'does.not.exist')).toBe('does.not.exist');
  });
});
