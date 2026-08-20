'use client';

import { useEffect, useState } from 'react';
import { AssetCard } from '@/components/assets/AssetCard';
import { AssetFilters } from '@/components/assets/AssetFilters';
import { PAGE_SIZE, Pagination } from '@/components/ui/Pagination';
import { useT } from '@/i18n/useT';
import { api, queryString } from '@/lib/api';
import type { Asset, Paginated } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

type ListResponse = Paginated<Asset> & {
  meta: { countries: { country: string; countryName: string; count: number }[] };
};

export default function ListingsPage() {
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const filters = useAppSelector((state) => state.filters);
  const t = useT();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const qs = queryString({
      q: filters.q,
      category: filters.category || undefined,
      country: filters.country || undefined,
      businessStatus: filters.businessStatus || undefined,
      sort: filters.sort,
      page,
      limit: PAGE_SIZE,
    });
    api<ListResponse>(`/assets${qs}`, { token })
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t('listings.loadError')),
      );
  }, [filters, token, page]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('listings.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('listings.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {t('listings.lead')}
          {user?.role === 'BUYER' ? t('listings.leadBuyer') : t('listings.leadGuest')}
        </p>
      </div>
      <AssetFilters
        countries={data?.meta.countries ?? []}
        showMatchSort={user?.role === 'BUYER'}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm text-muted">{t('listings.count', { count: data?.total ?? 0 })}</p>
      <div className="grid gap-4">
        {data?.items.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      {data && (
        <Pagination
          page={data.page}
          pageCount={data.pageCount}
          total={data.total}
          onPage={setPage}
        />
      )}
    </div>
  );
}
