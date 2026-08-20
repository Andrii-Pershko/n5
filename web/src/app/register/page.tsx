'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Field } from '@/components/ui/Field';
import { useT } from '@/i18n/useT';
import { register } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const t = useT();
  const { status, error, user } = useAppSelector((state) => state.auth);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const skipGuestRedirect = useRef(false);

  useEffect(() => {
    if (user && !skipGuestRedirect.current) {
      router.replace('/listings');
    }
  }, [user, router]);

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    skipGuestRedirect.current = true;
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

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.createAccount')}</p>
      <h1 className="mt-4 text-4xl leading-tight text-foreground">{t('home.createTitle')}</h1>
      <p className="mt-4 text-muted">{t('home.createHint')}</p>
      <section className="mt-8 border border-line bg-card p-6">
        <form onSubmit={(event) => void onRegister(event)} className="space-y-3">
          <Field name="name" label={t('home.name')} required autoComplete="name" />
          <Field name="email" label={t('home.email')} type="email" required autoComplete="email" />
          <Field
            name="password"
            label={t('home.password')}
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
          />
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
      <p className="mt-5 text-sm text-muted">
        {t('home.haveAccount')}{' '}
        <Link href="/signin" className="text-gold hover:text-gold-2">
          {t('home.signInTitle')}
        </Link>
      </p>
    </div>
  );
}
