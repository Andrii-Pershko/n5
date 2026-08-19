'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { DEMO_ACCOUNTS } from '@/lib/types';
import { login, register } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useT();
  const { status, error, user } = useAppSelector((state) => state.auth);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  async function enter(email: string) {
    const result = await dispatch(login({ email, password: 'demo' }));
    if (login.fulfilled.match(result)) {
      router.push('/listings');
    }
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await dispatch(
      register({
        email: String(form.get('email')),
        password: String(form.get('password')),
        name: String(form.get('name')),
        company: String(form.get('company') || '') || undefined,
        country: String(form.get('country') || '') || undefined,
        role,
      }),
    );
    if (register.fulfilled.match(result)) {
      router.push(role === 'BUYER' ? '/profile' : '/sell');
    }
  }

  const demoCopy = {
    BUYER: { label: t('home.demoBuyer'), hint: t('home.demoBuyerHint') },
    SELLER: { label: t('home.demoSeller'), hint: t('home.demoSellerHint') },
    MANAGER: { label: t('home.demoManager'), hint: t('home.demoManagerHint') },
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.kicker')}</p>
        <h1 className="mt-4 max-w-xl text-4xl leading-tight text-foreground sm:text-5xl">
          {t('home.title')}
        </h1>
        <p className="mt-5 max-w-lg text-muted">
          {t('home.lead', { password: 'demo' })}
        </p>
        {user && (
          <p className="mt-4 text-sm text-gold">
            {t('home.sessionRestored', { name: user.name })}
          </p>
        )}
        <div className="mt-8 grid gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              onClick={() => void enter(account.email)}
              disabled={status === 'loading'}
              className="border border-line bg-card p-5 text-left transition hover:border-gold/50 hover:bg-gold/5"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-gold">
                {t(`roles.${account.role}`)}
              </div>
              <div className="mt-1 text-lg text-foreground">{demoCopy[account.role].label}</div>
              <div className="mt-1 text-sm text-muted">{demoCopy[account.role].hint}</div>
              <div className="mt-3 text-xs text-muted">{account.email}</div>
            </button>
          ))}
        </div>
      </section>
      <section className="border border-line bg-card p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.createAccount')}</p>
        <p className="mt-2 text-sm text-muted">{t('home.createHint')}</p>
        <form onSubmit={(event) => void onRegister(event)} className="mt-5 space-y-3">
          <Field name="name" label={t('home.name')} required />
          <Field name="email" label={t('home.email')} type="email" required />
          <Field name="password" label={t('home.password')} type="password" minLength={6} required />
          <Field name="company" label={t('home.company')} />
          <Field name="country" label={t('home.country')} placeholder="UK" />
          <div className="text-xs uppercase tracking-wider text-muted">
            {t('home.role')}
            <div className="mt-2 flex gap-2">
              {(['BUYER', 'SELLER'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    role === item
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-line text-muted hover:border-gold/50'
                  }`}
                >
                  {t(`roles.${item}`)}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={status === 'loading'}
            className="rounded-full bg-gold px-5 py-2 text-sm text-background hover:bg-gold-2 disabled:opacity-40"
          >
            {status === 'loading' ? t('home.creating') : t('home.submit')}
          </button>
        </form>
      </section>
    </div>
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
        className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
      />
    </label>
  );
}
