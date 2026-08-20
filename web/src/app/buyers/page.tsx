'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BuyerFilters } from '@/components/buyers/BuyerFilters';
import { RoleGate } from '@/components/layout/RoleGate';
import { PAGE_SIZE, Pagination } from '@/components/ui/Pagination';
import { useT } from '@/i18n/useT';
import { api, queryString } from '@/lib/api';
import { formatTicket } from '@/lib/format';
import type { BuyerProfile, Paginated } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

type BuyersResponse = Paginated<BuyerProfile> & {
  meta: { countries: { country: string; count: number }[]; licenses: string[] };
};

export default function BuyersPage() {
  return (
    <RoleGate roles={['SELLER', 'MANAGER']}>
      <BuyersDirectory />
    </RoleGate>
  );
}

function BuyersDirectory() {
  const t = useT();
  const token = useAppSelector((state) => state.auth.token);
  const filters = useAppSelector((state) => state.buyerFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BuyersResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    api<BuyersResponse>(
      `/buyers${queryString({
        q: filters.q,
        category: filters.category || undefined,
        country: filters.country || undefined,
        license: filters.license || undefined,
        ticketMinEur: filters.ticketMinEur === '' ? undefined : filters.ticketMinEur,
        ticketMaxEur: filters.ticketMaxEur === '' ? undefined : filters.ticketMaxEur,
        page,
        limit: PAGE_SIZE,
      })}`,
      { token },
    )
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t('buyers.loadError')),
      );
  }, [filters, page, token, t]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('buyers.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('buyers.title')}</h1>
        <p className="mt-2 text-sm text-muted">{t('buyers.lead')}</p>
      </div>
      <BuyerFilters
        countries={data?.meta.countries ?? []}
        licenses={data?.meta.licenses ?? []}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-sm text-muted">{t('buyers.count', { count: data?.total ?? 0 })}</p>
      <div className="grid gap-4">
        {data?.items.map((buyer) => (
          <Link
            key={buyer.userId}
            href={`/buyers/${buyer.userId}`}
            className="rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(28,40,70,0.06)] hover:border-gold/40 hover:bg-gold/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg">{buyer.user.company ?? buyer.user.name}</h2>
                <p className="text-sm text-muted">{buyer.user.name}</p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted">
                  {t('buyers.ticket')}
                </div>
                <div className="text-gold">{formatTicket(buyer.ticketMinEur, buyer.ticketMaxEur)}</div>
                {buyer.match && (
                  <div className="mt-1 text-sm text-muted">
                    {t('buyers.match', { score: buyer.match.score })}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{buyer.thesis}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {buyer.countries.map((item) => (
                <Chip key={item} label={item} />
              ))}
              {buyer.categories.map((item) => (
                <Chip key={item} label={item} />
              ))}
            </div>
          </Link>
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

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{label}</span>
  );
}
