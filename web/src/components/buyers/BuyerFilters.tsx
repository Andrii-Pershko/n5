'use client';

import { CATEGORIES } from '@/lib/types';
import { useT } from '@/i18n/useT';
import {
  resetBuyerFilters,
  setBuyerFilters,
} from '@/store/slices/buyerFiltersSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';

export function BuyerFilters({
  countries,
  licenses,
}: {
  countries: { country: string; count: number }[];
  licenses: string[];
}) {
  const dispatch = useAppDispatch();
  const t = useT();
  const filters = useAppSelector((state) => state.buyerFilters);

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-[0_8px_30px_rgba(28,40,70,0.06)]">
      <div className="flex flex-wrap gap-2">
        <Checkbox
          checked={filters.category === ''}
          onChange={() => dispatch(setBuyerFilters({ category: '' }))}
        >
          {t('filters.all')}
        </Checkbox>
        {CATEGORIES.map((category) => (
          <Checkbox
            key={category}
            checked={filters.category === category}
            onChange={() =>
              dispatch(
                setBuyerFilters({
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
            onChange={(event) => dispatch(setBuyerFilters({ q: event.target.value }))}
            className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
            placeholder={t('buyers.searchPlaceholder')}
          />
        </label>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('filters.country')}
          <Select
            value={filters.country}
            onChange={(country) => dispatch(setBuyerFilters({ country }))}
            placeholder={t('filters.allJurisdictions')}
            options={[
              { value: '', label: t('filters.allJurisdictions') },
              ...countries.map((item) => ({
                value: item.country,
                label: `${item.country} (${item.count})`,
              })),
            ]}
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('buyers.license')}
          <Select
            value={filters.license}
            onChange={(license) => dispatch(setBuyerFilters({ license }))}
            placeholder={t('buyers.allLicences')}
            options={[
              { value: '', label: t('buyers.allLicences') },
              ...licenses.map((license) => ({ value: license, label: license })),
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs uppercase tracking-wider text-muted">
            {t('buyers.minTicket')}
            <input
              type="number"
              min={0}
              value={filters.ticketMinEur}
              onChange={(event) =>
                dispatch(
                  setBuyerFilters({
                    ticketMinEur: event.target.value === '' ? '' : Number(event.target.value),
                  }),
                )
              }
              className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted">
            {t('buyers.maxTicket')}
            <input
              type="number"
              min={0}
              value={filters.ticketMaxEur}
              onChange={(event) =>
                dispatch(
                  setBuyerFilters({
                    ticketMaxEur: event.target.value === '' ? '' : Number(event.target.value),
                  }),
                )
              }
              className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
            />
          </label>
        </div>
      </div>
      <button
        className="mt-3 text-sm text-gold transition hover:text-gold-2"
        onClick={() => dispatch(resetBuyerFilters())}
      >
        {t('filters.reset')}
      </button>
    </div>
  );
}
