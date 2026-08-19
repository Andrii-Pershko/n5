'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { RoleGate } from '@/components/layout/RoleGate';
import { useT } from '@/i18n/useT';
import { api } from '@/lib/api';
import { formatTicket } from '@/lib/format';
import type { BuyerProfile } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

export default function BuyerDetailPage() {
  return (
    <RoleGate roles={['SELLER', 'MANAGER']}>
      <BuyerDetail />
    </RoleGate>
  );
}

function BuyerDetail() {
  const { id } = useParams<{ id: string }>();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const t = useT();
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<BuyerProfile>(`/buyers/${id}`, { token })
      .then(setBuyer)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t('buyers.loadError')),
      );
  }, [id, token]);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!buyer) {
    return <p className="text-muted">{t('buyers.loading')}</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <article>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('buyers.mandate')}</p>
        <h1 className="mt-2 text-3xl">{buyer.user.company ?? buyer.user.name}</h1>
        <p className="mt-2 text-muted">{buyer.user.name}</p>
        <p className="mt-6 text-gold">{formatTicket(buyer.ticketMinEur, buyer.ticketMaxEur)}</p>
        <p className="mt-4 text-sm leading-7 text-muted">{buyer.thesis}</p>
        <div className="mt-6 space-y-3 text-sm">
          <p>{t('buyers.jurisdictions')}: {buyer.countries.join(', ')}</p>
          <p>{t('buyers.categories')}: {buyer.categories.join(', ')}</p>
          <p>{t('buyers.licences')}: {buyer.licenses.join(', ')}</p>
        </div>
      </article>
      {user?.role === 'SELLER' && (
        <InquiryForm
          buyerId={buyer.userId}
          placeholder={t('buyers.contactPlaceholder')}
        />
      )}
    </div>
  );
}
