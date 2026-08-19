'use client';

import { useState } from 'react';
import { RoleGate } from '@/components/layout/RoleGate';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { useT } from '@/i18n/useT';
import { api } from '@/lib/api';
import { CATEGORIES, type BusinessCategory, type BusinessStatus } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

const INCLUDED = ['Staff', 'Software', 'Clients', 'IBAN', 'SWIFT', 'Acquiring', 'Security', 'Support', 'Multi-Currency'];

export default function SellPage() {
  return (
    <RoleGate roles={['SELLER']}>
      <PublishForm />
    </RoleGate>
  );
}

function PublishForm() {
  const t = useT();
  const token = useAppSelector((state) => state.auth.token);
  const [included, setIncluded] = useState<string[]>(['Staff']);
  const [category, setCategory] = useState<BusinessCategory>('PAYMENT');
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus>('ACTIVE');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    try {
      const result = await api<{ asset: { publicCode: string }; validation: { warnings: string[] } }>(
        '/assets',
        {
          method: 'POST',
          token,
          body: {
            title: form.get('title'),
            country: form.get('country'),
            countryName: form.get('countryName'),
            category,
            licenseType: form.get('licenseType'),
            licenseName: form.get('licenseName'),
            regulator: form.get('regulator'),
            businessStatus,
            assetType: form.get('assetType'),
            priceEur: Number(form.get('priceEur')),
            employees: form.get('employees') ? Number(form.get('employees')) : undefined,
            yearOfIssue: form.get('yearOfIssue') ? Number(form.get('yearOfIssue')) : undefined,
            included,
            summary: form.get('summary'),
          },
        },
      );
      setWarnings(result.validation.warnings);
      setDone(t('sell.published', { code: result.asset.publicCode }));
      setCategory('PAYMENT');
      setBusinessStatus('ACTIVE');
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sell.publishError'));
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('sell.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('sell.title')}</h1>
      </div>
      <Field name="title" label={t('sell.listingTitle')} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="country" label={t('sell.countryCode')} placeholder="HK" required />
        <Field name="countryName" label={t('sell.countryName')} placeholder="Hong Kong" required />
      </div>
      <div className="text-xs uppercase tracking-wider text-muted">
        {t('sell.category')}
        <Select
          name="category"
          value={category}
          onChange={(value) => setCategory(value as BusinessCategory)}
          options={CATEGORIES.map((item) => ({ value: item, label: item }))}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="licenseType" label={t('sell.licenseType')} placeholder="MSO / EMI / SEMI" required />
        <Field name="licenseName" label={t('sell.licenseName')} required />
      </div>
      <Field name="regulator" label={t('sell.regulator')} placeholder="FCA, C&ED…" />
      <div className="text-xs uppercase tracking-wider text-muted">
        {t('sell.businessStatus')}
        <Select
          name="businessStatus"
          value={businessStatus}
          onChange={(value) => setBusinessStatus(value as BusinessStatus)}
          options={[
            { value: 'ACTIVE', label: t('filters.active') },
            { value: 'LICENSE_ONLY', label: t('filters.licenseOnly') },
          ]}
        />
      </div>
      <Field name="assetType" label={t('sell.assetType')} defaultValue="Active Business (Licensed)" required />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field name="priceEur" label={t('sell.price')} type="number" required />
        <Field name="employees" label={t('sell.employees')} type="number" />
        <Field name="yearOfIssue" label={t('sell.yearOfIssue')} type="number" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted">{t('sell.included')}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {INCLUDED.map((item) => (
            <Checkbox
              key={item}
              checked={included.includes(item)}
              onChange={(checked) =>
                setIncluded((current) =>
                  checked ? [...current, item] : current.filter((entry) => entry !== item),
                )
              }
            >
              {item}
            </Checkbox>
          ))}
        </div>
      </div>
      <label className="block text-xs uppercase tracking-wider text-muted">
        {t('sell.summary')}
        <textarea
          name="summary"
          required
          rows={5}
          className="mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none transition hover:border-gold/50 focus:border-gold"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {done && <p className="text-sm text-gold">{done}</p>}
      {warnings.map((warning) => (
        <p key={warning} className="text-sm text-gold-2">
          {t('sell.smartValidation', { warning })}
        </p>
      ))}
      <button className="rounded-full bg-gold px-5 py-2 text-sm text-background hover:bg-gold-2">
        {t('sell.publish')}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted">
      {label}
      <input
        name={name}
        {...props}
        className="mt-1 w-full border border-line bg-card px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
      />
    </label>
  );
}
