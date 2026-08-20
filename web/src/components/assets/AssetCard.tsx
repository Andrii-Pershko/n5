import Link from 'next/link';
import type { Asset } from '@/lib/types';
import { classNames, formatPrice } from '@/lib/format';
import { useT } from '@/i18n/useT';

export function AssetCard({ asset }: { asset: Asset }) {
  const t = useT();
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-card p-5 shadow-[0_8px_30px_rgba(28,40,70,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
            {asset.isTopDeal && <span className="font-semibold text-seller">{t('asset.topDeal')}</span>}
            {asset.isValidated && (
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold">
                {t('asset.validated')}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-lg text-foreground">Asset ID #{asset.publicCode.replace('ND-', '')}</h2>
          <p className="mt-1 text-sm text-muted">{asset.title}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted">{t('asset.askingPrice')}</div>
          <div className="text-xl font-semibold text-foreground">{formatPrice(asset.priceEur)}</div>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <Meta label={t('asset.country')} value={`${asset.country} · ${asset.countryName}`} />
        <Meta label={t('asset.licenseType')} value={asset.licenseType} />
        <Meta label={t('asset.businessType')} value={asset.category} />
        <Meta label={t('asset.status')} value={asset.businessStatus.replace('_', ' ')} />
        <Meta label={t('asset.employees')} value={asset.employees ?? t('common.na')} />
        <Meta label={t('asset.seller')} value={asset.seller.name} />
      </dl>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {asset.included.map((item) => (
          <span key={item} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
            {item}
          </span>
        ))}
      </div>
      {asset.match && (
        <div
          className={classNames(
            'mt-4 text-sm',
            asset.match.score >= 70 ? 'text-gold' : 'text-muted',
          )}
        >
          {t('asset.smartMatch', { score: asset.match.score })}
          {asset.match.reasons.length > 0 && ` · ${asset.match.reasons[0]}`}
        </div>
      )}
      <div className="mt-5 flex gap-2">
        <Link
          href={`/listings/${asset.id}`}
          className="rounded-full bg-gold px-4 py-2 text-sm text-white hover:bg-gold-2"
        >
          {t('asset.view')}
        </Link>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
