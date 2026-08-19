'use client';

import { useEffect, useState } from 'react';
import { RoleGate } from '@/components/layout/RoleGate';
import { Checkbox } from '@/components/ui/Checkbox';
import { NumberInput } from '@/components/ui/NumberInput';
import { useT } from '@/i18n/useT';
import { api } from '@/lib/api';
import { CATEGORIES, type BuyerProfile } from '@/lib/types';
import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  return (
    <RoleGate roles={['BUYER']}>
      <MandateForm />
    </RoleGate>
  );
}

function MandateForm() {
  const t = useT();
  const token = useAppSelector((state) => state.auth.token);
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [ticketMinEur, setTicketMinEur] = useState(0);
  const [ticketMaxEur, setTicketMaxEur] = useState(0);

  useEffect(() => {
    api<BuyerProfile>('/profile', { token })
      .then((next) => {
        setProfile(next);
        setCategories(next.categories);
        setTicketMinEur(next.ticketMinEur);
        setTicketMaxEur(next.ticketMaxEur);
      })
      .catch((err: unknown) =>
        setStatus(err instanceof Error ? err.message : t('profile.loadError')),
      );
  }, [token]);

  if (!profile) {
    return <p className="text-muted">{status || t('profile.loading')}</p>;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const countries = String(form.get('countries'))
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
    const licenses = String(form.get('licenses'))
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const updated = await api<BuyerProfile>('/profile', {
      method: 'PUT',
      token,
      body: {
        ticketMinEur,
        ticketMaxEur,
        countries,
        categories,
        licenses,
        thesis: form.get('thesis'),
      },
    });
    setProfile(updated);
    setCategories(updated.categories);
    setTicketMinEur(updated.ticketMinEur);
    setTicketMaxEur(updated.ticketMaxEur);
    setStatus(t('profile.saved'));
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('profile.kicker')}</p>
        <h1 className="mt-2 text-3xl">{t('profile.title')}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('profile.minTicket')}
          <NumberInput
            name="ticketMinEur"
            value={ticketMinEur}
            min={0}
            max={ticketMaxEur || undefined}
            step={50_000}
            onChange={setTicketMinEur}
          />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted">
          {t('profile.maxTicket')}
          <NumberInput
            name="ticketMaxEur"
            value={ticketMaxEur}
            min={ticketMinEur}
            step={50_000}
            onChange={setTicketMaxEur}
          />
        </div>
      </div>
      <label className="block text-xs uppercase tracking-wider text-muted">
        {t('profile.jurisdictions')}
        <input
          name="countries"
          defaultValue={profile.countries.join(', ')}
          className="mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none transition hover:border-gold/50 focus:border-gold"
        />
      </label>
      <fieldset>
        <legend className="text-xs uppercase tracking-wider text-muted">{t('profile.categories')}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Checkbox
              key={item}
              checked={categories.includes(item)}
              onChange={(checked) =>
                setCategories((current) =>
                  checked ? [...current, item] : current.filter((entry) => entry !== item),
                )
              }
            >
              {item}
            </Checkbox>
          ))}
        </div>
      </fieldset>
      <label className="block text-xs uppercase tracking-wider text-muted">
        {t('profile.licences')}
        <input
          name="licenses"
          defaultValue={profile.licenses.join(', ')}
          className="mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none transition hover:border-gold/50 focus:border-gold"
        />
      </label>
      <label className="block text-xs uppercase tracking-wider text-muted">
        {t('profile.thesis')}
        <textarea
          name="thesis"
          defaultValue={profile.thesis}
          rows={5}
          className="mt-1 w-full border border-line bg-card px-3 py-2 text-sm outline-none transition hover:border-gold/50 focus:border-gold"
        />
      </label>
      {status && <p className="text-sm text-gold">{status}</p>}
      <button className="rounded-full bg-gold px-5 py-2 text-sm text-background hover:bg-gold-2">
        {t('profile.save')}
      </button>
    </form>
  );
}
