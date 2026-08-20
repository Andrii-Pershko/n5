'use client';

import { useEffect, useState } from 'react';
import { RoleGate } from '@/components/layout/RoleGate';
import { PAGE_SIZE, Pagination } from '@/components/ui/Pagination';
import { useT } from '@/i18n/useT';
import { api, queryString } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Inquiry, Paginated } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

export default function InboxPage() {
  return (
    <RoleGate roles={['BUYER', 'SELLER', 'MANAGER']}>
      <Inbox />
    </RoleGate>
  );
}

function Inbox() {
  const t = useT();
  const token = useAppSelector((state) => state.auth.token);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<Inquiry> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Paginated<Inquiry>>(`/inquiries${queryString({ page, limit: PAGE_SIZE })}`, {
      token,
    })
      .then(setData)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t('inbox.loadError')),
      );
  }, [token, page]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('inbox.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('inbox.title')}</h1>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data?.total === 0 && <p className="text-muted">{t('inbox.empty')}</p>}
      {data?.items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(28,40,70,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-gold">
                {item.direction === 'out' ? t('inbox.sent') : t('inbox.received')} · {item.status}
              </div>
              <h2 className="mt-1 text-lg">
                {item.direction === 'out' ? item.to.name : item.from.name}
                {item.asset ? ` · ${item.asset.publicCode}` : ''}
              </h2>
            </div>
            {item.matchScore != null && (
              <div className="text-sm text-gold">{t('inbox.match', { score: item.matchScore })}</div>
            )}
          </div>
          {item.asset && (
            <p className="mt-2 text-sm text-muted">
              {item.asset.title} · {item.asset.countryName} · {formatPrice(item.asset.priceEur)}
            </p>
          )}
          <p className="mt-3 text-sm leading-7">{item.message}</p>
        </article>
      ))}
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
