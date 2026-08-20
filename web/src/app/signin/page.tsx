'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Field } from '@/components/ui/Field';
import { useT } from '@/i18n/useT';
import { classNames } from '@/lib/format';
import { DEMO_ACCOUNTS } from '@/lib/types';
import { login } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useT();
  const { status, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      router.replace('/listings');
    }
  }, [user, router]);

  async function enter(email: string) {
    const result = await dispatch(login({ email, password: 'demo' }));
    if (login.fulfilled.match(result)) {
      router.push('/listings');
    }
  }

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await dispatch(
      login({
        email: String(form.get('email')),
        password: String(form.get('password')),
      }),
    );
    if (login.fulfilled.match(result)) {
      router.push('/listings');
    }
  }

  const demoCopy = {
    BUYER: t('home.demoBuyer'),
    SELLER: t('home.demoSeller'),
    MANAGER: t('home.demoManager'),
  };

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.signInTitle')}</p>
      <h1 className="mt-4 text-4xl leading-tight text-foreground">{t('home.demoKicker')}</h1>
      <p className="mt-4 text-sm text-muted">{t('home.signInHint', { password: 'demo' })}</p>

      <p className="mt-8 text-xs uppercase tracking-[0.22em] text-muted">{t('home.demoAccounts')}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            onClick={() => void enter(account.email)}
            disabled={status === 'loading'}
            className={classNames(
              'rounded-2xl border bg-card px-2 py-3 text-center transition disabled:opacity-40',
              account.role === 'BUYER' && 'border-gold/35 hover:border-gold hover:bg-gold/5',
              account.role === 'SELLER' && 'border-seller/35 hover:border-seller hover:bg-seller/5',
              account.role === 'MANAGER' && 'border-partner/35 hover:border-partner hover:bg-partner/5',
            )}
          >
            <div
              className={classNames(
                'text-[10px] uppercase tracking-[0.16em]',
                account.role === 'BUYER' && 'text-gold',
                account.role === 'SELLER' && 'text-seller',
                account.role === 'MANAGER' && 'text-partner',
              )}
            >
              {t(`roles.${account.role}`)}
            </div>
            <div className="mt-1 text-xs leading-snug text-foreground sm:text-sm">
              {demoCopy[account.role]}
            </div>
            <div className="mt-1 truncate text-[10px] text-muted">{account.email}</div>
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-card p-6 text-left shadow-[0_8px_30px_rgba(28,40,70,0.06)]">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.signInTitle')}</p>
        <p className="mt-2 text-sm text-muted">{t('home.classicHint')}</p>
        <form onSubmit={(event) => void onLogin(event)} className="mt-5 space-y-3">
          <Field name="email" label={t('home.email')} type="email" required autoComplete="email" />
          <Field
            name="password"
            label={t('home.passwordShort')}
            type="password"
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={status === 'loading'}
            className="rounded-full bg-gold px-5 py-2 text-sm text-white hover:bg-gold-2 disabled:opacity-40"
          >
            {status === 'loading' ? t('home.signingIn') : t('home.signInSubmit')}
          </button>
        </form>
        <p className="mt-5 text-sm text-muted">
          {t('home.needAccount')}{' '}
          <Link href="/register" className="text-gold hover:text-gold-2">
            {t('home.createAccount')}
          </Link>
        </p>
      </section>
    </div>
  );
}
