'use client';

import { CATEGORIES } from '@/lib/types';
import { useT } from '@/i18n/useT';
import { resetFilters, setFilters } from '@/store/slices/filtersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';

type CountryOption = { country: string; countryName: string; count: number };

export function AssetFilters({
  countries,
  showMatchSort,
}: {
  countries: CountryOption[];
  showMatchSort: boolean;
}) {
  const dispatch = useAppDispatch();
  const t = useT();
  const filters = useAppSelector((state) => state.filters);

  return (
    <div className="border border-line bg-card p-4">
      <div className="flex flex-wrap gap-2">
        <Checkbox
          checked={filters.category === ''}
          onChange={() => dispatch(setFilters({ category: '' }))}
        >
          {t('filters.all')}
        </Checkbox>
        {CATEGORIES.map((category) => (
          <Checkbox
            key={category}
            checked={filters.category === category}
            onChange={() =>
              dispatch(
                setFilters({
                  category: filters.category === category ? '' : category,
                }),
              )
            }
          >
            {category}
          </Checkbox>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs uppercase tracking-wider text-muted">
          {t('filters.search')}
          <input
            value={filters.q}
            onChange={(event) => dispatch(setFilters({ q: event.target.value }))}
            className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
            placeholder={t('filters.searchPlaceholder')}
          />
        </label>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('filters.country')}
          <Select
            value={filters.country}
            onChange={(country) => dispatch(setFilters({ country }))}
            placeholder={t('filters.allJurisdictions')}
            options={[
              { value: '', label: t('filters.allJurisdictions') },
              ...countries.map((item) => ({
                value: item.country,
                label: `${item.countryName} (${item.count})`,
              })),
            ]}
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('filters.businessStatus')}
          <Select
            value={filters.businessStatus}
            onChange={(businessStatus) =>
              dispatch(
                setFilters({
                  businessStatus: businessStatus as typeof filters.businessStatus,
                }),
              )
            }
            placeholder={t('filters.any')}
            options={[
              { value: '', label: t('filters.any') },
              { value: 'ACTIVE', label: t('filters.active') },
              { value: 'LICENSE_ONLY', label: t('filters.licenseOnly') },
            ]}
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('filters.sort')}
          <Select
            value={filters.sort}
            onChange={(sort) =>
              dispatch(setFilters({ sort: sort as typeof filters.sort }))
            }
            options={[
              { value: 'newest', label: t('filters.newest') },
              { value: 'price_desc', label: t('filters.priceDesc') },
              { value: 'price_asc', label: t('filters.priceAsc') },
              ...(showMatchSort
                ? [{ value: 'match', label: t('filters.bestMatch') }]
                : []),
            ]}
          />
        </div>
      </div>
      <button
        className="mt-3 text-sm text-gold transition hover:text-gold-2"
        onClick={() => dispatch(resetFilters())}
      >
        {t('filters.reset')}
      </button>
    </div>
  );
}
