'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InquiryForm } from '@/components/inquiry/InquiryForm';
import { useT } from '@/i18n/useT';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { Asset } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const t = useT();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Asset>(`/assets/${id}`, { token })
      .then(setAsset)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : t('asset.notFound')),
      );
  }, [id, token]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!asset) {
    return <p className="text-muted">{t('asset.loading')}</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <article>
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em]">
          {asset.isTopDeal && <span className="font-semibold text-seller">{t('asset.topDeal')}</span>}
          {asset.isValidated && (
            <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold">{t('asset.validated')}</span>
          )}
        </div>
        <h1 className="mt-3 text-3xl">Asset ID #{asset.publicCode.replace('ND-', '')}</h1>
        <p className="mt-2 text-muted">{asset.title}</p>
        <p className="mt-6 text-3xl font-semibold text-foreground">{formatPrice(asset.priceEur)}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Row label={t('asset.country')} value={`${asset.countryName} (${asset.country})`} />
          <Row label={t('asset.licenseType')} value={`${asset.licenseType} · ${asset.licenseName}`} />
          <Row label={t('asset.businessType')} value={asset.category} />
          <Row label={t('asset.status')} value={asset.businessStatus.replace('_', ' ')} />
          <Row label={t('asset.regulator')} value={asset.regulator ?? t('common.na')} />
          <Row label={t('asset.employees')} value={asset.employees ?? t('common.na')} />
          <Row label={t('asset.yearOfIssue')} value={asset.yearOfIssue ?? t('common.na')} />
          <Row label={t('asset.seller')} value={asset.seller.name} />
        </dl>
        <p className="mt-6 text-sm leading-7 text-muted">{asset.summary}</p>
        <p className="mt-6 rounded-2xl border border-line bg-card p-4 text-xs leading-6 text-muted">
          {t('asset.disclaimer')}
        </p>
      </article>
      <aside className="space-y-4">
        {asset.match && (
          <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-gold">
              {t('asset.smartMatch', { score: asset.match.score })}
            </div>
            <div className="mt-1 text-3xl text-gold">{asset.match.score}%</div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {asset.match.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        {user?.role === 'BUYER' ? (
          <InquiryForm
            assetId={asset.id}
            placeholder={t('asset.inquirePlaceholder')}
          />
        ) : (
          <div className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
            {t('asset.signInToInquire')}
            <Link href="/signin" className="mt-3 block text-gold hover:text-gold-2">
              {t('nav.signIn')}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
